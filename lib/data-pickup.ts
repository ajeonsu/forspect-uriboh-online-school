import { CURATED_PICKUP_SLUGS } from "@/lib/pickup-config";
import { getLessonBySlug } from "@/lib/data";
import type { Lesson } from "@/lib/types";

/**
 * Pickup hero matches static: one dot per curated slide (12), not the full catalog.
 */
export async function getPickupLessons(allPublished: Lesson[]): Promise<Lesson[]> {
  const curated: Lesson[] = [];
  const seen = new Set<string>();

  for (const slug of CURATED_PICKUP_SLUGS) {
    const lesson = await getLessonBySlug(slug.genreId, slug.lessonNo);
    if (lesson && !seen.has(lesson.id)) {
      seen.add(lesson.id);
      curated.push(lesson);
    }
  }

  if (curated.length >= CURATED_PICKUP_SLUGS.length) {
    return curated.slice(0, CURATED_PICKUP_SLUGS.length);
  }

  const extra = [...allPublished]
    .sort((a, b) => {
      const ds = b.likes_count - a.likes_count;
      if (ds !== 0) return ds;
      const ap = a.popular_rank ?? 999;
      const bp = b.popular_rank ?? 999;
      if (ap !== bp) return ap - bp;
      return b.views_count - a.views_count;
    })
    .filter((l) => !seen.has(l.id));

  const max = CURATED_PICKUP_SLUGS.length;
  return [...curated, ...extra].slice(0, max);
}
