import type { EditorScope } from "@/lib/cms/editor-scope";
import { assertOwnsRow } from "@/lib/cms/editor-scope";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getLessonForEditor(supabase: SupabaseClient, scope: EditorScope, id: string) {
  const { data, error } = await supabase.from("lessons").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (!scope.isAdmin) {
    if (data.created_by !== scope.userId) return null;
  }
  return data;
}

export async function getSeminarForEditor(supabase: SupabaseClient, scope: EditorScope, id: string) {
  const { data, error } = await supabase.from("seminars").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (!scope.isAdmin && data.created_by !== scope.userId) return null;
  return data;
}

export async function getCategoryForEditor(supabase: SupabaseClient, scope: EditorScope, id: string) {
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (!scope.isAdmin) {
    if (data.created_by !== scope.userId) return null;
  }
  return data;
}

export async function assertLessonAccess(supabase: SupabaseClient, scope: EditorScope, id: string) {
  const row = await getLessonForEditor(supabase, scope, id);
  if (!row) throw new Error("Lesson not found or access denied.");
  assertOwnsRow(scope, row, "lessons");
  return row;
}
