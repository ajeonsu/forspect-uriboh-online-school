import type { Category } from "@/lib/types";

const TAG_DEFS = [
  { key: "AI", cls: "ccard__tag--ai", test: (txt: string, g: Category) => g.id === "ai" || g.parent_id === "ai" },
  { key: "ChatGPT", cls: "ccard__tag--chatgpt", test: (txt: string) => /ChatGPT/i.test(txt) },
  { key: "Gemini", cls: "ccard__tag--gemini", test: (txt: string) => /Gemini/i.test(txt) },
  {
    key: "Claude",
    cls: "ccard__tag--claude",
    test: (txt: string, g: Category) =>
      g.id === "ai-claude" || g.parent_id === "ai-claude" || /Claude|Cowork/i.test(txt),
  },
] as const;

export function getLessonTags(title: string, category: Category, contentHtml = "") {
  const text = `${title} ${contentHtml}`;
  return TAG_DEFS.filter((d) => d.test(text, category)).map((d) => ({ key: d.key, cls: d.cls }));
}
