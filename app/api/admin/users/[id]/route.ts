import { jsonError, jsonOk, requireApiAdmin } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { profileRoleSchema } from "@/lib/validation";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  const parsed = profileRoleSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError(parsed.error.message, 400);

  const supabase = createAdminClient();
  const { data: target } = await supabase.from("profiles").select("id, role").eq("id", id).maybeSingle();
  if (!target) return jsonError("User not found", 404);

  if (target.role === "admin" && parsed.data.role === "user") {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) <= 1) {
      return jsonError("Cannot demote the last admin", 400);
    }
  }

  const { data, error: dbError } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", id)
    .select("id, email, role")
    .single();
  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk({ profile: data });
}
