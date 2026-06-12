import { jsonError, jsonOk } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seminars")
    .select("*")
    .eq("status", "published")
    .order("start_at", { ascending: true });
  if (error) return jsonError(error.message, 500);
  return jsonOk({ seminars: data ?? [] });
}
