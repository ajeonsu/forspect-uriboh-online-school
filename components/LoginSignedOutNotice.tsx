"use client";

import { useSearchParams } from "next/navigation";

export function LoginSignedOutNotice() {
  const signedOut = useSearchParams().get("signedOut") === "1";
  if (!signedOut) return null;

  return (
    <p style={{ marginBottom: 16, fontSize: 13, color: "#64748b" }}>ログアウトしました。</p>
  );
}
