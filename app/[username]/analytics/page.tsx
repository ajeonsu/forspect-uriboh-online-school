import { AdminAnalyticsView } from "@/components/admin/AdminAnalyticsView";
import { AdminCard, AdminPageHeader } from "@/components/admin/ui/AdminChrome";
import { getAnalyticsSummary } from "@/lib/admin/analytics";
import { editorScope } from "@/lib/cms/editor-scope";
import { requireWorkspaceAccess } from "@/lib/workspace/auth";

export default async function WorkspaceAnalyticsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await requireWorkspaceAccess(username);
  let summary;
  try {
    summary = await getAnalyticsSummary(editorScope(profile));
  } catch {
    return (
      <>
        <AdminPageHeader title="Analytics" />
        <AdminCard>
          <p className="admin-empty">Could not load analytics.</p>
        </AdminCard>
      </>
    );
  }
  return <AdminAnalyticsView summary={summary} />;
}
