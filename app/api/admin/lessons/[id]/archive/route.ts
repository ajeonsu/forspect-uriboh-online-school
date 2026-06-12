import { jsonError, jsonOk, requireApiEditor } from "@/lib/api";
import { revalidatePublicContent } from "@/lib/revalidate-public";
import { logAdminActivity } from "@/lib/cms/activity-log";
import { editorScope } from "@/lib/cms/editor-scope";
import { assertLessonAccess } from "@/lib/cms/scoped-db";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
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
  const { data, error: dbError } = await supabase
    .from("lessons")
    .update({ status: "archived", updated_by: profile!.id })
    .eq("id", id)
    .select()
    .single();
  if (dbError) return jsonError(dbError.message, 500);
  await logAdminActivity(supabase, {
    adminId: profile!.id,
    action: "lesson.archive",
    entityType: "lesson",
    entityId: id,
  });
  revalidatePublicContent({
    categoryId: data.category_id,
    lessonNo: data.lesson_no,
  });
  return jsonOk({ lesson: data });
}
