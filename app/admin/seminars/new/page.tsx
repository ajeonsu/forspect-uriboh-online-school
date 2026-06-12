import { CmsLink } from "@/components/admin/CmsLink";
import { SeminarModerationForm } from "@/components/admin/SeminarModerationForm";
import { seminarFormDefaults } from "@/lib/admin/seminar-form";
import { AdminCard, AdminPageHeader } from "@/components/admin/ui/AdminChrome";
import { requireEditor } from "@/lib/auth";
import { editorScope } from "@/lib/cms/editor-scope";

export default async function AdminSeminarNewPage() {
  const profile = await requireEditor();
  const scope = editorScope(profile);

  return (
    <>
      <AdminPageHeader
        title="New seminar"
        description="Create a webinar listing. Contributors submit as draft with pending moderation; admins can publish directly."
        actions={
          <CmsLink path="/seminars" className="btn">
            ← Seminars
          </CmsLink>
        }
      />
      <AdminCard>
        <SeminarModerationForm
          initial={seminarFormDefaults(scope.isAdmin)}
          isAdmin={scope.isAdmin}
          isNew
        />
      </AdminCard>
    </>
  );
}
