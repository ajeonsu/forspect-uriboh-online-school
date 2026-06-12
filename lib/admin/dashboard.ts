import type { EditorScope } from "@/lib/cms/editor-scope";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";

export type AdminDashboardStats = {
  totalUsers: number;
  totalGenres: number;
  totalLessons: number;
  publishedLessons: number;
  draftLessons: number;
  archivedLessons: number;
  totalSeminars: number;
  pendingSeminars: number;
  newsletterSubscribers: number;
  totalFavorites: number;
  totalLikes: number;
  recentEdits: { id: string; title: string; status: string; updated_at: string }[];
  topViewed: { id: string; title: string; views_count: number }[];
  topLiked: { id: string; title: string; likes_count: number }[];
  recentEvents: { id: string; event_type: string; query: string | null; created_at: string }[];
  isContributorView: boolean;
};

export async function getAdminDashboardStats(scope: EditorScope): Promise<AdminDashboardStats> {
  const supabase = await createPrivilegedServerClient();
  const isContributorView = !scope.isAdmin;

  const lessonCount = (status?: string) => {
    let q = supabase.from("lessons").select("id", { count: "exact", head: true });
    if (isContributorView) q = q.eq("created_by", scope.userId);
    if (status) q = q.eq("status", status);
    return q;
  };

  let recentEditsQuery = supabase
    .from("lessons")
    .select("id, title, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(8);
  let topViewedQuery = supabase
    .from("lessons")
    .select("id, title, views_count")
    .order("views_count", { ascending: false })
    .limit(5);
  let topLikedQuery = supabase
    .from("lessons")
    .select("id, title, likes_count")
    .order("likes_count", { ascending: false })
    .limit(5);

  let seminarsQuery = supabase.from("seminars").select("id", { count: "exact", head: true });
  let pendingSeminarsQuery = supabase
    .from("seminars")
    .select("id", { count: "exact", head: true })
    .eq("moderation_status", "pending");

  let genresQuery = supabase.from("categories").select("id", { count: "exact", head: true });

  if (isContributorView) {
    recentEditsQuery = recentEditsQuery.eq("created_by", scope.userId);
    topViewedQuery = topViewedQuery.eq("created_by", scope.userId);
    topLikedQuery = topLikedQuery.eq("created_by", scope.userId);
    seminarsQuery = seminarsQuery.eq("created_by", scope.userId);
    pendingSeminarsQuery = pendingSeminarsQuery.eq("created_by", scope.userId);
    genresQuery = genresQuery.eq("created_by", scope.userId);
  }

  const [
    users,
    genres,
    totalLessonsRes,
    publishedLessonsRes,
    draftLessonsRes,
    archivedLessonsRes,
    seminars,
    pendingSeminars,
    subscribers,
    favorites,
    likes,
    events,
    recentEdits,
    topViewed,
    topLiked,
  ] = await Promise.all([
    isContributorView
      ? Promise.resolve({ count: 0 })
      : supabase.from("profiles").select("id", { count: "exact", head: true }),
    genresQuery,
    lessonCount(),
    lessonCount("published"),
    lessonCount("draft"),
    lessonCount("archived"),
    seminarsQuery,
    pendingSeminarsQuery,
    isContributorView
      ? Promise.resolve({ count: 0 })
      : supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
    isContributorView
      ? Promise.resolve({ count: 0 })
      : supabase.from("favorites").select("user_id", { count: "exact", head: true }),
    isContributorView
      ? Promise.resolve({ count: 0 })
      : supabase.from("lesson_likes").select("user_id", { count: "exact", head: true }),
    isContributorView
      ? Promise.resolve({ data: [] })
      : supabase
          .from("analytics_events")
          .select("id, event_type, query, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
    recentEditsQuery,
    topViewedQuery,
    topLikedQuery,
  ]);

  return {
    totalUsers: users.count ?? 0,
    totalGenres: genres.count ?? 0,
    totalLessons: totalLessonsRes.count ?? 0,
    publishedLessons: publishedLessonsRes.count ?? 0,
    draftLessons: draftLessonsRes.count ?? 0,
    archivedLessons: archivedLessonsRes.count ?? 0,
    totalSeminars: seminars.count ?? 0,
    pendingSeminars: pendingSeminars.count ?? 0,
    newsletterSubscribers: subscribers.count ?? 0,
    totalFavorites: favorites.count ?? 0,
    totalLikes: likes.count ?? 0,
    recentEdits: recentEdits.data ?? [],
    topViewed: topViewed.data ?? [],
    topLiked: topLiked.data ?? [],
    recentEvents: events.data ?? [],
    isContributorView,
  };
}
