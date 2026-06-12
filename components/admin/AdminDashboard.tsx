import Link from "next/link";
import { AdminCard, AdminPageHeader, AdminTableWrap, StatusBadge } from "@/components/admin/ui/AdminChrome";
import { cmsHref } from "@/lib/workspace/paths";
import { getAdminDashboardStats } from "@/lib/admin/dashboard";
import { editorScope } from "@/lib/cms/editor-scope";
import type { Profile } from "@/lib/types";

export async function AdminDashboard({ cmsBase, profile }: { cmsBase: string; profile: Profile }) {
  const stats = await getAdminDashboardStats(editorScope(profile));

  return (
    <>
      <AdminPageHeader
        title={stats.isContributorView ? "My content" : "Editorial dashboard"}
        description={
          stats.isContributorView
            ? "Create and manage your own lessons, categories, seminars, and media. Imported site content is not shown here."
            : "Publish workflow, drafts, and engagement at a glance."
        }
      />

      <div className="admin-stat-grid">
        <Stat label="Lessons" value={stats.totalLessons} href={cmsHref(cmsBase, "/lessons")} />
        <Stat label="Published" value={stats.publishedLessons} />
        <Stat label="Draft" value={stats.draftLessons} />
        <Stat label="Archived" value={stats.archivedLessons} />
        <Stat label="Categories" value={stats.totalGenres} href={cmsHref(cmsBase, "/categories")} />
        <Stat label="Seminars" value={stats.totalSeminars} href={cmsHref(cmsBase, "/seminars")} />
        <Stat
          label="Pending seminars"
          value={stats.pendingSeminars}
          href={cmsHref(cmsBase, "/seminars?moderation=pending")}
        />
        {!stats.isContributorView && (
          <>
            <Stat label="Users" value={stats.totalUsers} href={cmsHref(cmsBase, "/users")} />
            <Stat label="Favorites" value={stats.totalFavorites} />
            <Stat label="Likes" value={stats.totalLikes} />
          </>
        )}
      </div>

      <div className="admin-dashboard-cols">
        <AdminCard title="Recent edits">
          <AdminTableWrap>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEdits.map((l) => (
                  <tr key={l.id}>
                    <td className="admin-table__title">
                      <Link href={cmsHref(cmsBase, `/lessons/${l.id}/edit`)}>{l.title}</Link>
                    </td>
                    <td>
                      <StatusBadge value={l.status} />
                    </td>
                    <td className="admin-table__muted">{new Date(l.updated_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableWrap>
        </AdminCard>

        <AdminCard title="Top engagement">
          <h3 className="admin-section-title" style={{ marginTop: 0 }}>
            Top viewed
          </h3>
          <ul className="admin-rank-list">
            {stats.topViewed.map((l) => (
              <li key={l.id}>
                <Link href={cmsHref(cmsBase, `/lessons/${l.id}/edit`)}>{l.title}</Link>
                <span>{l.views_count.toLocaleString()} views</span>
              </li>
            ))}
          </ul>
          <h3 className="admin-section-title" style={{ marginTop: 20 }}>
            Top liked
          </h3>
          <ul className="admin-rank-list">
            {stats.topLiked.map((l) => (
              <li key={l.id}>
                <Link href={cmsHref(cmsBase, `/lessons/${l.id}/edit`)}>{l.title}</Link>
                <span>{l.likes_count.toLocaleString()} likes</span>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>
    </>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href?: string }) {
  const inner = (
    <>
      <div className="admin-stat__label">{label}</div>
      <div className="admin-stat__value">{value.toLocaleString()}</div>
    </>
  );
  if (href) {
    return (
      <Link href={href} className="admin-stat" style={{ textDecoration: "none", color: "inherit" }}>
        {inner}
      </Link>
    );
  }
  return <div className="admin-stat">{inner}</div>;
}
