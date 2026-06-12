"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links: {
  href: string;
  label: string;
  exact?: boolean;
  external?: boolean;
  adminOnly: boolean;
}[] = [
  { href: "/admin", label: "Dashboard", exact: true, adminOnly: false },
  { href: "/admin/categories", label: "Categories", adminOnly: false },
  { href: "/admin/lessons", label: "Lessons", adminOnly: false },
  { href: "/admin/seminars", label: "Seminars", adminOnly: false },
  { href: "/admin/newsletter", label: "Newsletter", adminOnly: false },
  { href: "/admin/analytics", label: "Analytics", adminOnly: false },
  { href: "/admin/media", label: "Media", adminOnly: false },
  { href: "/admin/users", label: "Users", adminOnly: true },
  { href: "/", label: "← Site", external: true, adminOnly: false },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (href === "/") return false;
  if (exact) return pathname === href || pathname === `${href}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ role }: { role: "admin" | "user" }) {
  const pathname = usePathname();
  const isAdmin = role === "admin";

  return (
    <nav className="admin-nav-card" aria-label="Admin">
      <div className="admin-nav">
        {links
          .filter((l) => isAdmin || !l.adminOnly)
          .map((l) => {
          const active = l.external ? false : isActive(pathname, l.href, l.exact);
          return (
            <Link
              key={l.href}
              href={l.href}
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
