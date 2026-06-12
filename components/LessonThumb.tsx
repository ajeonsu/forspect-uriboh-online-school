import type { Category, Lesson } from "@/lib/types";
import { thumbnailSrc } from "@/lib/data";
import { DesignedThumb } from "@/components/DesignedThumb";

export function LessonThumb({
  lesson,
  category,
  showPopular,
  imageFit = "cover",
}: {
  lesson: Lesson;
  category: Category;
  showPopular?: boolean;
  /** Ranking rows use `contain` to match the static site; cards use `cover`. */
  imageFit?: "cover" | "contain";
  priority?: boolean;
}) {
  const hasImage = Boolean(lesson.thumbnail_url || lesson.thumbnail_path);
  if (hasImage) {
    const url = thumbnailSrc(lesson);
    return (
      <div
        className="thumb thumb-img"
        style={{
          backgroundImage: `url('${url}')`,
          backgroundSize: imageFit,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
    );
  }
  return (
    <DesignedThumb
      lesson={lesson}
      category={category}
      showSticker={showPopular ?? Boolean(lesson.popular_rank)}
    />
  );
}
