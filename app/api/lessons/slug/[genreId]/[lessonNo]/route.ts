import { jsonError, jsonOk } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

/** Public lesson by category slug + lesson number (same data as GET /api/lessons/[genreId]/[lessonNo] in spec). */
export async function GET(_req: Request, ctx: { params: Promise<{ genreId: string; lessonNo: string }> }) {
  const { genreId, lessonNo } = await ctx.params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("category_id", genreId)
    .eq("lesson_no", lessonNo)
    .eq("status", "published")
    .maybeSingle();
  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("Not found", 404);
  return jsonOk({ lesson: data });
}
