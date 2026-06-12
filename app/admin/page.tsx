import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { requireAdminCms } from "@/lib/workspace/auth";

export default async function AdminDashboardPage() {
  const profile = await requireAdminCms();
  return <AdminDashboard cmsBase="/admin" profile={profile} />;
}
