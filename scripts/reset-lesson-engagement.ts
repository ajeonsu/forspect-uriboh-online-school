/**
 * Clear fake view/like counts from static import.
 * Optionally sync likes_count from real lesson_likes rows.
 *
 * Run: npm run db:reset-engagement
 *      npm run db:reset-engagement -- --sync-likes
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const syncLikes = process.argv.includes("--sync-likes");
const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const { data: before, error: readErr } = await supabase
    .from("lessons")
    .select("id, views_count, likes_count");
  if (readErr) throw readErr;

  const totalViews = (before ?? []).reduce((s, r) => s + (r.views_count ?? 0), 0);
  const totalLikes = (before ?? []).reduce((s, r) => s + (r.likes_count ?? 0), 0);
  console.log(`Lessons: ${before?.length ?? 0}`);
  console.log(`Before — total views: ${totalViews.toLocaleString()}, total likes: ${totalLikes.toLocaleString()}`);

  const { error: updateErr } = await supabase
    .from("lessons")
    .update({ views_count: 0, likes_count: 0 })
    .not("id", "is", null);
  if (updateErr) throw updateErr;

  console.log("Reset all lessons to views_count=0, likes_count=0.");

  if (syncLikes) {
    const { data: likes, error: likesErr } = await supabase.from("lesson_likes").select("lesson_id");
    if (likesErr) throw likesErr;

    const counts = new Map<string, number>();
    for (const row of likes ?? []) {
      counts.set(row.lesson_id, (counts.get(row.lesson_id) ?? 0) + 1);
    }

    let synced = 0;
    for (const [lessonId, count] of counts) {
      const { error } = await supabase.from("lessons").update({ likes_count: count }).eq("id", lessonId);
      if (error) throw error;
      synced += 1;
    }
    console.log(`Synced likes_count from lesson_likes for ${synced} lesson(s).`);
  } else {
    console.log("Tip: pass --sync-likes to set likes_count from real user likes in lesson_likes.");
  }

  const { data: after } = await supabase.from("lessons").select("views_count, likes_count");
  const afterViews = (after ?? []).reduce((s, r) => s + (r.views_count ?? 0), 0);
  const afterLikes = (after ?? []).reduce((s, r) => s + (r.likes_count ?? 0), 0);
  console.log(`After — total views: ${afterViews.toLocaleString()}, total likes: ${afterLikes.toLocaleString()}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
