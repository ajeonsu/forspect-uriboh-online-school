import { createLessonRevision } from "@/lib/cms/lesson-revisions";
import { htmlToPlainText, slugifyTitle } from "@/lib/cms/lesson-content";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";
import type { lessonSchema } from "@/lib/validation";

type LessonInput = z.infer<typeof lessonSchema>;

export function prepareLessonPatch(
  body: Partial<LessonInput>,
  editorHtmlFallback?: string,
): Record<string, unknown> {
  const patch: Record<string, unknown> = { ...body };
  delete patch.cross_category_ids;
  delete patch.autosave;
  delete patch.create_revision;

  if (typeof body.content_html === "string") {
    patch.content_html = sanitizeArticleHtml(body.content_html);
    if (!body.content_plain) patch.content_plain = htmlToPlainText(patch.content_html as string);
  } else if (editorHtmlFallback) {
    patch.content_html = sanitizeArticleHtml(editorHtmlFallback);
    patch.content_plain = htmlToPlainText(patch.content_html as string);
  }

  if (patch.slug === "" || patch.slug === undefined) {
    delete patch.slug;
  }
  if (patch.slug == null && typeof body.title === "string" && body.title.trim()) {
    patch.slug = slugifyTitle(body.title);
  }
  if (patch.published_at === "") {
    patch.published_at = null;
  }

  return patch;
}

export async function maybeCreateRevision(
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
  opts: { autosave?: boolean; createRevision?: boolean },
) {
  if (opts.autosave) return;
  if (opts.createRevision === false) return;
  await createLessonRevision(supabase, lesson, editedBy);
}
