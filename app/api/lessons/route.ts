import { jsonError, jsonOk } from "@/lib/api";
import { LESSON_LIST_SELECT } from "@/lib/data/selects";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categoryId = url.searchParams.get("categoryId");
  const supabase = await createClient();
  let q = supabase.from("lessons").select(LESSON_LIST_SELECT).eq("status", "published").order("lesson_no");
  if (categoryId) q = q.eq("category_id", categoryId);
  const { data, error } = await q;
  if (error) return jsonError(error.message, 500);
  return jsonOk({ lessons: data ?? [] });
}
