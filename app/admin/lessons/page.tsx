import { AdminLessonsManager } from "@/components/admin/cms/AdminLessonsManager";
import { getGenreOptions } from "@/lib/admin/genres";
import { queryAdminLessons } from "@/lib/admin/lessons-query";
import { requireEditor } from "@/lib/auth";
import { editorScope } from "@/lib/cms/editor-scope";

export default async function AdminLessonsPage() {
  const [genreOptions, profile] = await Promise.all([getGenreOptions(), requireEditor()]);
  const scope = editorScope(profile);
  const initial = await queryAdminLessons({ page: 1, limit: 20, sort: "newest" }, scope);
  return <AdminLessonsManager genres={genreOptions} initial={initial} />;
}
