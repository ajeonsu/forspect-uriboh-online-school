import type { EditorScope } from "@/lib/cms/editor-scope";
import { createAdminClient } from "@/lib/supabase/admin";

export type AnalyticsSummary = {
  isContributorView: boolean;
  topSearches: { query: string; count: number }[];
  topLessonsByFavorites: { lesson_id: string; title: string; count: number }[];
  topLessonsByLikes: { lesson_id: string; title: string; count: number }[];
  topLessonsByViews: { lesson_id: string; title: string; count: number }[];
  eventsLast7Days: { day: string; count: number }[];
};

export async function getAnalyticsSummary(scope: EditorScope): Promise<AnalyticsSummary> {
  const supabase = createAdminClient();
  const isContributorView = !scope.isAdmin;

  let ownedLessonIds: string[] | null = null;
  if (isContributorView) {
    const { data: owned } = await supabase
      .from("lessons")
      .select("id")
      .eq("created_by", scope.userId);
    ownedLessonIds = (owned ?? []).map((r) => r.id as string);
  }

  const [searches, favorites, likes, events, viewsRows] = await Promise.all([
    isContributorView
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from("analytics_events")
          .select("query")
          .eq("event_type", "search")
          .not("query", "is", null)
          .limit(500),
    supabase.from("favorites").select("lesson_id"),
    supabase.from("lesson_likes").select("lesson_id"),
    isContributorView
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from("analytics_events")
          .select("created_at")
          .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    isContributorView
      ? supabase
          .from("lessons")
          .select("id, title, views_count")
          .eq("created_by", scope.userId)
          .order("views_count", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const analyticsDbError = searches.error ?? events.error;
  if (
    analyticsDbError &&
    (analyticsDbError.code === "42P01" ||
      /analytics_events|does not exist|schema cache/i.test(analyticsDbError.message))
  ) {
    throw new Error(analyticsDbError.message);
  }

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

  const ownedSet = ownedLessonIds ? new Set(ownedLessonIds) : null;

  async function topLessons(table: "favorites" | "lesson_likes") {
    const rows = table === "favorites" ? favorites.data : likes.data;
    const counts = new Map<string, number>();
    for (const r of rows ?? []) {
      const id = r.lesson_id as string;
      if (ownedSet && !ownedSet.has(id)) continue;
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

  const topLessonsByViews = (viewsRows.data ?? []).map((l) => ({
    lesson_id: l.id as string,
    title: l.title as string,
    count: (l.views_count as number) ?? 0,
  }));

  const dayCounts = new Map<string, number>();
  for (const e of events.data ?? []) {
    const day = (e.created_at as string).slice(0, 10);
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
  }
  const eventsLast7Days = [...dayCounts.entries()]
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day));

  return {
    isContributorView,
    topSearches,
    topLessonsByFavorites: await topLessons("favorites"),
    topLessonsByLikes: await topLessons("lesson_likes"),
    topLessonsByViews,
    eventsLast7Days,
  };
}
