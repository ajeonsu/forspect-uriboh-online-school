import { jsonError, jsonOk } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) return jsonError(error.message, 500);
  return jsonOk({ categories: data ?? [] });
}
