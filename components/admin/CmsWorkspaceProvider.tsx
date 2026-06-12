"use client";

import { createContext, useContext, useMemo } from "react";

const Ctx = createContext<{ cmsBase: string } | null>(null);

export function CmsWorkspaceProvider({
  cmsBase,
  children,
}: {
  cmsBase: string;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ cmsBase: cmsBase.replace(/\/$/, "") }), [cmsBase]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCmsBase(): string {
  const ctx = useContext(Ctx);
  if (!ctx) return "/admin";
  return ctx.cmsBase;
}
