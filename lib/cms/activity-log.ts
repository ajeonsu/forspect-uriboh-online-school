import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAdminActivity(
  supabase: SupabaseClient,
  input: {
    adminId: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  await supabase.from("admin_activity_logs").insert({
    admin_id: input.adminId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
  });
}
