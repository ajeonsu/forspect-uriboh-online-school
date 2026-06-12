import fs from "fs";
import path from "path";
import { extractFromIndexHtml, thumbFileExists } from "@/lib/static-extract";
import type { StaticGenre } from "@/lib/types";

export const EXPECTED_CATEGORIES = 23;
export const EXPECTED_LESSONS = 111;
export const EXPECTED_TOPIC_BODIES = 111;

export type ParsedLesson = {
  key: string;
  category_id: string;
  lesson_no: string;
  title: string;
  content_html: string;
  thumbnail_path: string | null;
  thumb_intro: string | null;
  thumb_accent: string | null;
  thumb_subtitle: string | null;
  views_count: number;
  likes_count: number;
  popular_rank: number | null;
  crossList: string[];
};

export type ImportDryRunReport = {
  htmlPath: string;
  categoriesFound: number;
  lessonsFound: number;
  topicBodiesFound: number;
  crossLinksFound: number;
  missingBodyKeys: string[];
  orphanBodyKeys: string[];
  missingThumbnails: { key: string; path: string }[];
  duplicateCategoryIds: string[];
  duplicateLessonKeys: string[];
  invalidCrossLinkTargets: { lessonKey: string; targetCategoryId: string }[];
  genres: StaticGenre[];
  lessons: ParsedLesson[];
};

export function resolveIndexHtmlPath(rootDir: string): string {
  const preferred = path.join(rootDir, "static-original", "index.html");
  const fallback = path.join(rootDir, "index.html");
  return fs.existsSync(preferred) ? preferred : fallback;
}

export function parseStaticContent(rootDir: string): ImportDryRunReport {
  const htmlPath = resolveIndexHtmlPath(rootDir);
  const { genres, topicBodies } = extractFromIndexHtml(htmlPath);

  const lessons: ParsedLesson[] = [];
  for (const g of genres) {
    for (const t of g.topics ?? []) {
      const key = `${g.id}/${t.no}`;
      lessons.push({
        key,
        category_id: g.id,
        lesson_no: t.no,
        title: t.title,
        content_html: topicBodies[key] ?? "",
        thumbnail_path: t.thumb ?? null,
        thumb_intro: t.thumb_intro ?? null,
        thumb_accent: t.thumb_accent ?? null,
        thumb_subtitle: t.thumb_subtitle ?? null,
        // Static HTML view/like numbers are decorative only — not imported.
        views_count: 0,
        likes_count: 0,
        popular_rank: t.popular ?? null,
        crossList: t.crossList ?? [],
      });
    }
  }

  const lessonKeySet = new Set(lessons.map((l) => l.key));
  const bodyKeys = Object.keys(topicBodies);

  const missingBodyKeys = lessons
    .filter((l) => !topicBodies[l.key] || topicBodies[l.key].trim().length === 0)
    .map((l) => l.key);

  const orphanBodyKeys = bodyKeys.filter((k) => !lessonKeySet.has(k));

  const missingThumbnails = lessons
    .filter((l) => l.thumbnail_path && !thumbFileExists(rootDir, l.thumbnail_path))
    .map((l) => ({ key: l.key, path: l.thumbnail_path! }));

  const categoryIdCounts = new Map<string, number>();
  for (const g of genres) {
    categoryIdCounts.set(g.id, (categoryIdCounts.get(g.id) ?? 0) + 1);
  }
  const duplicateCategoryIds = [...categoryIdCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => id);

  const lessonKeyCounts = new Map<string, number>();
  for (const l of lessons) {
    lessonKeyCounts.set(l.key, (lessonKeyCounts.get(l.key) ?? 0) + 1);
  }
  const duplicateLessonKeys = [...lessonKeyCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([key]) => key);

  const categoryIds = new Set(genres.map((g) => g.id));
  const invalidCrossLinkTargets: { lessonKey: string; targetCategoryId: string }[] = [];
  let crossLinksFound = 0;
  for (const l of lessons) {
    for (const target of l.crossList) {
      crossLinksFound += 1;
      if (!categoryIds.has(target)) {
        invalidCrossLinkTargets.push({ lessonKey: l.key, targetCategoryId: target });
      }
    }
  }

  return {
    htmlPath,
    categoriesFound: genres.length,
    lessonsFound: lessons.length,
    topicBodiesFound: bodyKeys.length,
    crossLinksFound,
    missingBodyKeys,
    orphanBodyKeys,
    missingThumbnails,
    duplicateCategoryIds,
    duplicateLessonKeys,
    invalidCrossLinkTargets,
    genres,
    lessons,
  };
}

export function printDryRunReport(report: ImportDryRunReport): void {
  console.log("=== Static import dry-run ===");
  console.log("source:", report.htmlPath);
  console.log("");
  console.log("categories found:", report.categoriesFound);
  console.log("lessons found:", report.lessonsFound);
  console.log("topic bodies found:", report.topicBodiesFound);
  console.log("cross links found:", report.crossLinksFound);
  console.log("");
  console.log("missing body keys:", report.missingBodyKeys.length);
  if (report.missingBodyKeys.length > 0) {
    for (const k of report.missingBodyKeys) console.log("  -", k);
  }
  console.log("");
  console.log("orphan body keys (in TOPIC_BODIES but no lesson):", report.orphanBodyKeys.length);
  if (report.orphanBodyKeys.length > 0) {
    for (const k of report.orphanBodyKeys.slice(0, 20)) console.log("  -", k);
    if (report.orphanBodyKeys.length > 20) {
      console.log(`  ... and ${report.orphanBodyKeys.length - 20} more`);
    }
  }
  console.log("");
  console.log("missing thumbnails:", report.missingThumbnails.length);
  if (report.missingThumbnails.length > 0) {
    for (const m of report.missingThumbnails) console.log(`  - ${m.key} -> ${m.path}`);
  }
  console.log("");
  console.log("duplicate category ids:", report.duplicateCategoryIds.length);
  if (report.duplicateCategoryIds.length > 0) {
    for (const id of report.duplicateCategoryIds) console.log("  -", id);
  }
  console.log("");
  console.log("duplicate lesson keys (category_id + lesson_no):", report.duplicateLessonKeys.length);
  if (report.duplicateLessonKeys.length > 0) {
    for (const k of report.duplicateLessonKeys) console.log("  -", k);
  }
  console.log("");
  console.log("invalid cross-link targets:", report.invalidCrossLinkTargets.length);
  if (report.invalidCrossLinkTargets.length > 0) {
    for (const x of report.invalidCrossLinkTargets) {
      console.log(`  - ${x.lessonKey} -> ${x.targetCategoryId}`);
    }
  }
  console.log("");
  console.log("expected:", {
    categories: EXPECTED_CATEGORIES,
    lessons: EXPECTED_LESSONS,
    topicBodies: EXPECTED_TOPIC_BODIES,
  });
}

export function dryRunHasBlockingIssues(report: ImportDryRunReport): boolean {
  return (
    report.categoriesFound !== EXPECTED_CATEGORIES ||
    report.lessonsFound !== EXPECTED_LESSONS ||
    report.topicBodiesFound !== EXPECTED_TOPIC_BODIES ||
    report.missingBodyKeys.length > 0 ||
    report.duplicateCategoryIds.length > 0 ||
    report.duplicateLessonKeys.length > 0 ||
    report.invalidCrossLinkTargets.length > 0
  );
}

export function categoryRowsFromGenres(genres: StaticGenre[]) {
  return genres.map((g, i) => ({
    id: g.id,
    parent_id: g.parent ?? null,
    label: g.label,
    title: g.title,
    subtitle: g.sub ?? null,
    description: g.desc ?? null,
    emoji: g.emoji ?? null,
    cover_class: g.cov ?? null,
    sort_order: i * 10,
    is_active: true,
  }));
}

export function lessonRowsFromParsed(lessons: ParsedLesson[]) {
  return lessons.map((l) => ({
    category_id: l.category_id,
    lesson_no: l.lesson_no,
    title: l.title,
    excerpt: null,
    content_html: l.content_html,
    thumbnail_path: l.thumbnail_path,
    thumbnail_url: null,
    thumb_intro: l.thumb_intro,
    thumb_accent: l.thumb_accent,
    thumb_subtitle: l.thumb_subtitle,
    views_count: 0,
    likes_count: 0,
    popular_rank: l.popular_rank,
    status: "published" as const,
    published_at: new Date().toISOString(),
  }));
}
