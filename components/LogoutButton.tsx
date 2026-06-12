"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Client sign-out avoids an extra server round-trip before navigation. */
export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login?signedOut=1");
    router.refresh();
  }

  return (
    <button type="button" onClick={onLogout} disabled={busy}>
      {busy ? "ログアウト中…" : "ログアウト"}
    </button>
  );
}
