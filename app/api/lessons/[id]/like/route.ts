import { jsonError, jsonOk, requireApiUser } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireApiUser();
  if (error) return error;
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { error: likeErr } = await supabase.from("lesson_likes").upsert({
    user_id: profile!.id,
    lesson_id: id,
  });
  if (likeErr) return jsonError(likeErr.message, 500);

  const { data: lesson } = await supabase.from("lessons").select("likes_count").eq("id", id).single();
  if (lesson) {
    await supabase.from("lessons").update({ likes_count: (lesson.likes_count ?? 0) + 1 }).eq("id", id);
  }

  return jsonOk({ liked: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireApiUser();
  if (error) return error;
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { error: delErr } = await supabase
    .from("lesson_likes")
    .delete()
    .eq("user_id", profile!.id)
    .eq("lesson_id", id);
  if (delErr) return jsonError(delErr.message, 500);

  const { data: lesson } = await supabase.from("lessons").select("likes_count").eq("id", id).single();
  if (lesson && lesson.likes_count > 0) {
    await supabase.from("lessons").update({ likes_count: lesson.likes_count - 1 }).eq("id", id);
  }

  return jsonOk({ liked: false });
}
