import type { ReactNode } from "react";
import type { Category, Lesson } from "@/lib/types";

const DOT_GRID = (
  <svg className="designed__pattern" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="dotgrid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="0.9" fill="rgba(255,255,255,0.16)" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dotgrid)" />
  </svg>
);

function getTopBadge(title: string, g: Category) {
  if (g.id === "ai-claude") return "Claude活用";
  if (g.id === "ai-gemini") return "Gemini活用";
  if (g.id === "ai-chatgpt") {
    if (/Claude|Cowork/i.test(title)) return "Claude活用";
    if (/Gemini/i.test(title)) return "Gemini活用";
    return "ChatGPT活用";
  }
  if (/Claude|Cowork/i.test(title)) return "Claude活用";
  if (/Gemini/i.test(title)) return "Gemini活用";
  if (/ChatGPT/i.test(title)) return "ChatGPT活用";
  if (g.parent_id === "sns" || g.id.startsWith("sns")) return "Instagram";
  if (g.parent_id === "sales" || g.id === "sales") return "営業スキル";
  if (g.parent_id === "money" || g.id === "money") return "お金・税金";
  if (g.parent_id === "ai" || g.id === "ai") return "AI活用";
  return "学習";
}

function getThemeClass(g: Category) {
  if (g.id === "sales" || g.parent_id === "sales") {
    return "thumb-designed--editorial thumb-designed--editorial-sales";
  }
  if (g.id === "sns" || g.parent_id === "sns") {
    return "thumb-designed--editorial thumb-designed--editorial-sns";
  }
  if (g.id === "money" || g.parent_id === "money") {
    return "thumb-designed--editorial thumb-designed--editorial-money";
  }
  if (g.parent_id === "ai" || g.id === "ai") return "thumb-designed--ai";
  return "thumb-designed--editorial thumb-designed--editorial-sales";
}

function extractAccent(mainTitle: string) {
  const suffixPatterns = [
    /(入門)$/, /(攻略)$/, /(活用)$/, /(比較)$/, /(ガイド)$/, /(量産する)$/, /(作る)$/,
  ];
  for (const re of suffixPatterns) {
    const match = mainTitle.match(re);
    if (match) {
      const idx = mainTitle.lastIndexOf(match[1]);
      return { before: mainTitle.substring(0, idx), accent: match[1] };
    }
  }
  if (mainTitle.length > 8) {
    return { before: mainTitle.substring(0, mainTitle.length - 3), accent: mainTitle.substring(mainTitle.length - 3) };
  }
  return { before: "", accent: mainTitle };
}

export function DesignedThumb({
  lesson,
  category,
  showSticker,
}: {
  lesson: Lesson;
  category: Category;
  showSticker?: boolean;
}) {
  const title = lesson.title;
  const themeClass = getThemeClass(category);
  const sticker =
    showSticker ?? (Boolean(lesson.popular_rank) || /量産|完全|TOP|無料公開/.test(title));

  let titleBlock: ReactNode;
  let subText = "";

  if (lesson.thumb_intro && lesson.thumb_accent) {
    titleBlock = (
      <div className="designed__title designed__title--stacked">
        <div className="designed__title-intro">{lesson.thumb_intro}</div>
        <div className="designed__title-main">
          <span className="designed__title-bracket">『</span>
          {lesson.thumb_accent}
          <span className="designed__title-bracket">』</span>
        </div>
      </div>
    );
    subText = lesson.thumb_subtitle ?? "";
  } else {
    const parts = title.split("｜");
    const main = parts[0];
    const { before, accent } = extractAccent(main);
    titleBlock = (
      <div className="designed__title">
        {before}
        <span className="designed__title-accent designed__accent">{accent}</span>
      </div>
    );
    subText = parts[1] ?? "";
  }

  return (
    <div className={`thumb thumb-designed ${themeClass}`}>
      {DOT_GRID}
      <div className="designed__glow designed__glow--1" />
      <div className="designed__glow designed__glow--2" />
      <div className="designed__top-badge">
        <span>{getTopBadge(title, category)}</span>
      </div>
      {titleBlock}
      {subText ? <div className="designed__subtitle">{subText}</div> : null}
      {sticker ? (
        <div className="designed__sticker">
          PICK
          <br />
          UP!
        </div>
      ) : null}
    </div>
  );
}
