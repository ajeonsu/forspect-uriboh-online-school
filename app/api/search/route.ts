import { jsonError, jsonOk } from "@/lib/api";
import { LESSON_LIST_SELECT, SEMINAR_LIST_SELECT } from "@/lib/data/selects";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return jsonOk({ lessons: [], seminars: [] });

  try {
    const admin = createAdminClient();
    await admin.from("analytics_events").insert({ event_type: "search", query: q });
  } catch {
    /* analytics optional if migrations not applied */
  }

  const supabase = await createClient();
  const term = `%${q}%`;
  const [lessonsRes, seminarsRes] = await Promise.all([
    supabase
      .from("lessons")
      .select(LESSON_LIST_SELECT)
      .eq("status", "published")
      .or(`title.ilike.${term},excerpt.ilike.${term},content_plain.ilike.${term},category_id.ilike.${term}`)
      .limit(50),
    supabase
      .from("seminars")
      .select(SEMINAR_LIST_SELECT)
      .eq("status", "published")
      .or(`title.ilike.${term},description.ilike.${term}`)
      .limit(20),
  ]);

  if (lessonsRes.error) return jsonError(lessonsRes.error.message, 500);
  if (seminarsRes.error) return jsonError(seminarsRes.error.message, 500);

  return jsonOk({ lessons: lessonsRes.data ?? [], seminars: seminarsRes.data ?? [] });
}
