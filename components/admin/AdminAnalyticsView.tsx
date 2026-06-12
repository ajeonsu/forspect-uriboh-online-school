import { AdminCard, AdminPageHeader, AdminTableWrap } from "@/components/admin/ui/AdminChrome";
import type { AnalyticsSummary } from "@/lib/admin/analytics";

export function AdminAnalyticsView({ summary }: { summary: AnalyticsSummary }) {
  return (
    <>
      <AdminPageHeader
        title="Analytics"
        description={
          summary.isContributorView
            ? "Engagement for lessons you created (favorites, likes, and views)."
            : "Search trends, lesson engagement, and recent activity from the last 7 days."
        }
      />

      {!summary.isContributorView && (
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
                  {summary.topSearches.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="admin-table__muted">
                        No search data yet. Searches from the site header are recorded when users visit{" "}
                        <code>/search?q=…</code>.
                      </td>
                    </tr>
                  ) : (
                    summary.topSearches.map((r) => (
                      <tr key={r.query}>
                        <td>{r.query}</td>
                        <td className="admin-table__num">{r.count}</td>
                      </tr>
                    ))
                  )}
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
                  {summary.eventsLast7Days.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="admin-table__muted">
                        No events in the last 7 days.
                      </td>
                    </tr>
                  ) : (
                    summary.eventsLast7Days.map((r) => (
                      <tr key={r.day}>
                        <td>{r.day}</td>
                        <td className="admin-table__num">{r.count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </AdminTableWrap>
          </AdminCard>
        </div>
      )}

      {summary.isContributorView && (
        <AdminCard title="Top lessons by views (your content)">
          <AdminTableWrap>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th className="admin-table__num">Views</th>
                </tr>
              </thead>
              <tbody>
                {summary.topLessonsByViews.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="admin-table__muted">
                      No view data yet for your published lessons.
                    </td>
                  </tr>
                ) : (
                  summary.topLessonsByViews.map((r) => (
                    <tr key={r.lesson_id}>
                      <td>{r.title}</td>
                      <td className="admin-table__num">{r.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </AdminTableWrap>
        </AdminCard>
      )}

      <AdminCard title={summary.isContributorView ? "Your lessons — favorites" : "Top lessons by favorites"}>
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

      <AdminCard title={summary.isContributorView ? "Your lessons — likes" : "Top lessons by likes"}>
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
