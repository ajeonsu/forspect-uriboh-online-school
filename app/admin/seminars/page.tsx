import Link from "next/link";
import { AdminSeminarFilters } from "@/components/admin/AdminSeminarFilters";
import { AdminCard, AdminPageHeader, AdminTableWrap, StatusBadge } from "@/components/admin/ui/AdminChrome";
import { requireEditor } from "@/lib/auth";
import { editorScope } from "@/lib/cms/editor-scope";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";

export default async function AdminSeminarsPage({
  searchParams,
}: {
  searchParams: Promise<{ moderation?: string }>;
}) {
  const profile = await requireEditor();
  const scope = editorScope(profile);
  const { moderation } = await searchParams;
  const supabase = await createPrivilegedServerClient();
  let query = supabase
    .from("seminars")
    .select("id, title, status, moderation_status, start_at")
    .order("updated_at", { ascending: false });
  if (!scope.isAdmin) query = query.eq("created_by", scope.userId);
  if (moderation && scope.isAdmin) query = query.eq("moderation_status", moderation);
  const { data: seminars } = await query;

  return (
    <>
      <AdminPageHeader title="Seminars" description="Review submissions, approve content, and manage webinar listings." />

      <AdminCard>
        {scope.isAdmin ? <AdminSeminarFilters moderation={moderation} /> : null}
        <div style={{ marginTop: 16 }}>
          {(seminars ?? []).length === 0 ? (
            <p className="admin-empty">No seminars match this filter.</p>
          ) : (
            <AdminTableWrap>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Moderation</th>
                    <th>Start</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(seminars ?? []).map((s) => (
                    <tr key={s.id}>
                      <td className="admin-table__title">{s.title}</td>
                      <td>
                        <StatusBadge value={s.status ?? "draft"} />
                      </td>
                      <td>
                        <StatusBadge value={s.moderation_status ?? "pending"} />
                      </td>
                      <td className="admin-table__muted">
                        {s.start_at ? new Date(s.start_at).toLocaleString() : "—"}
                      </td>
                      <td>
                        <Link href={`/admin/seminars/${s.id}`} className="admin-btn admin-btn--sm">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableWrap>
          )}
        </div>
      </AdminCard>
    </>
  );
}
