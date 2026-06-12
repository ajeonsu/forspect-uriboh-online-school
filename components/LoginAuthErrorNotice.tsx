"use client";

import { useSearchParams } from "next/navigation";

export function LoginAuthErrorNotice() {
  const err = useSearchParams().get("error");
  if (err !== "auth_callback") return null;

  return (
    <p style={{ marginBottom: 16, fontSize: 13, color: "#E11D48" }}>
      Googleログインに失敗しました。SupabaseのGoogle設定とリダイレクトURLを確認して、もう一度お試しください。
    </p>
  );
}
