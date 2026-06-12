export function safeNextPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

/** Redirect target after OAuth (must be allow-listed in Supabase Auth settings). */
export function buildOAuthCallbackUrl(nextPath: string, origin: string): string {
  const base = origin.replace(/\/$/, "");
  const next = safeNextPath(nextPath);
  return `${base}/auth/callback?next=${encodeURIComponent(next)}`;
}
