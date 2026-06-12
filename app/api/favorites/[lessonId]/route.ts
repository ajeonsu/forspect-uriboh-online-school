import { jsonError, jsonOk, requireApiUser } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(_req: Request, ctx: { params: Promise<{ lessonId: string }> }) {
  const { error, profile } = await requireApiUser();
  if (error) return error;
  const { lessonId } = await ctx.params;
  const supabase = await createClient();
  const { error: dbError } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", profile!.id)
    .eq("lesson_id", lessonId);
  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk({ ok: true });
}
