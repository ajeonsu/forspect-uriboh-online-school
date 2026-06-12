import { AdminAnalyticsView } from "@/components/admin/AdminAnalyticsView";
import { AdminCard, AdminPageHeader } from "@/components/admin/ui/AdminChrome";
import { getAnalyticsSummary } from "@/lib/admin/analytics";
import { editorScope } from "@/lib/cms/editor-scope";
import { requireAdminCms } from "@/lib/workspace/auth";

export default async function AdminAnalyticsPage() {
  const profile = await requireAdminCms();
  let summary;
  try {
    summary = await getAnalyticsSummary(editorScope(profile));
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

  return <AdminAnalyticsView summary={summary} />;
}
