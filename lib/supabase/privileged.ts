import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Server client with user JWT, or service role when configured (admin API writes). */
export async function createPrivilegedServerClient() {
  try {
    return createAdminClient();
  } catch {
    return await createClient();
  }
}
