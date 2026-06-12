import Link from "next/link";
import type { Category, Lesson } from "@/lib/types";
import { lessonHref } from "@/lib/data";
import { getLessonTags } from "@/lib/lesson-tags";
import { LessonCardFav } from "@/components/LessonCardFav";
import { LessonThumb } from "@/components/LessonThumb";

export function LessonCard({
  lesson,
  category,
  categoryLabel,
  favorited,
  compact,
}: {
  lesson: Lesson;
  category: Category;
  categoryLabel?: string;
  favorited?: boolean;
  compact?: boolean;
}) {
  const href = lessonHref(lesson.category_id, lesson.lesson_no);
  const label = categoryLabel ?? category.label;
  const tags = compact ? [] : getLessonTags(lesson.title, category, lesson.excerpt ?? "");

  return (
    <Link href={href} className="ccard">
      <div className="ccard__cov-wrap">
        <LessonThumb lesson={lesson} category={category} />
        <LessonCardFav lessonId={lesson.id} initialOn={favorited} />
        {lesson.popular_rank != null && lesson.popular_rank <= 6 && (
          <span className="ccard__free-badge">人気</span>
        )}
      </div>
      <div className="ccard__body">
        {!compact && <div className="ccard__cat">{label}</div>}
        <div className="ccard__title">{lesson.title}</div>
        {tags.length > 0 && (
          <div className="ccard__tags">
            {tags.map((t) => (
              <span key={t.key} className={`ccard__tag ${t.cls}`}>
                {t.key}
              </span>
            ))}
          </div>
        )}
        {!compact && (
          <div className="ccard__meta">
            <span>👁 {lesson.views_count.toLocaleString()}</span>
            <span>♥ {lesson.likes_count.toLocaleString()}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
