"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GenreArchiveButton({ genreId, isActive }: { genreId: string; isActive: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const action = isActive ? "archive" : "activate";
    const msg = isActive
      ? `Archive genre "${genreId}"? It will be hidden from the public site.`
      : `Activate genre "${genreId}"?`;
    if (!window.confirm(msg)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/categories/${genreId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    });
    setBusy(false);
    if (!res.ok) {
      alert("Update failed");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      className={`admin-btn admin-btn--sm${isActive ? " admin-btn--danger" : ""}`}
      disabled={busy}
      onClick={() => void toggle()}
    >
      {isActive ? "Archive" : "Activate"}
    </button>
  );
}
