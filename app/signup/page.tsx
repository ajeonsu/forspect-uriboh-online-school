import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="static-page" style={{ maxWidth: 440, margin: "48px auto", padding: "0 28px" }}>
      <h1 className="static-page__title">新規登録</h1>
      <Suspense fallback={<p style={{ fontSize: 13 }}>読み込み中…</p>}>
        <AuthForm mode="signup" />
      </Suspense>
      <p style={{ marginTop: 16, fontSize: 13 }}>
        すでにアカウントがある方は <Link href="/login">ログイン</Link>
      </p>
    </div>
  );
}
