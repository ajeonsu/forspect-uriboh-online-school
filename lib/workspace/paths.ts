/** Build a CMS path under a workspace or `/admin` base (safe on server and client). */
export function cmsHref(base: string, path: string): string {
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}
