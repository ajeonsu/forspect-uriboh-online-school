import type { Category, Lesson } from "@/lib/types";

export const HOME_OUTCOME_TITLES: Record<string, string> = {
  "ai-chatgpt": "ChatGPTで仕事効率を上げる",
  "ai-gemini": "Geminiでビジュアル制作を加速する",
  "ai-claude": "Claudeで業務を任せて自動化する",
  "sns-instagram": "Instagramでフォロワーを伸ばす",
  "sns-threads": "Threadsで集客の入口を作る",
  "sns-x": "X（旧Twitter）で発信を加速する",
  "news-ai": "AIニュース・最新トレンドを押さえる",
  "news-sns": "SNSニュース・各媒体の最新動向",
  sales: "売り込まずに成約を取る営業を学ぶ",
  money: "経営者・個人事業主の税金リテラシーを身につける",
};

const EXPAND_SUBS = new Set(["ai", "sns", "news"]);

export type HomeCarouselSection = {
  genreId: string;
  title: string;
  lessons: Lesson[];
};

export function buildHomeCarouselSections(
  categories: Category[],
  lessons: Lesson[],
): HomeCarouselSection[] {
  const parents = categories.filter((c) => !c.parent_id);
  const rows: HomeCarouselSection[] = [];

  for (const parent of parents) {
    const subs = categories.filter((c) => c.parent_id === parent.id);
    if (subs.length > 0 && EXPAND_SUBS.has(parent.id)) {
      for (const sub of subs) {
        const subLessons = lessons.filter((l) => l.category_id === sub.id);
        if (subLessons.length === 0) continue;
        rows.push({
          genreId: sub.id,
          title: HOME_OUTCOME_TITLES[sub.id] ?? sub.title,
          lessons: subLessons,
        });
      }
    } else if (subs.length > 0) {
      const aggregated = lessons.filter((l) => subs.some((s) => s.id === l.category_id));
      if (aggregated.length === 0) continue;
      rows.push({
        genreId: parent.id,
        title: HOME_OUTCOME_TITLES[parent.id] ?? parent.title,
        lessons: aggregated,
      });
    } else {
      const own = lessons.filter((l) => l.category_id === parent.id);
      if (own.length === 0) continue;
      rows.push({
        genreId: parent.id,
        title: HOME_OUTCOME_TITLES[parent.id] ?? parent.title,
        lessons: own,
      });
    }
  }

  return rows;
}

export function countLessonsForParent(parent: Category, categories: Category[], lessons: Lesson[]) {
  const subs = categories.filter((c) => c.parent_id === parent.id);
  if (subs.length === 0) {
    return lessons.filter((l) => l.category_id === parent.id).length;
  }
  return lessons.filter((l) => subs.some((s) => s.id === l.category_id)).length;
}
