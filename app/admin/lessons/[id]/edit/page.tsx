import { notFound } from "next/navigation";
import { LessonEditorWorkspace } from "@/components/admin/cms/LessonEditorWorkspace";
import { AdminPageHeader } from "@/components/admin/ui/AdminChrome";
import { getLessonCrossLinkIds } from "@/lib/admin/lesson-cross-links";
import { getGenreOptions } from "@/lib/admin/genres";
import { requireEditor } from "@/lib/auth";
import { editorScope } from "@/lib/cms/editor-scope";
import { getLessonForEditor } from "@/lib/cms/scoped-db";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";

export default async function AdminLessonEditPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireEditor();
  const scope = editorScope(profile);
  const { id } = await params;
  const supabase = await createPrivilegedServerClient();
  const [data, genreOptions, cross_category_ids] = await Promise.all([
    getLessonForEditor(supabase, scope, id),
    getGenreOptions(),
    getLessonCrossLinkIds(supabase, id),
  ]);
  if (!data) notFound();

  return (
    <>
      <AdminPageHeader title="Edit lesson" description={data.title} />
      <LessonEditorWorkspace
        initial={{
          ...data,
          content_json: data.content_json as unknown[] | null,
          cross_category_ids,
        }}
        genreOptions={genreOptions}
      />
    </>
  );
}
