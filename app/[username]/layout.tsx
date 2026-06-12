import { AdminNoTranslate } from "@/components/admin/AdminNoTranslate";
import { AdminNav } from "@/components/admin/AdminNav";
import { CmsWorkspaceProvider } from "@/components/admin/CmsWorkspaceProvider";
import { requireWorkspaceAccess } from "@/lib/workspace/auth";
import "../admin/admin.css";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await requireWorkspaceAccess(username);
  return (
    <CmsWorkspaceProvider cmsBase={`/${username}`}>
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
