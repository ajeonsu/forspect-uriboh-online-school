"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAppToast } from "@/components/AppToast";
import { buildOAuthCallbackUrl, safeNextPath } from "@/lib/auth-oauth";
import { createClient } from "@/lib/supabase/client";

export function GoogleAuthButton({ label }: { label: string }) {
  const searchParams = useSearchParams();
  const afterAuth = safeNextPath(searchParams.get("next"));
  const { push: toast } = useAppToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signInWithGoogle() {
    setError("");
    setBusy(true);
    const supabase = createClient();
    const siteOrigin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || window.location.origin;
    const redirectTo = buildOAuthCallbackUrl(afterAuth, siteOrigin);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    setBusy(false);
    if (oauthError) {
      setError(oauthError.message);
      toast(oauthError.message, "error");
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button
        type="button"
        className="btn btn--google"
        disabled={busy}
        onClick={() => void signInWithGoogle()}
      >
        <GoogleMark />
        {busy ? "リダイレクト中…" : label}
      </button>
      {error ? <p style={{ color: "#E11D48", fontSize: 13, margin: 0 }}>{error}</p> : null}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-5.514 0-10-4.486-10-10s4.486-10 10-10c2.761 0 5.246 1.094 7.094 2.864l5.657-5.657C33.64 10.89 29.028 8 24 8 14.059 8 6 16.059 6 26s8.059 18 18 18 18-8.059 18-18c0-1.989-.328-3.897-.889-5.667z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c2.761 0 5.246 1.094 7.094 2.864l5.657-5.657C33.64 10.89 29.028 8 24 8 14.059 8 6 16.059 6 26c0 2.003.487 3.89 1.306 5.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.989-.328-3.897-.889-5.667z"
      />
    </svg>
  );
}
