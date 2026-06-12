import { jsonError, jsonOk, requireApiEditor } from "@/lib/api";
import { editorScope } from "@/lib/cms/editor-scope";
import { prepareSeminarPatch } from "@/lib/cms/seminar-mutate";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";
import { seminarSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const scope = editorScope(profile!);
  const supabase = await createPrivilegedServerClient();
  let query = supabase
    .from("seminars")
    .select("id, title, status, moderation_status, start_at, end_at, thumbnail_url, updated_at")
    .order("updated_at", { ascending: false });
  if (!scope.isAdmin) query = query.eq("created_by", scope.userId);
  const { data, error: dbError } = await query;
  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk({ seminars: data ?? [] });
}

export async function POST(request: Request) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const scope = editorScope(profile!);
  const parsed = seminarSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const supabase = await createPrivilegedServerClient();
  const row = prepareSeminarPatch(parsed.data);
  if (!scope.isAdmin) {
    row.moderation_status = "pending";
    row.status = "draft";
  }
  const { data, error: dbError } = await supabase
    .from("seminars")
    .insert({ ...row, created_by: profile!.id, updated_by: profile!.id })
    .select()
    .single();
  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk({ seminar: data }, 201);
}
