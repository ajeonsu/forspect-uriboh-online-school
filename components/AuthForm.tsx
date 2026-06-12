"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthOAuthBlock } from "@/components/AuthOAuthBlock";
import { safeNextPath } from "@/lib/auth-oauth";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const afterLogin = safeNextPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          // Role is always 'user' via DB trigger; never accept role from the client.
        },
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setLoading(false);
      router.push("/");
      router.refresh();
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }
    setLoading(false);
    router.push(mode === "login" ? afterLogin : "/");
    router.refresh();
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <AuthOAuthBlock
        googleLabel={mode === "login" ? "Googleでログイン" : "Googleで登録"}
      />
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
      {mode === "signup" && (
        <label>
          表示名
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </label>
      )}
      <label>
        メールアドレス
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 4 }}
        />
      </label>
      <label>
        パスワード
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 4 }}
        />
      </label>
      {error && <p style={{ color: "#E11D48", fontSize: 13 }}>{error}</p>}
      <button type="submit" className="btn btn--primary" disabled={loading}>
        {loading ? "処理中…" : mode === "login" ? "メールでログイン" : "メールで登録"}
      </button>
    </form>
    </div>
  );
}
