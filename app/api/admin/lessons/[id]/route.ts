import { jsonError, jsonOk, requireApiEditor } from "@/lib/api";
import { revalidatePublicContent } from "@/lib/revalidate-public";
import { getLessonCrossLinkIds, setLessonCrossLinks } from "@/lib/admin/lesson-cross-links";
import { logAdminActivity } from "@/lib/cms/activity-log";
import { friendlyDbMessage, validateCategoryIds, validateLessonCategory } from "@/lib/cms/category-mutate";
import { editorScope } from "@/lib/cms/editor-scope";
import { assertLessonAccess, getLessonForEditor } from "@/lib/cms/scoped-db";
import { maybeCreateRevision, prepareLessonPatch } from "@/lib/cms/lesson-mutate";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";
import { lessonSchema } from "@/lib/validation";
import type { SupabaseClient } from "@supabase/supabase-js";

async function getLessonDetail(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from("lessons").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const cross_category_ids = await getLessonCrossLinkIds(supabase, id);
  return { ...data, cross_category_ids };
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const scope = editorScope(profile!);
  const { id } = await ctx.params;
  const supabase = await createPrivilegedServerClient();
  try {
    const row = await getLessonForEditor(supabase, scope, id);
    if (!row) return jsonError("Not found", 404);
    const lesson = await getLessonDetail(supabase, id);
    return jsonOk({ lesson });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Load failed", 500);
  }
}

async function patchLesson(request: Request, id: string) {
  const { error, profile } = await requireApiEditor();
  if (error) return { error };
  const scope = editorScope(profile!);
  const parsed = lessonSchema.partial().safeParse(await request.json());
  if (!parsed.success) return { error: jsonError(parsed.error.message, 400) };
  const { cross_category_ids, autosave, create_revision, ...rest } = parsed.data;
  const patch = prepareLessonPatch(rest);
  patch.updated_by = profile!.id;

  if (rest.status === "published" && !rest.published_at) {
    patch.published_at = new Date().toISOString();
  }

  const supabase = await createPrivilegedServerClient();
  try {
    await assertLessonAccess(supabase, scope, id);
  } catch (e) {
    return { error: jsonError(e instanceof Error ? e.message : "Forbidden", 403) };
  }

  try {
    if (typeof rest.category_id === "string") {
      await validateLessonCategory(supabase, rest.category_id);
    }
    if (cross_category_ids?.length) {
      await validateCategoryIds(supabase, cross_category_ids);
    }
  } catch (e) {
    return { error: jsonError(e instanceof Error ? e.message : "Invalid category", 400) };
  }

  const { data, error: dbError } = await supabase.from("lessons").update(patch).eq("id", id).select().single();
  if (dbError) return { error: jsonError(friendlyDbMessage(dbError.message), 500) };

  if (cross_category_ids !== undefined) {
    try {
      await setLessonCrossLinks(supabase, id, cross_category_ids);
    } catch (e) {
      return { error: jsonError(e instanceof Error ? e.message : "Cross-links failed", 500) };
    }
  }

  await maybeCreateRevision(
    supabase,
    {
      id,
      title: data.title,
      excerpt: data.excerpt,
      content_json: data.content_json,
      content_html: data.content_html,
      thumbnail_url: data.thumbnail_url,
      status: data.status,
    },
    profile!.id,
    { autosave, createRevision: create_revision },
  );

  if (!autosave) {
    await logAdminActivity(supabase, {
      adminId: profile!.id,
      action: "lesson.update",
      entityType: "lesson",
      entityId: id,
      metadata: { status: data.status },
    });
    if (data.status === "published" || rest.status === "published" || rest.status === "archived") {
      revalidatePublicContent({
        categoryId: data.category_id,
        lessonNo: data.lesson_no,
      });
    }
  }

  const lesson = await getLessonDetail(supabase, id);
  return { lesson };
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const result = await patchLesson(request, id);
  if (result.error) return result.error;
  return jsonOk({ lesson: result.lesson });
}

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return PATCH(request, ctx);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const scope = editorScope(profile!);
  const { id } = await ctx.params;
  const supabase = await createPrivilegedServerClient();
  try {
    await assertLessonAccess(supabase, scope, id);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Forbidden", 403);
  }
  const { error: dbError } = await supabase.from("lessons").delete().eq("id", id);
  if (dbError) return jsonError(dbError.message, 500);
  await logAdminActivity(supabase, {
    adminId: profile!.id,
    action: "lesson.delete",
    entityType: "lesson",
    entityId: id,
  });
  return jsonOk({ ok: true });
}
