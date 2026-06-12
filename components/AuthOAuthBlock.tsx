"use client";

import { Suspense } from "react";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";

export function AuthOAuthBlock({ googleLabel }: { googleLabel: string }) {
  return (
    <div className="auth-oauth-block">
      <Suspense fallback={<p style={{ fontSize: 13 }}>読み込み中…</p>}>
        <GoogleAuthButton label={googleLabel} />
      </Suspense>
      <p className="auth-oauth-divider" aria-hidden>
        <span>または</span>
      </p>
    </div>
  );
}
