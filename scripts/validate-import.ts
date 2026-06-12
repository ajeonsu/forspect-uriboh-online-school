/**
 * Validates static parse + optional Supabase row counts after import.
 *
 * Usage:
 *   npx tsx scripts/validate-import.ts           # static only
 *   npx tsx scripts/validate-import.ts --db      # static + database
 */
import path from "path";
import { fileURLToPath } from "url";
import { createAdminClient } from "../lib/supabase/admin";
import {
  EXPECTED_CATEGORIES,
  EXPECTED_LESSONS,
  EXPECTED_TOPIC_BODIES,
  dryRunHasBlockingIssues,
  parseStaticContent,
  printDryRunReport,
} from "../lib/import/static-content";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const checkDb = process.argv.includes("--db");

async function validateDatabase(staticCrossLinks: number) {
  const supabase = createAdminClient();

  const [catRes, lessonRes, crossRes] = await Promise.all([
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("lessons").select("id", { count: "exact", head: true }),
    supabase.from("lesson_cross_links").select("lesson_id", { count: "exact", head: true }),
  ]);

  if (catRes.error) throw catRes.error;
  if (lessonRes.error) throw lessonRes.error;
  if (crossRes.error) throw crossRes.error;

  const categoryCount = catRes.count ?? 0;
  const lessonCount = lessonRes.count ?? 0;
  const crossCount = crossRes.count ?? 0;

  const { data: lessonBodies, error: emptyErr } = await supabase
    .from("lessons")
    .select("category_id, lesson_no, content_html");
  if (emptyErr) throw emptyErr;
  const emptyBodies = (lessonBodies ?? []).filter((l) => !l.content_html?.trim());

  const { data: allLessons, error: lessonsErr } = await supabase
    .from("lessons")
    .select("category_id, lesson_no");
  if (lessonsErr) throw lessonsErr;

  const { data: allCategories, error: catsErr } = await supabase.from("categories").select("id");
  if (catsErr) throw catsErr;

  const catSet = new Set((allCategories ?? []).map((c) => c.id));
  const missingCategory = (allLessons ?? []).filter((l) => !catSet.has(l.category_id));

  const { count: publishedCount, error: pubErr } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");
  if (pubErr) throw pubErr;

  console.log("=== Database validation ===");
  console.log("categories in DB:", categoryCount, `(expected ${EXPECTED_CATEGORIES})`);
  console.log("lessons in DB:", lessonCount, `(expected ${EXPECTED_LESSONS})`);
  console.log("published lessons:", publishedCount ?? 0, `(expected ${EXPECTED_LESSONS})`);
  console.log("cross links in DB:", crossCount, `(static source ${staticCrossLinks})`);
  console.log("lessons with empty content_html:", (emptyBodies ?? []).length);
  console.log("lessons with unknown category_id:", missingCategory.length);

  if (missingCategory.length > 0) {
    for (const l of missingCategory.slice(0, 10)) {
      console.log(`  - ${l.category_id}/${l.lesson_no}`);
    }
  }

  const blocking =
    categoryCount !== EXPECTED_CATEGORIES ||
    lessonCount !== EXPECTED_LESSONS ||
    (publishedCount ?? 0) !== EXPECTED_LESSONS ||
    crossCount !== staticCrossLinks ||
    (emptyBodies ?? []).length > 0 ||
    missingCategory.length > 0;

  if (blocking) {
    console.error("\nDatabase validation FAILED.");
    process.exit(1);
  }

  console.log("\nDatabase validation OK.");
}

async function main() {
  const report = parseStaticContent(root);
  printDryRunReport(report);

  if (dryRunHasBlockingIssues(report)) {
    console.error("\nStatic validation FAILED.");
    process.exit(1);
  }
  console.log("\nStatic validation OK.");

  if (checkDb) {
    await validateDatabase(report.crossLinksFound);
  } else {
    console.log("\nTip: run with --db to validate Supabase counts after import.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
