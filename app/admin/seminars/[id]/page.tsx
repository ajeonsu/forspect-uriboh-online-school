import { notFound } from "next/navigation";
import { SeminarModerationForm } from "@/components/admin/SeminarModerationForm";
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
      <h1>Seminar</h1>
      <SeminarModerationForm initial={data} isAdmin={scope.isAdmin} />
    </>
  );
}
