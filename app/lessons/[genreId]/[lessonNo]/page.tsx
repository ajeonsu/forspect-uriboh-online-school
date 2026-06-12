import { notFound } from "next/navigation";
import { CatNav } from "@/components/CatNav";
import { LessonDetailShell } from "@/components/lesson/LessonDetailShell";
import { getSessionProfile } from "@/lib/auth";
import {
  getCategoryById,
  getLessonBySlug,
  getLessonEngagement,
  getPublishedLessons,
  getRelatedLessons,
  getUserFavoriteLessonIds,
} from "@/lib/data";

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ genreId: string; lessonNo: string }>;
}) {
  const { genreId, lessonNo } = await params;
  const [category, lesson, siblings, profile] = await Promise.all([
    getCategoryById(genreId),
    getLessonBySlug(genreId, lessonNo),
    getPublishedLessons(genreId),
    getSessionProfile(),
  ]);

  if (!category || !lesson) notFound();

  const [related, engagement, favoriteIds] = await Promise.all([
    getRelatedLessons(lesson),
    getLessonEngagement(profile?.id ?? null, lesson.id),
    profile ? getUserFavoriteLessonIds(profile.id) : Promise.resolve(new Set<string>()),
  ]);

  const relatedWithCat = await Promise.all(
    related.map(async (l) => ({
      lesson: l,
      category: (await getCategoryById(l.category_id)) ?? category,
    })),
  );

  const relatedCategories = new Map(
    relatedWithCat.map(({ lesson: l, category: c }) => [l.category_id, c]),
  );

  return (
    <>
      <CatNav activeId={genreId} />
      <LessonDetailShell
        lesson={lesson}
        category={category}
        siblings={siblings}
        related={relatedWithCat.map((r) => r.lesson)}
        relatedCategories={relatedCategories}
        genreId={genreId}
        showEngagement
        favorited={engagement.favorited}
        liked={engagement.liked}
        favoriteIds={favoriteIds}
        backHref={`/lessons/${genreId}`}
        backLabel={`← ${category.label}の授業一覧へ戻る`}
      />
    </>
  );
}
