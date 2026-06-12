export function estimateReadingMinutes(html: string): number {
  const plain = html.replace(/<[^>]+>/g, "");
  return Math.max(2, Math.round(plain.length / 600));
}

export type TocItem = { id: string; text: string; level: "h3" | "h4" };

export function buildTocAndHtml(html: string): { htmlWithIds: string; items: TocItem[] } {
  const items: TocItem[] = [];
  const re = /<h([34])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  let i = 0;
  const replacements: { from: string; to: string }[] = [];

  while ((match = re.exec(html))) {
    const level = match[1] === "3" ? "h3" : "h4";
    const rawInner = match[3];
    const text = rawInner.replace(/<[^>]+>/g, "").trim();
    if (!text) continue;
    const id = `sec-${i}-${text.replace(/[^\w一-龥ぁ-んァ-ン]+/g, "").slice(0, 20)}`;
    i += 1;
    items.push({ id, text, level });
    const from = match[0];
    const to = `<${level} id="${id}">${rawInner}</${level}>`;
    replacements.push({ from, to });
  }

  let htmlWithIds = html;
  for (const { from, to } of replacements) {
    htmlWithIds = htmlWithIds.replace(from, to);
  }

  return { htmlWithIds, items };
}
