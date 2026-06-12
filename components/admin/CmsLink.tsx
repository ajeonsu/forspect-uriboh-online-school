"use client";

import { useCmsBase } from "@/components/admin/CmsWorkspaceProvider";
import { cmsHref } from "@/lib/workspace/paths";
import Link from "next/link";
import type { ComponentProps } from "react";

export function CmsLink({
  path,
  href: hrefProp,
  ...rest
}: Omit<ComponentProps<typeof Link>, "href"> & { path?: string; href?: string }) {
  const cmsBase = useCmsBase();
  const href = hrefProp ?? cmsHref(cmsBase, path ?? "");
  return <Link href={href} {...rest} />;
}
