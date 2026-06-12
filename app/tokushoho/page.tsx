import { readFile } from "fs/promises";
import path from "path";

export default async function TokushohoPage() {
  const html = await readFile(path.join(process.cwd(), "tokushoho.html"), "utf8");
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;

  return (
    <div
      className="static-page legal-embed"
      dangerouslySetInnerHTML={{ __html: body }}
      style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 28px" }}
    />
  );
}
