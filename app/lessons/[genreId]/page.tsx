import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CatNav } from "@/components/CatNav";
import { LessonCard } from "@/components/LessonCard";
import { getSessionProfile } from "@/lib/auth";
import {
  getActiveCategories,
  getCategoryById,
  getLessonsForCategoryPage,
  getUserFavoriteLessonIds,
} from "@/lib/data";

export default async function LessonCategoryPage({
  params,
}: {
  params: Promise<{ genreId: string }>;
}) {
  const { genreId } = await params;
  if (genreId === "ai") redirect("/lessons/ai-chatgpt");

  const category = await getCategoryById(genreId);
  if (!category) notFound();

  const [categories, profile] = await Promise.all([getActiveCategories(), getSessionProfile()]);
  const lessonsResolved = await getLessonsForCategoryPage(genreId, categories);
  const favoriteIds = profile ? await getUserFavoriteLessonIds(profile.id) : new Set<string>();
  const parent = category.parent_id ? categories.find((c) => c.id === category.parent_id) : null;
  const children = categories.filter((c) => c.parent_id === genreId);
  const catById = new Map(categories.map((c) => [c.id, c]));

  return (
    <>
      <CatNav activeId={genreId} />
      <div className="catalog-head">
        <Link href={parent ? `/lessons/${parent.id}` : "/"} className="catalog-head__back">
          ← {parent ? parent.label : "ホーム"}へ戻る
        </Link>
        <div className="catalog-head__cat">{category.label}</div>
        <h1>{category.title}</h1>
        <p>
          {category.subtitle ?? ""} ・ 全{lessonsResolved.length}授業
        </p>
      </div>

      {children.length > 0 && (
        <section className="section">
          <div className="cat-pills">
            {children.map((c) => (
              <Link key={c.id} href={`/lessons/${c.id}`} className="cat-pill">
                {c.title}
                <span className="cat-pill__arrow">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: 8 }}>
        {lessonsResolved.length === 0 ? (
          <div className="coming-soon">
            <div className="coming-soon__icon">⏳</div>
            <div className="coming-soon__eyebrow">COMING SOON</div>
            <h2 className="coming-soon__title">現在準備中です</h2>
            <p className="coming-soon__lead">
              {category.title} の授業は近日公開予定です。
            </p>
            <div className="coming-soon__actions">
              <Link className="coming-soon__cta coming-soon__cta--primary" href="/">
                ホームに戻る
              </Link>
            </div>
          </div>
        ) : (
          <div className="course-grid" style={{ padding: "0 28px" }}>
            {lessonsResolved.map((lesson) => {
              const cat = catById.get(lesson.category_id) ?? category;
              return (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  category={cat}
                  favorited={favoriteIds.has(lesson.id)}
                />
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
