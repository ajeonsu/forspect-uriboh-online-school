import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "@/lib/supabase/env";
import { isWorkspacePath } from "@/lib/workspace/slug";

function isAdminApi(pathname: string) {
  return pathname.startsWith("/api/admin");
}

function isAdminPage(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isCmsPage(pathname: string) {
  return isAdminPage(pathname) || isWorkspacePath(pathname);
}

function isAdminOnlyPage(pathname: string) {
  return pathname === "/admin/users" || pathname.startsWith("/admin/users/");
}

function isAdminOnlyApi(pathname: string) {
  return (
    pathname.startsWith("/api/admin/users") ||
    pathname === "/api/admin/newsletter/export"
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  if (isCmsPage(pathname)) {
    requestHeaders.set("x-uriboh-admin-route", "1");
  }

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const needsAuth = isCmsPage(pathname) || isAdminApi(pathname);
  if (!needsAuth) return response;

  const config = getSupabasePublicConfig();
  if (!config) {
    if (isAdminPage(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isAdminApi(pathname)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const needsRoleCheck = isAdminOnlyPage(pathname) || isAdminOnlyApi(pathname);
  if (!needsRoleCheck) {
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    if (isAdminApi(pathname)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (profile.role !== "admin") {
    if (isAdminApi(pathname)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/:username/lessons/:path*",
    "/:username/categories/:path*",
    "/:username/seminars/:path*",
    "/:username/analytics/:path*",
    "/:username/media/:path*",
    "/:username/genres/:path*",
    "/:username",
  ],
};
