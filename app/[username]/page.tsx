import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { requireWorkspaceAccess } from "@/lib/workspace/auth";

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await requireWorkspaceAccess(username);
  return <AdminDashboard cmsBase={`/${username}`} profile={profile} />;
}
