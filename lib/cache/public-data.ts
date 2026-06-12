import { unstable_cache } from "next/cache";
import { createPublicReadClient } from "@/lib/supabase/public-read";
import { getSupabasePublicConfig } from "@/lib/supabase/env";
import {
  CATEGORY_PUBLIC_SELECT,
  LESSON_LIST_SELECT,
  SEMINAR_LIST_SELECT,
} from "@/lib/data/selects";
import type { Category, Lesson, Seminar } from "@/lib/types";

const REVALIDATE_SECONDS = 120;

async function fetchActiveCategories(): Promise<Category[]> {
  if (!getSupabasePublicConfig()) return [];
  const supabase = createPublicReadClient();
  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_PUBLIC_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

async function fetchPublishedLessons(categoryId?: string): Promise<Lesson[]> {
  if (!getSupabasePublicConfig()) return [];
  const supabase = createPublicReadClient();
  let q = supabase
    .from("lessons")
    .select(LESSON_LIST_SELECT)
    .eq("status", "published")
    .order("lesson_no");
  if (categoryId) q = q.eq("category_id", categoryId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Lesson[];
}

async function fetchPublishedSeminars(): Promise<Seminar[]> {
  if (!getSupabasePublicConfig()) return [];
  const supabase = createPublicReadClient();
  const query = supabase
    .from("seminars")
    .select(SEMINAR_LIST_SELECT)
    .eq("status", "published")
    .or("moderation_status.eq.approved,moderation_status.is.null");
  const { data, error } = await query.order("start_at", { ascending: true });
  if (error) {
    const fallback = await supabase
      .from("seminars")
      .select(SEMINAR_LIST_SELECT)
      .eq("status", "published")
      .order("start_at", { ascending: true });
    if (fallback.error) throw fallback.error;
    return (fallback.data ?? []) as Seminar[];
  }
  return (data ?? []) as Seminar[];
}

export const getCachedActiveCategories = unstable_cache(
  fetchActiveCategories,
  ["public-categories"],
  { revalidate: REVALIDATE_SECONDS, tags: ["categories"] },
);

export async function getCachedPublishedLessons(categoryId?: string): Promise<Lesson[]> {
  return unstable_cache(
    async () => fetchPublishedLessons(categoryId),
    ["public-lessons", categoryId ?? "all"],
    { revalidate: REVALIDATE_SECONDS, tags: ["lessons"] },
  )();
}

export const getCachedPublishedSeminars = unstable_cache(
  fetchPublishedSeminars,
  ["public-seminars"],
  { revalidate: REVALIDATE_SECONDS, tags: ["seminars"] },
);
