import { CmsLink } from "@/components/admin/CmsLink";
import { GenreArchiveButton } from "@/components/admin/GenreArchiveButton";
import Link from "next/link";
import { AdminCard, AdminPageHeader, AdminTableWrap, StatusBadge } from "@/components/admin/ui/AdminChrome";
import { requireEditor } from "@/lib/auth";
import { editorScope } from "@/lib/cms/editor-scope";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";

export default async function AdminCategoriesPage() {
  const profile = await requireEditor();
  const scope = editorScope(profile);
  const supabase = await createPrivilegedServerClient();
  let query = supabase
    .from("categories")
    .select("id, parent_id, label, title, sort_order, is_active, created_by, updated_at")
    .order("sort_order");
  if (!scope.isAdmin) query = query.eq("created_by", scope.userId);
  const { data: categories } = await query;

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description={
          scope.isAdmin
            ? "Categories control lesson groupings on the public site (/categories)."
            : "Your categories only. Use existing site categories when assigning lessons."
        }
        actions={
          <CmsLink path="/categories/new" className="btn btn--primary">
            New category
          </CmsLink>
        }
      />

      <AdminCard>
        <AdminTableWrap>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Label</th>
                <th>Title</th>
                <th>Parent</th>
                <th className="admin-table__num">Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(categories ?? []).map((g) => (
                <tr key={g.id}>
                  <td className="admin-table__muted">{g.id}</td>
                  <td>{g.label}</td>
                  <td className="admin-table__title">{g.title}</td>
                  <td className="admin-table__muted">{g.parent_id ?? "—"}</td>
                  <td className="admin-table__num">{g.sort_order}</td>
                  <td>
                    <StatusBadge value={g.is_active ? "active" : "inactive"} />
                  </td>
                  <td>
                    <span className="admin-table__actions">
                      <CmsLink path={`/categories/${g.id}/edit`} className="admin-btn admin-btn--sm">
                        Edit
                      </CmsLink>
                      <Link
                        href={`/lessons/${g.id}`}
                        target="_blank"
                        className="admin-btn admin-btn--sm admin-btn--ghost"
                      >
                        Preview
                      </Link>
                      <GenreArchiveButton genreId={g.id} isActive={g.is_active} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableWrap>
      </AdminCard>
    </>
  );
}
