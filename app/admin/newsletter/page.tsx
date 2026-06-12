import Link from "next/link";
import { AdminCard, AdminPageHeader, AdminTableWrap } from "@/components/admin/ui/AdminChrome";
import { requireEditor } from "@/lib/auth";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";

export default async function AdminNewsletterPage() {
  const profile = await requireEditor();
  if (profile.role !== "admin") {
    return (
      <>
        <AdminPageHeader title="Newsletter subscribers" />
        <AdminCard>
          <p className="admin-empty">Site-wide newsletter subscribers are visible to administrators only.</p>
        </AdminCard>
      </>
    );
  }
  const supabase = await createPrivilegedServerClient();
  const { data: rows } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <>
      <AdminPageHeader
        title="Newsletter subscribers"
        actions={
          <a href="/api/admin/newsletter/export" className="btn btn--primary">
            Export CSV
          </a>
        }
      />

      <AdminCard>
        {(rows ?? []).length === 0 ? (
          <p className="admin-empty">
            No subscribers yet. Apply migration <code>003_admin_cms.sql</code> if this table is missing.
          </p>
        ) : (
          <AdminTableWrap>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {(rows ?? []).map((r) => (
                  <tr key={r.id}>
                    <td>{r.email}</td>
                    <td className="admin-table__muted">{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableWrap>
        )}
      </AdminCard>

      <p className="admin-table__muted" style={{ fontSize: 13 }}>
        <Link href="/admin">← Dashboard</Link>
      </p>
    </>
  );
}
