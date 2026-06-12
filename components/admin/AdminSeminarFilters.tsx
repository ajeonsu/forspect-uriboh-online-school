"use client";

import Link from "next/link";

const items = [
  { href: "/admin/seminars", key: "" },
  { href: "/admin/seminars?moderation=pending", key: "pending" },
  { href: "/admin/seminars?moderation=approved", key: "approved" },
  { href: "/admin/seminars?moderation=rejected", key: "rejected" },
] as const;

export function AdminSeminarFilters({ moderation }: { moderation?: string }) {
  const active = moderation ?? "";
  return (
    <div className="admin-filter-chips">
      {items.map((item) => (
        <Link
          key={item.key || "all"}
          href={item.href}
          className={active === item.key ? "is-active" : undefined}
        >
          {item.key === "" ? "All" : item.key.charAt(0).toUpperCase() + item.key.slice(1)}
        </Link>
      ))}
    </div>
  );
}
