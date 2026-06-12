/** Public site areas that require a signed-in member to view. */
export function isMemberContentPage(pathname: string): boolean {
  if (pathname === "/courses" || pathname.startsWith("/courses/")) return true;
  if (pathname === "/lessons" || pathname.startsWith("/lessons/")) return true;
  if (pathname === "/seminars" || pathname.startsWith("/seminars/")) return true;
  if (pathname === "/categories" || pathname.startsWith("/categories/")) return true;
  if (pathname === "/search" || pathname.startsWith("/search/")) return true;
  if (pathname === "/favorites" || pathname.startsWith("/favorites/")) return true;
  return false;
}

export function isMemberContentApi(pathname: string): boolean {
  if (pathname.startsWith("/api/lessons")) return true;
  if (pathname.startsWith("/api/seminars")) return true;
  if (pathname.startsWith("/api/favorites")) return true;
  if (pathname === "/api/search" || pathname.startsWith("/api/search/")) return true;
  return false;
}
