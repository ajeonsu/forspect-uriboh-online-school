import fs from "fs";
import path from "path";
import vm from "vm";
import type { StaticGenre } from "@/lib/types";

export function extractFromIndexHtml(htmlPath: string): {
  genres: StaticGenre[];
  topicBodies: Record<string, string>;
} {
  const html = fs.readFileSync(htmlPath, "utf8");

  const bodiesStart = html.indexOf("window.TOPIC_BODIES = {");
  const bodiesEnd = html.indexOf("};;", bodiesStart);
  if (bodiesStart < 0 || bodiesEnd < 0) {
    throw new Error("Could not find window.TOPIC_BODIES in index.html");
  }
  const bodiesExpr = html.slice(bodiesStart + "window.TOPIC_BODIES = ".length, bodiesEnd + 1);

  const genresStart = html.indexOf("const GENRES = [");
  const genresEnd = html.indexOf("];;", genresStart);
  if (genresStart < 0 || genresEnd < 0) {
    throw new Error("Could not find const GENRES in index.html");
  }
  const genresExpr = html.slice(genresStart + "const GENRES = ".length, genresEnd + 1);

  const sandbox: { window: { TOPIC_BODIES: Record<string, string> }; GENRES?: StaticGenre[] } = {
    window: { TOPIC_BODIES: {} },
  };

  vm.runInNewContext(`window.TOPIC_BODIES = ${bodiesExpr};`, sandbox, {
    filename: "topic-bodies.vm.js",
    timeout: 30_000,
  });

  vm.runInNewContext(`GENRES = ${genresExpr};`, sandbox, {
    filename: "genres.vm.js",
    timeout: 30_000,
  });

  const topicBodies = sandbox.window.TOPIC_BODIES;
  const genres = (sandbox as { GENRES?: StaticGenre[] }).GENRES;
  if (!genres) {
    throw new Error("GENRES extraction failed");
  }

  return { genres, topicBodies };
}

export function thumbFileExists(rootDir: string, thumbPath: string | undefined): boolean {
  if (!thumbPath) return false;
  const rel = thumbPath.replace(/^thumbs\//, "");
  const candidates = [
    path.join(rootDir, "public", "thumbs", rel),
    path.join(rootDir, "thumbs", rel),
  ];
  return candidates.some((p) => fs.existsSync(p));
}
