"use client";

import { useCmsBase } from "@/components/admin/CmsWorkspaceProvider";
import { cmsHref } from "@/lib/workspace/paths";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links: {
  path: string;
  label: string;
  exact?: boolean;
  external?: boolean;
  adminOnly: boolean;
}[] = [
  { path: "", label: "Dashboard", exact: true, adminOnly: false },
  { path: "/categories", label: "Categories", adminOnly: false },
  { path: "/lessons", label: "Lessons", adminOnly: false },
  { path: "/seminars", label: "Seminars", adminOnly: false },
  { path: "/newsletter", label: "Newsletter", adminOnly: true },
  { path: "/analytics", label: "Analytics", adminOnly: false },
  { path: "/media", label: "Media", adminOnly: false },
  { path: "/users", label: "Users", adminOnly: true },
  { path: "/", label: "← Site", external: true, adminOnly: false },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (href === "/") return false;
  if (exact) return pathname === href || pathname === `${href}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ role }: { role: "admin" | "user" }) {
  const pathname = usePathname();
  const cmsBase = useCmsBase();
  const isAdmin = role === "admin";

  return (
    <nav className="admin-nav-card" aria-label="Admin">
      <div className="admin-nav">
        {links
          .filter((l) => isAdmin || !l.adminOnly)
          .map((l) => {
          const href = l.external ? "/" : l.exact ? cmsBase : cmsHref(cmsBase, l.path);
          const active = l.external ? false : isActive(pathname, href, l.exact);
          return (
            <Link
              key={l.label}
              href={href}
              className={`admin-nav__link${active ? " is-active" : ""}${l.external ? " admin-nav__link--muted" : ""}`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
