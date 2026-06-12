import { jsonError, jsonOk, requireApiEditor } from "@/lib/api";
import { logAdminActivity } from "@/lib/cms/activity-log";
import { editorScope } from "@/lib/cms/editor-scope";
import { assertLessonAccess } from "@/lib/cms/scoped-db";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const scope = editorScope(profile!);
  const { id } = await ctx.params;
  const supabase = await createPrivilegedServerClient();
  let src;
  try {
    src = await assertLessonAccess(supabase, scope, id);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Forbidden", 403);
  }

  const copyNo = `${src.lesson_no}-copy`.slice(0, 32);
  const { data, error: dbError } = await supabase
    .from("lessons")
    .insert({
      category_id: src.category_id,
      lesson_no: copyNo,
      slug: src.slug ? `${src.slug}-copy` : null,
      title: `${src.title} (copy)`,
      excerpt: src.excerpt,
      seo_title: src.seo_title,
      seo_description: src.seo_description,
      content_json: src.content_json,
      content_html: src.content_html,
      content_plain: src.content_plain,
      thumbnail_path: src.thumbnail_path,
      thumbnail_url: src.thumbnail_url,
      thumb_intro: src.thumb_intro,
      thumb_accent: src.thumb_accent,
      thumb_subtitle: src.thumb_subtitle,
      views_count: 0,
      likes_count: 0,
      popular_rank: null,
      status: "draft",
      published_at: null,
      created_by: profile!.id,
      updated_by: profile!.id,
    })
    .select()
    .single();
  if (dbError) return jsonError(dbError.message, 500);

  await logAdminActivity(supabase, {
    adminId: profile!.id,
    action: "lesson.duplicate",
    entityType: "lesson",
    entityId: data.id,
    metadata: { source_id: id },
  });
  return jsonOk({ lesson: data }, 201);
}
