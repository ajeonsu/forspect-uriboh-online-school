import { UserRoleSelect } from "@/components/admin/UserRoleSelect";
import { AdminCard, AdminPageHeader, AdminTableWrap } from "@/components/admin/ui/AdminChrome";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminUsersPage() {
  const supabase = createAdminClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminPageHeader
        title="Users"
        description="You cannot demote the last remaining admin account."
      />

      <AdminCard>
        <AdminTableWrap>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.display_name ?? "—"}</td>
                  <td>
                    <UserRoleSelect userId={u.id} currentRole={u.role} />
                  </td>
                  <td className="admin-table__muted">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableWrap>
      </AdminCard>
    </>
  );
}
