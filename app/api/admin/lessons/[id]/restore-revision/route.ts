import { jsonError, jsonOk, requireApiEditor } from "@/lib/api";
import { logAdminActivity } from "@/lib/cms/activity-log";
import { editorScope } from "@/lib/cms/editor-scope";
import { createLessonRevision } from "@/lib/cms/lesson-revisions";
import { assertLessonAccess } from "@/lib/cms/scoped-db";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";
import { z } from "zod";

const bodySchema = z.object({ revision_id: z.string().uuid() });

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const scope = editorScope(profile!);
  const { id } = await ctx.params;
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError(parsed.error.message, 400);

  const supabase = await createPrivilegedServerClient();
  try {
    await assertLessonAccess(supabase, scope, id);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Forbidden", 403);
  }
  const { data: rev } = await supabase
    .from("lesson_revisions")
    .select("*")
    .eq("id", parsed.data.revision_id)
    .eq("lesson_id", id)
    .maybeSingle();
  if (!rev) return jsonError("Revision not found", 404);

  const { data: current } = await supabase.from("lessons").select("*").eq("id", id).maybeSingle();
  if (current) await createLessonRevision(supabase, current, profile!.id);

  const { data, error: dbError } = await supabase
    .from("lessons")
    .update({
      title: rev.title,
      excerpt: rev.summary,
      content_json: rev.content_json,
      content_html: sanitizeArticleHtml(rev.content_html),
      thumbnail_url: rev.thumbnail_url,
      status: rev.status,
      updated_by: profile!.id,
    })
    .eq("id", id)
    .select()
    .single();
  if (dbError) return jsonError(dbError.message, 500);

  await logAdminActivity(supabase, {
    adminId: profile!.id,
    action: "lesson.restore_revision",
    entityType: "lesson",
    entityId: id,
    metadata: { revision_id: rev.id },
  });
  return jsonOk({ lesson: data });
}
