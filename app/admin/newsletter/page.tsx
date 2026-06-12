import Link from "next/link";
import { NewsletterExportButton } from "@/components/admin/NewsletterExportButton";
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
  const { data: rows, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const tableMissing =
    error &&
    (error.code === "42P01" ||
      /newsletter_subscribers|does not exist|schema cache/i.test(error.message));

  return (
    <>
      <AdminPageHeader
        title="Newsletter subscribers"
        actions={<NewsletterExportButton />}
      />

      <AdminCard>
        {tableMissing ? (
          <div className="admin-empty" style={{ display: "grid", gap: 8 }}>
            <p>
              The <code>newsletter_subscribers</code> table is not in your Supabase project yet.
            </p>
            <p className="admin-table__muted" style={{ margin: 0, fontSize: 13 }}>
              In the Supabase SQL Editor, run{" "}
              <code>supabase/migrations/003_admin_cms.sql</code> and{" "}
              <code>004_admin_cms_rls.sql</code>, then refresh this page.
            </p>
          </div>
        ) : error ? (
          <p className="admin-empty" style={{ color: "#be123c" }}>
            Could not load subscribers: {error.message}
          </p>
        ) : (rows ?? []).length === 0 ? (
          <div className="admin-empty" style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0 }}>No subscribers yet.</p>
            <p className="admin-table__muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
              This list fills when emails are saved to <code>newsletter_subscribers</code>. The public
              site does not include a newsletter signup form yet, so an empty list is normal after setup.
              Use <strong>Export CSV</strong> once you have entries.
            </p>
          </div>
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
