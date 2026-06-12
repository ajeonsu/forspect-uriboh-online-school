"use client";

import { useAdminToast } from "@/components/admin/cms/AdminToast";
import { useConfirm } from "@/components/AppConfirm";
import { withAdminConfirm } from "@/lib/confirm-action";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserRoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const { push: toast } = useAdminToast();
  const { confirm: askConfirm } = useConfirm();
  const [role, setRole] = useState(currentRole);
  const [msg, setMsg] = useState("");

  async function onChange(next: string) {
    if (
      !(await askConfirm(
        withAdminConfirm(`Change this user's role to "${next}"?`, { title: "Change role" }),
      ))
    ) {
      return;
    }
    setMsg("");
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: next }),
    });
    const j = (await res.json()) as { error?: string };
    if (!res.ok) {
      const err = j.error ?? "Update failed";
      setMsg(err);
      toast(err, "error");
      return;
    }
    setRole(next);
    toast(`Role updated to ${next}`);
    router.refresh();
  }

  return (
    <div>
      <select value={role} onChange={(e) => void onChange(e.target.value)}>
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
      {msg && <span style={{ color: "#E11D48", marginLeft: 8, fontSize: 12 }}>{msg}</span>}
    </div>
  );
}
