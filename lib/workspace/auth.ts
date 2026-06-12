import { redirect } from "next/navigation";
import { getSessionProfile, requireEditor } from "@/lib/auth";
import type { Profile } from "@/lib/types";
import { cmsBasePath, workspaceSlugFromProfile } from "@/lib/workspace/slug";

/** Ensures the signed-in user may access `/{workspaceSlug}/…` (contributors only). */
export async function requireWorkspaceAccess(workspaceSlug: string): Promise<Profile> {
  const profile = await requireEditor();
  const expected = workspaceSlugFromProfile(profile);
  if (profile.role === "admin") {
    redirect("/admin");
  }
  if (workspaceSlug !== expected) {
    redirect(cmsBasePath(profile));
  }
  return profile;
}

/** Admin CMS under `/admin` — contributors are sent to their workspace. */
export async function requireAdminCms(): Promise<Profile> {
  const profile = await requireEditor();
  if (profile.role !== "admin") {
    redirect(cmsBasePath(profile));
  }
  return profile;
}

export async function getManagementHref(): Promise<string | null> {
  const profile = await getSessionProfile();
  if (!profile) return null;
  return cmsBasePath(profile);
}
