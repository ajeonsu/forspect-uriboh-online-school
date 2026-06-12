import { z } from "zod";
import { jsonError, jsonOk, requireApiUser } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const { error, profile } = await requireApiUser();
  if (error) return error;
  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("favorites")
    .select("lesson_id, created_at, lesson:lessons(*)")
    .eq("user_id", profile!.id);
  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk({ favorites: data ?? [] });
}

const bodySchema = z.object({ lessonId: z.string().uuid() });

export async function POST(request: Request) {
  const { error, profile } = await requireApiUser();
  if (error) return error;
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid body", 400);

  const supabase = await createClient();
  const { error: dbError } = await supabase.from("favorites").upsert({
    user_id: profile!.id,
    lesson_id: parsed.data.lessonId,
  });
  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk({ ok: true }, 201);
}
