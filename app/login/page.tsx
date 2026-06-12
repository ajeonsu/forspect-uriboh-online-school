import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { LoginAuthErrorNotice } from "@/components/LoginAuthErrorNotice";
import { LoginSignedOutNotice } from "@/components/LoginSignedOutNotice";

export default function LoginPage() {
  return (
    <div className="static-page" style={{ maxWidth: 440, margin: "48px auto", padding: "0 28px" }}>
      <h1 className="static-page__title">ログイン</h1>
      <Suspense fallback={null}>
        <LoginSignedOutNotice />
        <LoginAuthErrorNotice />
      </Suspense>
      <Suspense fallback={<p style={{ fontSize: 13 }}>読み込み中…</p>}>
        <AuthForm mode="login" />
      </Suspense>
      <p style={{ marginTop: 16, fontSize: 13 }}>
        アカウントをお持ちでない方は <Link href="/signup">新規登録</Link>
      </p>
    </div>
  );
}
