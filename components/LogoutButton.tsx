"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppToast } from "@/components/AppToast";
import { useConfirm } from "@/components/AppConfirm";
import { withPublicConfirm } from "@/lib/confirm-action";
import { queueFlashToast } from "@/lib/flash-toast";
import { createClient } from "@/lib/supabase/client";

/** Client sign-out avoids an extra server round-trip before navigation. */
export function LogoutButton() {
  const router = useRouter();
  const { push: toast } = useAppToast();
  const { confirm } = useConfirm();
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    if (busy) return;
    if (
      !(await confirm(
        withPublicConfirm("ログアウトしますか？", {
          title: "ログアウト",
          confirmLabel: "ログアウト",
        }),
      ))
    ) {
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast("ログアウトに失敗しました", "error");
      setBusy(false);
      return;
    }
    queueFlashToast("ログアウトしました");
    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={onLogout} disabled={busy}>
      {busy ? "ログアウト中…" : "ログアウト"}
    </button>
  );
}
