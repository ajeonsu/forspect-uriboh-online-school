import { createAdminClient } from "@/lib/supabase/admin";

export type AnalyticsSummary = {
  topSearches: { query: string; count: number }[];
  topLessonsByFavorites: { lesson_id: string; title: string; count: number }[];
  topLessonsByLikes: { lesson_id: string; title: string; count: number }[];
  eventsLast7Days: { day: string; count: number }[];
};

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const supabase = createAdminClient();

  const [searches, favorites, likes, events] = await Promise.all([
    supabase.from("analytics_events").select("query").eq("event_type", "search").not("query", "is", null).limit(500),
    supabase.from("favorites").select("lesson_id"),
    supabase.from("lesson_likes").select("lesson_id"),
    supabase
      .from("analytics_events")
      .select("created_at")
      .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
  ]);

  const searchCounts = new Map<string, number>();
  for (const row of searches.data ?? []) {
    const q = (row.query as string)?.trim();
    if (!q) continue;
    searchCounts.set(q, (searchCounts.get(q) ?? 0) + 1);
  }
  const topSearches = [...searchCounts.entries()]
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  async function topLessons(table: "favorites" | "lesson_likes") {
    const rows = table === "favorites" ? favorites.data : likes.data;
    const counts = new Map<string, number>();
    for (const r of rows ?? []) {
      const id = r.lesson_id as string;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    const ids = top.map(([id]) => id);
    const { data: lessons } = ids.length
      ? await supabase.from("lessons").select("id, title").in("id", ids)
      : { data: [] };
    const titles = new Map((lessons ?? []).map((l) => [l.id, l.title]));
    return top.map(([lesson_id, count]) => ({
      lesson_id,
      title: titles.get(lesson_id) ?? lesson_id,
      count,
    }));
  }

  const dayCounts = new Map<string, number>();
  for (const e of events.data ?? []) {
    const day = (e.created_at as string).slice(0, 10);
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
  }
  const eventsLast7Days = [...dayCounts.entries()]
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day));

  return {
    topSearches,
    topLessonsByFavorites: await topLessons("favorites"),
    topLessonsByLikes: await topLessons("lesson_likes"),
    eventsLast7Days,
  };
}
