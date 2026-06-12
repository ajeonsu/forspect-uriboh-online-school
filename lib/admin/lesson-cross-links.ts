import { validateCategoryIds } from "@/lib/cms/category-mutate";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function setLessonCrossLinks(
  supabase: SupabaseClient,
  lessonId: string,
  categoryIds: string[] | undefined,
) {
  if (categoryIds === undefined) return;
  await supabase.from("lesson_cross_links").delete().eq("lesson_id", lessonId);
  const unique = [...new Set(categoryIds.map((id) => id.trim()).filter(Boolean))];
  if (unique.length === 0) return;
  await validateCategoryIds(supabase, unique);
  const { error } = await supabase.from("lesson_cross_links").insert(
    unique.map((target_category_id) => ({ lesson_id: lessonId, target_category_id })),
  );
  if (error) throw error;
}

export async function getLessonCrossLinkIds(supabase: SupabaseClient, lessonId: string) {
  const { data } = await supabase
    .from("lesson_cross_links")
    .select("target_category_id")
    .eq("lesson_id", lessonId);
  return (data ?? []).map((r) => r.target_category_id as string);
}
