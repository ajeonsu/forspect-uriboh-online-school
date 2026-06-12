import { jsonError, jsonOk, requireApiEditor } from "@/lib/api";
import { editorScope } from "@/lib/cms/editor-scope";
import { getLessonForEditor } from "@/lib/cms/scoped-db";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const scope = editorScope(profile!);
  const { id } = await ctx.params;
  const supabase = await createPrivilegedServerClient();
  const lesson = await getLessonForEditor(supabase, scope, id);
  if (!lesson) return jsonError("Not found", 404);
  const { data, error: dbError } = await supabase
    .from("lesson_revisions")
    .select("id, title, status, edited_by, created_at, summary, thumbnail_url")
    .eq("lesson_id", id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk({ revisions: data ?? [] });
}
