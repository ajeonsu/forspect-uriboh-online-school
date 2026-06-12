import type { SupabaseClient } from "@supabase/supabase-js";

export type LessonRevisionRow = {
  id: string;
  lesson_id: string;
  title: string;
  summary: string | null;
  content_json: unknown;
  content_html: string;
  thumbnail_url: string | null;
  status: string;
  edited_by: string | null;
  created_at: string;
};

export async function createLessonRevision(
  supabase: SupabaseClient,
  lesson: {
    id: string;
    title: string;
    excerpt?: string | null;
    content_json?: unknown;
    content_html: string;
    thumbnail_url?: string | null;
    status: string;
  },
  editedBy: string,
) {
  const { error } = await supabase.from("lesson_revisions").insert({
    lesson_id: lesson.id,
    title: lesson.title,
    summary: lesson.excerpt ?? null,
    content_json: lesson.content_json ?? null,
    content_html: lesson.content_html,
    thumbnail_url: lesson.thumbnail_url ?? null,
    status: lesson.status,
    edited_by: editedBy,
  });
  if (error) throw error;
}
