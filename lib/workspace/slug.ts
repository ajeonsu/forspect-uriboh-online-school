import type { Profile } from "@/lib/types";

/** First path segments that are not user workspace slugs. */
export const RESERVED_WORKSPACE_SLUGS = new Set([
  "admin",
  "api",
  "auth",
  "categories",
  "courses",
  "faq",
  "favorites",
  "login",
  "logout",
  "search",
  "seminars",
  "signup",
  "static",
  "_next",
]);

export const WORKSPACE_SECTIONS = new Set([
  "lessons",
  "categories",
  "seminars",
  "analytics",
  "media",
  "genres",
]);

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

export function slugifyWorkspaceName(raw: string): string {
  const s = raw
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  if (!s || !SLUG_RE.test(s)) return "user";
  if (RESERVED_WORKSPACE_SLUGS.has(s)) return `${s}-workspace`;
  return s;
}

/** Public URL slug for a contributor workspace (from display name or email). */
export function workspaceSlugFromProfile(profile: Pick<Profile, "email" | "display_name" | "id">): string {
  const fromName = profile.display_name?.trim();
  if (fromName) return slugifyWorkspaceName(fromName);
  const emailLocal = profile.email?.split("@")[0]?.trim();
  if (emailLocal) return slugifyWorkspaceName(emailLocal);
  return slugifyWorkspaceName(profile.id.slice(0, 8));
}

export function cmsBasePath(profile: Profile): string {
  if (profile.role === "admin") return "/admin";
  return `/${workspaceSlugFromProfile(profile)}`;
}

export function parseWorkspacePath(pathname: string): { slug: string; section?: string } | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  const slug = parts[0];
  if (RESERVED_WORKSPACE_SLUGS.has(slug)) return null;
  if (parts.length === 1) return { slug };
  if (WORKSPACE_SECTIONS.has(parts[1])) return { slug, section: parts[1] };
  return null;
}

export function isWorkspacePath(pathname: string): boolean {
  return parseWorkspacePath(pathname) !== null;
}
