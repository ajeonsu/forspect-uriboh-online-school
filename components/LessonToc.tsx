"use client";

import { useMemo, useState } from "react";
import type { TocItem } from "@/lib/article";

export function LessonToc({ items }: { items: TocItem[] }) {
  const h3Items = useMemo(() => items.filter((t) => t.level === "h3"), [items]);
  const [open, setOpen] = useState(() => h3Items.length <= 8);

  if (h3Items.length < 3) return null;

  const collapsed = !open;

  return (
    <aside className={`topic-toc${collapsed ? " topic-toc--collapsed" : ""}`}>
      <button
        type="button"
        className="topic-toc__head"
        aria-expanded={open}
        aria-controls="topicTocList"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="topic-toc__label">
          📑 この記事の目次 <span className="topic-toc__count">（{h3Items.length}項目）</span>
        </span>
        <span className="topic-toc__chev" aria-hidden>
          {collapsed ? "＋" : "−"}
        </span>
      </button>
      <ol className="topic-toc__list" id="topicTocList" hidden={collapsed}>
        {h3Items.map((t) => (
          <li key={t.id}>
            <a href={`#${t.id}`}>{t.text}</a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
