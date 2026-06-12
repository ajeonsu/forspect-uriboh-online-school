import { CmsLink } from "@/components/admin/CmsLink";
import { notFound } from "next/navigation";
import { SeminarModerationForm } from "@/components/admin/SeminarModerationForm";
import { AdminCard, AdminPageHeader } from "@/components/admin/ui/AdminChrome";
import { requireEditor } from "@/lib/auth";
import { editorScope } from "@/lib/cms/editor-scope";
import { getSeminarForEditor } from "@/lib/cms/scoped-db";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";

export default async function AdminSeminarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireEditor();
  const scope = editorScope(profile);
  const { id } = await params;
  const supabase = await createPrivilegedServerClient();
  const data = await getSeminarForEditor(supabase, scope, id);
  if (!data) notFound();

  return (
    <>
      <AdminPageHeader
        title={data.title || "Seminar"}
        description="Edit details, publishing status, and moderation."
        actions={
          <CmsLink path="/seminars" className="btn">
            ← Seminars
          </CmsLink>
        }
      />
      <AdminCard>
        <SeminarModerationForm initial={data} isAdmin={scope.isAdmin} />
      </AdminCard>
    </>
  );
}
