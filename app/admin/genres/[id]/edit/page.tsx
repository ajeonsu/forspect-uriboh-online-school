import { redirect } from "next/navigation";

export default async function AdminGenreEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/categories/${id}/edit`);
}
