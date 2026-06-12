import { AdminCard, AdminPageHeader, AdminTableWrap } from "@/components/admin/ui/AdminChrome";
import { getAnalyticsSummary } from "@/lib/admin/analytics";
import { requireEditor } from "@/lib/auth";

export default async function AdminAnalyticsPage() {
  const profile = await requireEditor();
  if (profile.role !== "admin") {
    return (
      <>
        <AdminPageHeader title="Analytics" />
        <AdminCard>
          <p className="admin-empty">
            Site-wide analytics are for administrators. Use the dashboard to see stats for your own lessons and
            seminars.
          </p>
        </AdminCard>
      </>
    );
  }
  let summary;
  try {
    summary = await getAnalyticsSummary();
  } catch {
    return (
      <>
        <AdminPageHeader title="Analytics" />
        <AdminCard>
          <p className="admin-empty">
            Could not load analytics. Run migrations <code>003_admin_cms.sql</code> and{" "}
            <code>004_admin_cms_rls.sql</code>.
          </p>
        </AdminCard>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Analytics"
        description="Search trends, lesson engagement, and recent activity from the last 7 days."
      />

      <div className="admin-dashboard-cols" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <AdminCard title="Top searches">
          <AdminTableWrap>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Query</th>
                  <th className="admin-table__num">Count</th>
                </tr>
              </thead>
              <tbody>
                {summary.topSearches.map((r) => (
                  <tr key={r.query}>
                    <td>{r.query}</td>
                    <td className="admin-table__num">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableWrap>
        </AdminCard>

        <AdminCard title="Events (last 7 days)">
          <AdminTableWrap>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th className="admin-table__num">Events</th>
                </tr>
              </thead>
              <tbody>
                {summary.eventsLast7Days.map((r) => (
                  <tr key={r.day}>
                    <td>{r.day}</td>
                    <td className="admin-table__num">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableWrap>
        </AdminCard>
      </div>

      <AdminCard title="Top lessons by favorites">
        <AdminTableWrap>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th className="admin-table__num">Count</th>
              </tr>
            </thead>
            <tbody>
              {summary.topLessonsByFavorites.map((r) => (
                <tr key={r.lesson_id}>
                  <td>{r.title}</td>
                  <td className="admin-table__num">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableWrap>
      </AdminCard>

      <AdminCard title="Top lessons by likes">
        <AdminTableWrap>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th className="admin-table__num">Count</th>
              </tr>
            </thead>
            <tbody>
              {summary.topLessonsByLikes.map((r) => (
                <tr key={r.lesson_id}>
                  <td>{r.title}</td>
                  <td className="admin-table__num">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableWrap>
      </AdminCard>
    </>
  );
}
