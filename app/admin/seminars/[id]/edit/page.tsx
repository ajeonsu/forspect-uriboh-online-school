import { redirect } from "next/navigation";

export default async function AdminSeminarEditAlias({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/seminars/${id}`);
}
