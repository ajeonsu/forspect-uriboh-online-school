import { AdminNoTranslate } from "@/components/admin/AdminNoTranslate";
import { AdminNav } from "@/components/admin/AdminNav";
import { CmsWorkspaceProvider } from "@/components/admin/CmsWorkspaceProvider";
import { requireAdminCms } from "@/lib/workspace/auth";
import "./admin.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdminCms();

  return (
    <CmsWorkspaceProvider cmsBase="/admin">
      <div className="admin-shell notranslate" translate="no" suppressHydrationWarning>
        <div className="admin-shell__inner">
          <AdminNoTranslate />
          <AdminNav role={profile.role} />
          <div className="admin-page">{children}</div>
        </div>
      </div>
    </CmsWorkspaceProvider>
  );
}
