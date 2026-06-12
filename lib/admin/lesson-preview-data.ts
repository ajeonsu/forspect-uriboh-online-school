import type { EditorScope } from "@/lib/cms/editor-scope";
import { getLessonForEditor } from "@/lib/cms/scoped-db";
import { getCategoryById } from "@/lib/data";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";
import type { Category, Lesson } from "@/lib/types";

export type AdminLessonPreviewBundle = {
  lesson: Lesson;
  category: Category;
  siblings: Lesson[];
  related: Lesson[];
  relatedCategories: Map<string, Category>;
};

export async function getAdminLessonPreviewBundle(
  lessonId: string,
  scope: EditorScope,
): Promise<AdminLessonPreviewBundle | null> {
  const supabase = await createPrivilegedServerClient();
  const lesson = await getLessonForEditor(supabase, scope, lessonId);
  if (!lesson) return null;

  const category =
    (await getCategoryById(lesson.category_id)) ??
    ({
      id: lesson.category_id,
      label: lesson.category_id,
      title: lesson.category_id,
      sort_order: 0,
      is_active: true,
    } as Category);

  const { data: siblings } = await supabase
    .from("lessons")
    .select("*")
    .eq("category_id", lesson.category_id)
    .order("lesson_no");

  const siblingList = (siblings ?? []) as Lesson[];
  const same = siblingList.filter((l) => l.id !== lesson.id).slice(0, 4);
  const { data: links } = await supabase
    .from("lesson_cross_links")
    .select("target_category_id")
    .eq("lesson_id", lesson.id);

  const catIds = [...new Set((links ?? []).map((r) => r.target_category_id as string))];
  let related = [...same];
  if (catIds.length > 0 && related.length < 4) {
    const { data: cross } = await supabase
      .from("lessons")
      .select("*")
      .in("category_id", catIds)
      .neq("id", lesson.id)
      .order("lesson_no")
      .limit(4);
    related = [...related, ...((cross ?? []) as Lesson[])].slice(0, 4);
  }

  const relatedCategories = new Map<string, Category>();
  for (const l of related) {
    if (!relatedCategories.has(l.category_id)) {
      const c = await getCategoryById(l.category_id);
      if (c) relatedCategories.set(l.category_id, c);
    }
  }

  return {
    lesson: lesson as Lesson,
    category,
    siblings: siblingList,
    related,
    relatedCategories,
  };
}
