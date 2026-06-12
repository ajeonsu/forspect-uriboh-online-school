import { requireAdmin } from "@/lib/auth";

export default async function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}
