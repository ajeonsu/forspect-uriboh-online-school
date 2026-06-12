import { AdminNoTranslate } from "@/components/admin/AdminNoTranslate";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminToastProvider } from "@/components/admin/cms/AdminToast";
import { requireEditor } from "@/lib/auth";
import "./admin.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireEditor();

  return (
    <div className="admin-shell notranslate" translate="no" suppressHydrationWarning>
      <div className="admin-shell__inner">
        <AdminNoTranslate />
        <AdminToastProvider>
          <AdminNav role={profile.role} />
          <div className="admin-page">{children}</div>
        </AdminToastProvider>
      </div>
    </div>
  );
}
