import { jsonError, jsonOk, requireApiEditor } from "@/lib/api";
import { editorScope } from "@/lib/cms/editor-scope";
import { getSeminarForEditor } from "@/lib/cms/scoped-db";
import { prepareSeminarPatch } from "@/lib/cms/seminar-mutate";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";
import { seminarSchema } from "@/lib/validation";

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const scope = editorScope(profile!);
  const { id } = await ctx.params;
  const parsed = seminarSchema.partial().safeParse(await request.json());
  if (!parsed.success) return jsonError(parsed.error.message, 400);
  const supabase = await createPrivilegedServerClient();
  const existing = await getSeminarForEditor(supabase, scope, id);
  if (!existing) return jsonError("Not found", 404);

  const row = prepareSeminarPatch(parsed.data);
  if (!scope.isAdmin && row.moderation_status === "approved") {
    delete row.moderation_status;
  }

  const { data, error: dbError } = await supabase
    .from("seminars")
    .update({ ...row, updated_by: profile!.id })
    .eq("id", id)
    .select()
    .single();
  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk({ seminar: data });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const scope = editorScope(profile!);
  const { id } = await ctx.params;
  const supabase = await createPrivilegedServerClient();
  const existing = await getSeminarForEditor(supabase, scope, id);
  if (!existing) return jsonError("Not found", 404);
  const { error: dbError } = await supabase.from("seminars").delete().eq("id", id);
  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk({ ok: true });
}
