"use client";

import { useAdminToast } from "@/components/admin/cms/AdminToast";
import { useConfirm } from "@/components/AppConfirm";
import { withAdminConfirm } from "@/lib/confirm-action";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function GenreArchiveButton({ genreId, isActive }: { genreId: string; isActive: boolean }) {
  const router = useRouter();
  const { push: toast } = useAdminToast();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const msg = isActive
      ? `Archive genre "${genreId}"? It will be hidden from the public site.`
      : `Activate genre "${genreId}"?`;
    if (
      !(await confirm(
        withAdminConfirm(msg, {
          title: isActive ? "Archive category" : "Activate category",
          tone: isActive ? "danger" : "default",
          confirmLabel: isActive ? "Archive" : "Activate",
        }),
      ))
    ) {
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/admin/categories/${genreId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    });
    setBusy(false);
    if (!res.ok) {
      toast("Update failed", "error");
      return;
    }
    toast(isActive ? "Category archived" : "Category activated");
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
