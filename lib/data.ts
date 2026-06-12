import { createClient } from "@/lib/supabase/server";
import {
  getCachedActiveCategories,
  getCachedPublishedLessons,
  getCachedPublishedSeminars,
} from "@/lib/cache/public-data";
import {
  CATEGORY_PUBLIC_SELECT,
  LESSON_DETAIL_SELECT,
  LESSON_LIST_SELECT,
  SEMINAR_LIST_SELECT,
} from "@/lib/data/selects";
import type { Category, Lesson, Seminar } from "@/lib/types";

export async function getActiveCategories(): Promise<Category[]> {
  return getCachedActiveCategories();
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_PUBLIC_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Category | null) ?? null;
}

export async function getPublishedLessons(categoryId?: string): Promise<Lesson[]> {
  return getCachedPublishedLessons(categoryId);
}

export async function getLessonBySlug(
  genreId: string,
  lessonNo: string,
): Promise<Lesson | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_DETAIL_SELECT)
    .eq("category_id", genreId)
    .eq("lesson_no", lessonNo)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return (data as Lesson | null) ?? null;
}

export async function getPublishedSeminars(): Promise<Seminar[]> {
  return getCachedPublishedSeminars();
}

export async function getSeminarById(id: string): Promise<Seminar | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seminars")
    .select(SEMINAR_LIST_SELECT)
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return (data as Seminar | null) ?? null;
}

export async function searchLessons(query: string): Promise<Lesson[]> {
  const supabase = await createClient();
  const q = query.trim();
  if (!q) return [];
  const term = `%${q}%`;
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_LIST_SELECT)
    .eq("status", "published")
    .or(`title.ilike.${term},excerpt.ilike.${term},content_plain.ilike.${term},category_id.ilike.${term}`)
    .limit(50);
  if (error) throw error;
  return (data ?? []) as Lesson[];
}

export function thumbnailSrc(lesson: {
  thumbnail_url?: string | null;
  thumbnail_path?: string | null;
}): string {
  if (lesson.thumbnail_url) return lesson.thumbnail_url;
  if (lesson.thumbnail_path) {
    const p = lesson.thumbnail_path.startsWith("/")
      ? lesson.thumbnail_path
      : `/${lesson.thumbnail_path}`;
    return p;
  }
  return "/thumbs/ai-basics-01.png";
}

export function lessonHref(categoryId: string, lessonNo: string): string {
  return `/lessons/${categoryId}/${lessonNo}`;
}

export async function getLessonsForCategoryPage(
  categoryId: string,
  categories: Category[],
): Promise<Lesson[]> {
  const children = categories.filter((c) => c.parent_id === categoryId);
  if (children.length === 0) {
    return getPublishedLessons(categoryId);
  }
  const childIds = children.map((c) => c.id);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_LIST_SELECT)
    .eq("status", "published")
    .in("category_id", childIds)
    .order("category_id")
    .order("lesson_no");
  if (error) throw error;
  return (data ?? []) as Lesson[];
}

export async function getRelatedLessons(lesson: Lesson, limit = 4): Promise<Lesson[]> {
  const supabase = await createClient();
  const same = (await getPublishedLessons(lesson.category_id)).filter((l) => l.id !== lesson.id);
  const related: Lesson[] = [...same.slice(0, limit)];

  if (related.length >= limit) return related;

  const { data: links } = await supabase
    .from("lesson_cross_links")
    .select("target_category_id")
    .eq("lesson_id", lesson.id);
  const catIds = [...new Set((links ?? []).map((r) => r.target_category_id as string))];
  if (catIds.length === 0) return related.slice(0, limit);

  const { data: cross } = await supabase
    .from("lessons")
    .select(LESSON_LIST_SELECT)
    .eq("status", "published")
    .in("category_id", catIds)
    .neq("id", lesson.id)
    .order("lesson_no")
    .limit(limit * 2);

  const seen = new Set(related.map((l) => l.id));
  for (const row of (cross ?? []) as Lesson[]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    related.push(row);
    if (related.length >= limit) break;
  }
  return related.slice(0, limit);
}

export async function getUserFavoriteLessonIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("favorites").select("lesson_id").eq("user_id", userId);
  return new Set((data ?? []).map((r) => r.lesson_id as string));
}

export async function getLessonEngagement(
  userId: string | null,
  lessonId: string,
): Promise<{ liked: boolean; favorited: boolean }> {
  if (!userId) return { liked: false, favorited: false };
  const supabase = await createClient();
  const [likeRes, favRes] = await Promise.all([
    supabase.from("lesson_likes").select("lesson_id").eq("user_id", userId).eq("lesson_id", lessonId).maybeSingle(),
    supabase.from("favorites").select("lesson_id").eq("user_id", userId).eq("lesson_id", lessonId).maybeSingle(),
  ]);
  return { liked: Boolean(likeRes.data), favorited: Boolean(favRes.data) };
}
