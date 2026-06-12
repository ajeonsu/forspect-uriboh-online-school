"use client";

import { useCmsBase } from "@/components/admin/CmsWorkspaceProvider";
import { cmsHref } from "@/lib/workspace/paths";
import Link from "next/link";

const items = [
  { path: "/seminars", key: "" },
  { path: "/seminars?moderation=pending", key: "pending" },
  { path: "/seminars?moderation=approved", key: "approved" },
  { path: "/seminars?moderation=rejected", key: "rejected" },
] as const;

export function AdminSeminarFilters({ moderation }: { moderation?: string }) {
  const cmsBase = useCmsBase();
  const active = moderation ?? "";
  return (
    <div className="admin-filter-chips">
      {items.map((item) => (
        <Link
          key={item.key || "all"}
          href={cmsHref(cmsBase, item.path)}
          className={active === item.key ? "is-active" : undefined}
        >
          {item.key === "" ? "All" : item.key.charAt(0).toUpperCase() + item.key.slice(1)}
        </Link>
      ))}
    </div>
  );
}
