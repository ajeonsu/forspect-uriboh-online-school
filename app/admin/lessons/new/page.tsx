import { LessonEditorWorkspace } from "@/components/admin/cms/LessonEditorWorkspace";
import { AdminPageHeader } from "@/components/admin/ui/AdminChrome";
import { getGenreOptions } from "@/lib/admin/genres";

export default async function AdminLessonNewPage() {
  const genreOptions = await getGenreOptions();
  return (
    <>
      <AdminPageHeader title="New lesson" description="Create a draft lesson. Publishing is a separate step after required fields are valid." />
      <LessonEditorWorkspace genreOptions={genreOptions} />
    </>
  );
}
