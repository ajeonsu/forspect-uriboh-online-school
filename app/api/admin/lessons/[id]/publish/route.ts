import { jsonError, jsonOk, requireApiEditor } from "@/lib/api";
import { revalidatePublicContent } from "@/lib/revalidate-public";
import { logAdminActivity } from "@/lib/cms/activity-log";
import { editorScope } from "@/lib/cms/editor-scope";
import { createLessonRevision } from "@/lib/cms/lesson-revisions";
import { assertLessonAccess } from "@/lib/cms/scoped-db";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const scope = editorScope(profile!);
  const { id } = await ctx.params;
  const supabase = await createPrivilegedServerClient();
  let existing;
  try {
    existing = await assertLessonAccess(supabase, scope, id);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Forbidden", 403);
  }
  if (!existing.title?.trim() || !existing.category_id || !existing.lesson_no) {
    return jsonError("Title, category, and lesson number are required to publish", 400);
  }

  const { data, error: dbError } = await supabase
    .from("lessons")
    .update({
      status: "published",
      published_at: existing.published_at ?? new Date().toISOString(),
      updated_by: profile!.id,
    })
    .eq("id", id)
    .select()
    .single();
  if (dbError) return jsonError(dbError.message, 500);

  await createLessonRevision(supabase, existing, profile!.id);
  await logAdminActivity(supabase, {
    adminId: profile!.id,
    action: "lesson.publish",
    entityType: "lesson",
    entityId: id,
  });
  revalidatePublicContent({
    categoryId: data.category_id,
    lessonNo: data.lesson_no,
  });
  return jsonOk({ lesson: data });
}
