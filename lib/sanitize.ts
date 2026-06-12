import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "a",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "div",
  "span",
  "figure",
  "figcaption",
  "iframe",
  "blockquote",
  "hr",
  "br",
  "img",
];

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "class",
  "src",
  "title",
  "loading",
  "frameborder",
  "allow",
  "allowfullscreen",
  "referrerpolicy",
  "alt",
  "width",
  "height",
  "id",
];

function isYouTubeIframe(src: string | undefined): boolean {
  if (!src) return false;
  try {
    const u = new URL(src);
    return (
      u.hostname === "www.youtube.com" ||
      u.hostname === "youtube.com" ||
      u.hostname === "www.youtube-nocookie.com"
    );
  } catch {
    return false;
  }
}

export function sanitizeArticleHtml(html: string): string {
  const cleaned = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "referrerpolicy", "frameborder", "loading"],
    FORBID_TAGS: ["script", "style"],
  });

  return cleaned.replace(/<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/iframe>/gi, (full, src) =>
    isYouTubeIframe(src) ? full : "",
  );
}
