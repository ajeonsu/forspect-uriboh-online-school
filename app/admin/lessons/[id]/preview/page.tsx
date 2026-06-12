import Link from "next/link";
import { notFound } from "next/navigation";
import { CatNav } from "@/components/CatNav";
import { LessonDetailShell } from "@/components/lesson/LessonDetailShell";
import { getAdminLessonPreviewBundle } from "@/lib/admin/lesson-preview-data";
import { requireEditor } from "@/lib/auth";
import { editorScope } from "@/lib/cms/editor-scope";

export default async function AdminLessonPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireEditor();
  const scope = editorScope(profile);
  const { id } = await params;
  const bundle = await getAdminLessonPreviewBundle(id, scope);
  if (!bundle) notFound();

  const { lesson, category, siblings, related, relatedCategories } = bundle;
  const genreId = lesson.category_id;
  const publicHref =
    lesson.status === "published"
      ? `/lessons/${genreId}/${lesson.lesson_no}`
      : null;

  return (
    <>
      <div className="admin-preview-banner">
        <span>
          <strong>Admin preview</strong> — drafts and unpublished content are visible only to you.
        </span>
        <span className="admin-preview-banner__actions">
          <Link href={`/admin/lessons/${id}/edit`}>← Edit lesson</Link>
          {publicHref && (
            <>
              {" · "}
              <Link href={publicHref} target="_blank">
                Open public URL
              </Link>
            </>
          )}
        </span>
      </div>
      <CatNav activeId={genreId} />
      <LessonDetailShell
        lesson={lesson}
        category={category}
        siblings={siblings}
        related={related}
        relatedCategories={relatedCategories}
        genreId={genreId}
        showEngagement={lesson.status === "published"}
        backHref={`/lessons/${genreId}`}
        backLabel={`← ${category.label}の授業一覧へ戻る`}
      />
    </>
  );
}
