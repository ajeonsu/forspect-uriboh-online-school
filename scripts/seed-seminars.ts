/**
 * Seed the 5 static sample seminars into Supabase (published + approved).
 * Run: npm run db:seed-seminars
 */
import { createClient } from "@supabase/supabase-js";
import { STATIC_SEMINAR_SEED } from "../lib/data/static-seminar-seed";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const { data: existing } = await supabase.from("seminars").select("id, title");
  const titles = new Set((existing ?? []).map((r) => r.title));

  let inserted = 0;
  for (const row of STATIC_SEMINAR_SEED) {
    if (titles.has(row.title)) {
      console.log("skip (exists):", row.title.slice(0, 40));
      continue;
    }
    const { error } = await supabase.from("seminars").insert({
      title: row.title,
      description: row.description,
      host_name: row.host_name,
      category_tags: [...row.category_tags],
      start_at: row.start_at,
      end_at: row.end_at,
      location: row.location,
      apply_url: row.apply_url,
      status: row.status,
      moderation_status: row.moderation_status,
    });
    if (error) {
      console.error("insert failed:", row.legacy_id, error.message);
      continue;
    }
    inserted++;
    console.log("inserted:", row.legacy_id);
  }
  console.log(`Done. Inserted ${inserted} seminar(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
