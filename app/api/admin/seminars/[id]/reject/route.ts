import { jsonError, jsonOk, requireApiAdmin } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireApiAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("seminars")
    .update({ moderation_status: "rejected", updated_by: profile!.id })
    .eq("id", id)
    .select()
    .single();
  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk({ seminar: data });
}
