import { jsonOk, requireApiUser } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const { error, profile } = await requireApiUser();
  if (error) return error;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return jsonOk({
    user: user ? { id: user.id, email: user.email ?? null } : null,
    profile,
    role: profile.role,
  });
}
