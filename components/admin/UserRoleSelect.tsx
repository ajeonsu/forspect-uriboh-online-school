"use client";

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
  const [role, setRole] = useState(currentRole);
  const [msg, setMsg] = useState("");

  async function onChange(next: string) {
    if (!window.confirm(`Change this user's role to ${next}?`)) return;
    setMsg("");
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: next }),
    });
    const j = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMsg(j.error ?? "Update failed");
      return;
    }
    setRole(next);
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
