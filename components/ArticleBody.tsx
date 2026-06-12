import { sanitizeArticleHtml } from "@/lib/sanitize";

export function ArticleBody({ html }: { html: string }) {
  const safe = sanitizeArticleHtml(html);
  return <article className="body" dangerouslySetInnerHTML={{ __html: safe }} />;
}
