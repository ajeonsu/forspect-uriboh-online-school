import { createAdminClient } from "@/lib/supabase/admin";

/** Persist a search query for admin analytics (best-effort; never throws). */
export async function recordSearchQuery(query: string): Promise<void> {
  const q = query.trim();
  if (!q) return;
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("analytics_events")
      .insert({ event_type: "search", query: q });
    if (error) {
      console.warn("[analytics] search insert failed:", error.message);
    }
  } catch (e) {
    console.warn("[analytics] search insert skipped:", e);
  }
}
