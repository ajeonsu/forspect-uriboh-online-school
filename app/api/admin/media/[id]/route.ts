import { jsonError, jsonOk, requireApiEditor } from "@/lib/api";
import { editorScope } from "@/lib/cms/editor-scope";
import { assertOwnsRow } from "@/lib/cms/editor-scope";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const scope = editorScope(profile!);
  const { id } = await ctx.params;
  const supabase = await createPrivilegedServerClient();
  const { data: asset } = await supabase
    .from("media_assets")
    .select("file_path, uploaded_by")
    .eq("id", id)
    .maybeSingle();
  if (!asset) return jsonError("Not found", 404);
  try {
    assertOwnsRow(scope, asset, "media");
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Forbidden", 403);
  }

  const [bucket, ...rest] = asset.file_path.split("/");
  const objectPath = rest.join("/");
  if (bucket && objectPath) {
    await supabase.storage.from(bucket).remove([objectPath]);
  }
  const { error: dbError } = await supabase.from("media_assets").delete().eq("id", id);
  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk({ ok: true });
}
