import { jsonError, jsonOk, requireApiEditor } from "@/lib/api";
import { queryAdminLessons } from "@/lib/admin/lessons-query";
import { withApiTiming } from "@/lib/dev/api-timing";
import { logAdminActivity } from "@/lib/cms/activity-log";
import { friendlyDbMessage, validateCategoryIds, validateLessonCategory } from "@/lib/cms/category-mutate";
import { editorScope } from "@/lib/cms/editor-scope";
import { prepareLessonPatch } from "@/lib/cms/lesson-mutate";
import { setLessonCrossLinks } from "@/lib/admin/lesson-cross-links";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";
import { lessonSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const scope = editorScope(profile!);
  const url = new URL(request.url);
  try {
    const result = await withApiTiming("GET /api/admin/lessons", () =>
      queryAdminLessons(
        {
          q: url.searchParams.get("q") ?? undefined,
          category_id: url.searchParams.get("category_id") ?? undefined,
          status: url.searchParams.get("status") ?? undefined,
          sort: (url.searchParams.get("sort") as "newest") ?? "newest",
          page: Number(url.searchParams.get("page") ?? "1"),
          limit: Number(url.searchParams.get("limit") ?? "20"),
        },
        scope,
      ),
    );
    return jsonOk(result);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Query failed", 500);
  }
}

export async function POST(request: Request) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const parsed = lessonSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const { cross_category_ids, autosave: _a, create_revision: _c, ...body } = parsed.data;
  const supabase = await createPrivilegedServerClient();
  try {
    await validateLessonCategory(supabase, body.category_id);
    if (cross_category_ids?.length) {
      await validateCategoryIds(supabase, cross_category_ids);
    }
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Invalid category", 400);
  }

  const insert = {
    ...prepareLessonPatch(body),
    content_html: sanitizeArticleHtml(body.content_html ?? ""),
    status: body.status ?? "draft",
    created_by: profile!.id,
    updated_by: profile!.id,
    published_at: body.status === "published" ? new Date().toISOString() : null,
  };
  const { data, error: dbError } = await supabase.from("lessons").insert(insert).select().single();
  if (dbError) return jsonError(friendlyDbMessage(dbError.message), 500);
  if (cross_category_ids) {
    try {
      await setLessonCrossLinks(supabase, data.id, cross_category_ids);
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : "Cross-links failed", 500);
    }
  }
  await logAdminActivity(supabase, {
    adminId: profile!.id,
    action: "lesson.create",
    entityType: "lesson",
    entityId: data.id,
  });
  return jsonOk({ lesson: data }, 201);
}
