import Link from "next/link";
import { LessonThumb } from "@/components/LessonThumb";
import { lessonHref, thumbnailSrc } from "@/lib/data";
import type { Category, Lesson } from "@/lib/types";

const CAT_DISPLAY: Record<string, string> = {
  ai: "AI",
  claude: "Claude",
  sns: "SNS",
  sales: "営業",
  money: "お金・税金",
};

export function pickupCatKey(category: Category): keyof typeof CAT_DISPLAY {
  if (category.id === "ai-claude" || category.parent_id === "ai-claude") return "claude";
  if (category.parent_id === "ai" || category.id.startsWith("ai")) return "ai";
  if (category.parent_id === "sns" || category.id.startsWith("sns")) return "sns";
  if (category.id === "sales" || category.parent_id === "sales") return "sales";
  if (category.id === "money" || category.parent_id === "money") return "money";
  return "ai";
}

export function PickupItem({ lesson, category }: { lesson: Lesson; category: Category }) {
  const catKey = pickupCatKey(category);
  const catName = CAT_DISPLAY[catKey];
  const href = lessonHref(lesson.category_id, lesson.lesson_no);
  const hasImage = Boolean(lesson.thumbnail_url || lesson.thumbnail_path);

  return (
    <Link
      href={href}
      className={`pickup-item pickup-item--cat-${catKey}`}
      data-pickup-item
    >
      <div className="pickup-item__inner">
        <div className="pickup-frame__label">おすすめ{catName}記事</div>
        <div className="pickup-frame__bracket pickup-frame__bracket--tr" />
        <div className="pickup-frame__bracket pickup-frame__bracket--bl" />
        {hasImage ? (
          <div
            className="pickup-card pickup-card--img"
            style={{ backgroundImage: `url('${thumbnailSrc(lesson)}')` }}
          />
        ) : (
          <div className="pickup-card pickup-card--designed">
            <LessonThumb lesson={lesson} category={category} />
          </div>
        )}
      </div>
      <div className="pickup-item__label">{lesson.title}</div>
    </Link>
  );
}
