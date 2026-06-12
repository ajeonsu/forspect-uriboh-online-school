import Link from "next/link";
import { ArticleBody } from "@/components/ArticleBody";
import { LessonCard } from "@/components/LessonCard";
import { LessonDetailHeadActions, LessonLikeActions } from "@/components/LessonDetailActions";
import { LessonToc } from "@/components/LessonToc";
import { buildTocAndHtml, estimateReadingMinutes } from "@/lib/article";
import { lessonHref } from "@/lib/data";
import type { Category, Lesson } from "@/lib/types";

export function LessonDetailShell({
  lesson,
  category,
  siblings,
  related,
  relatedCategories,
  genreId,
  showEngagement = true,
  backHref,
  backLabel,
  banner,
  favorited = false,
  liked = false,
  favoriteIds,
}: {
  lesson: Lesson;
  category: Category;
  siblings: Lesson[];
  related: Lesson[];
  relatedCategories: Map<string, Category>;
  genreId: string;
  showEngagement?: boolean;
  backHref: string;
  backLabel: string;
  banner?: React.ReactNode;
  favorited?: boolean;
  liked?: boolean;
  favoriteIds?: Set<string>;
}) {
  const lessonNo = lesson.lesson_no;
  const idx = siblings.findIndex((l) => l.lesson_no === lessonNo);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const bodyHtml = lesson.content_html ?? "";
  const readMinutes = estimateReadingMinutes(bodyHtml);
  const { htmlWithIds, items } = buildTocAndHtml(bodyHtml);

  return (
    <>
      {banner}
      <div className="catalog-head">
        <Link href={backHref} className="catalog-head__back">
          {backLabel}
        </Link>
        <div className="catalog-head__cat">
          LESSON {lesson.lesson_no} ・ {category.label}
        </div>
        <h1>{lesson.title}</h1>
        <div className="catalog-head__meta">
          <span className="catalog-head__metaitem">{readMinutes}分で読了</span>
          {lesson.status !== "published" && (
            <span className="catalog-head__metaitem">Status: {lesson.status}</span>
          )}
          {showEngagement && (
            <LessonDetailHeadActions lessonId={lesson.id} initialFavorited={favorited} />
          )}
        </div>
        {showEngagement && (
          <LessonLikeActions lessonId={lesson.id} initialLiked={liked} initialCount={lesson.likes_count} />
        )}
      </div>

      <div className="topic-page">
        <LessonToc items={items} />
        <ArticleBody html={htmlWithIds} />

        {(prev || next) && (
          <nav className="topic-nav" aria-label="この授業の前後">
            {prev ? (
              <Link href={lessonHref(genreId, prev.lesson_no)} className="topic-nav__item topic-nav__item--prev">
                <span className="topic-nav__label">← 前の授業</span>
                <span className="topic-nav__title">
                  LESSON {prev.lesson_no} {prev.title}
                </span>
              </Link>
            ) : (
              <span className="topic-nav__item topic-nav__item--disabled" />
            )}
            {next ? (
              <Link href={lessonHref(genreId, next.lesson_no)} className="topic-nav__item topic-nav__item--next">
                <span className="topic-nav__label">次の授業 →</span>
                <span className="topic-nav__title">
                  LESSON {next.lesson_no} {next.title}
                </span>
              </Link>
            ) : (
              <span className="topic-nav__item topic-nav__item--disabled" />
            )}
          </nav>
        )}

        {related.length > 0 && (
          <section className="topic-related">
            <h2 className="topic-related__title">同じカテゴリの授業</h2>
            <div className="topic-related__grid">
              {related.map((rel) => (
                <LessonCard
                  key={rel.id}
                  lesson={rel}
                  category={relatedCategories.get(rel.category_id) ?? category}
                  favorited={favoriteIds?.has(rel.id) ?? false}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
