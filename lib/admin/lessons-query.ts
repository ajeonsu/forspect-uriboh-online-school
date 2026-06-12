import type { EditorScope } from "@/lib/cms/editor-scope";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";

export type LessonListSort =
  | "newest"
  | "oldest"
  | "views"
  | "likes"
  | "popular_rank";

export type LessonListParams = {
  q?: string;
  category_id?: string;
  status?: string;
  sort?: LessonListSort;
  page?: number;
  limit?: number;
};

export async function queryAdminLessons(params: LessonListParams, scope?: EditorScope) {
  const supabase = await createPrivilegedServerClient();
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, Math.max(1, params.limit ?? 20));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("lessons")
    .select(
      "id, category_id, lesson_no, slug, title, excerpt, status, thumbnail_url, views_count, likes_count, popular_rank, updated_at, published_at",
      { count: "exact" },
    );

  if (!scope?.isAdmin && scope?.userId) {
    query = query.eq("created_by", scope.userId);
  }
  if (params.category_id) query = query.eq("category_id", params.category_id);
  if (params.status) query = query.eq("status", params.status);
  if (params.q?.trim()) {
    const term = `%${params.q.trim()}%`;
    query = query.or(`title.ilike.${term},excerpt.ilike.${term},content_plain.ilike.${term}`);
  }

  switch (params.sort ?? "newest") {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "views":
      query = query.order("views_count", { ascending: false });
      break;
    case "likes":
      query = query.order("likes_count", { ascending: false });
      break;
    case "popular_rank":
      query = query.order("popular_rank", { ascending: true, nullsFirst: false });
      break;
    default:
      query = query.order("updated_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { lessons: data ?? [], total: count ?? 0, page, limit };
}
