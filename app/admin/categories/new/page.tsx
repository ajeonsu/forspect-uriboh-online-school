import { GenreForm } from "@/components/admin/GenreForm";
import { AdminCard, AdminPageHeader } from "@/components/admin/ui/AdminChrome";
import { getGenreOptions } from "@/lib/admin/genres";

export default async function AdminCategoryNewPage() {
  const parentOptions = await getGenreOptions();

  return (
    <>
      <AdminPageHeader
        title="New category"
        description="Create a category or subcategory. Parent is optional for top-level groups."
      />
      <AdminCard>
        <GenreForm parentOptions={parentOptions} />
      </AdminCard>
    </>
  );
}
