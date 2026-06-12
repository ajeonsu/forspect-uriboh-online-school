import { CmsLink } from "@/components/admin/CmsLink";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GenreForm } from "@/components/admin/GenreForm";
import { AdminCard, AdminPageHeader } from "@/components/admin/ui/AdminChrome";
import { getGenreOptions } from "@/lib/admin/genres";
import { requireEditor } from "@/lib/auth";
import { editorScope } from "@/lib/cms/editor-scope";
import { getCategoryForEditor } from "@/lib/cms/scoped-db";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";

export default async function AdminCategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireEditor();
  const scope = editorScope(profile);
  const { id } = await params;
  const supabase = await createPrivilegedServerClient();
  const [data, parentOptions] = await Promise.all([
    getCategoryForEditor(supabase, scope, id),
    getGenreOptions(),
  ]);
  if (!data) notFound();

  return (
    <>
      <AdminPageHeader
        title={`Edit category: ${data.label}`}
        description={data.id}
        actions={
          <Link href={`/lessons/${id}`} target="_blank" className="admin-btn admin-btn--sm">
            Preview on site
          </Link>
        }
      />
      <p className="admin-table__muted" style={{ marginTop: -8, marginBottom: 8 }}>
        <CmsLink path="/categories">← Categories</CmsLink>
      </p>
      <AdminCard>
        <GenreForm initial={data} parentOptions={parentOptions} />
      </AdminCard>
    </>
  );
}
