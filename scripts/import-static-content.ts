import path from "path";
import { fileURLToPath } from "url";
import { createAdminClient } from "../lib/supabase/admin";
import {
  categoryRowsFromGenres,
  dryRunHasBlockingIssues,
  lessonRowsFromParsed,
  parseStaticContent,
  printDryRunReport,
  type ImportDryRunReport,
} from "../lib/import/static-content";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");

async function upsertToSupabase(report: ImportDryRunReport) {
  const supabase = createAdminClient();

  const categoryRows = categoryRowsFromGenres(report.genres);
  const { error: catErr } = await supabase.from("categories").upsert(categoryRows, { onConflict: "id" });
  if (catErr) throw catErr;

  const lessonRows = lessonRowsFromParsed(report.lessons);
  const { error: lessonErr } = await supabase
    .from("lessons")
    .upsert(lessonRows, { onConflict: "category_id,lesson_no" });

  if (lessonErr) throw lessonErr;

  const { data: lessonIds, error: idErr } = await supabase
    .from("lessons")
    .select("id, category_id, lesson_no");

  if (idErr) throw idErr;

  const idByKey = new Map<string, string>();
  for (const row of lessonIds ?? []) {
    idByKey.set(`${row.category_id}/${row.lesson_no}`, row.id);
  }

  if (idByKey.size !== report.lessons.length) {
    console.warn(
      `Warning: DB has ${idByKey.size} lessons but static parse has ${report.lessons.length}.`,
    );
  }

  const crossRows: { lesson_id: string; target_category_id: string }[] = [];
  for (const l of report.lessons) {
    const lessonId = idByKey.get(l.key);
    if (!lessonId) {
      throw new Error(`Lesson id missing after upsert: ${l.key}`);
    }
    for (const target of l.crossList) {
      crossRows.push({ lesson_id: lessonId, target_category_id: target });
    }
  }

  if (crossRows.length > 0) {
    const { error: crossErr } = await supabase.from("lesson_cross_links").upsert(crossRows);
    if (crossErr) {
      console.error("Cross-link upsert failed:", crossErr.message, crossErr.details);
      throw crossErr;
    }
  } else {
    console.warn("No cross links to upsert (static parse had 0).");
  }

  console.log("");
  console.log("=== Upsert complete ===");
  console.log("categories upserted:", categoryRows.length);
  console.log("lessons upserted:", lessonRows.length);
  console.log("cross links upserted:", crossRows.length);
}

async function main() {
  const report = parseStaticContent(root);
  printDryRunReport(report);

  if (dryRun) {
    process.exit(dryRunHasBlockingIssues(report) ? 1 : 0);
  }

  if (dryRunHasBlockingIssues(report)) {
    console.error("\nRefusing import: fix blocking dry-run issues first.");
    process.exit(1);
  }

  await upsertToSupabase(report);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
