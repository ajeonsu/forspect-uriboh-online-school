import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { getSupabasePublicConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/** Validated auth user only (no profiles row). Shared by header and profile loader. */
export const getSessionUser = cache(async (): Promise<User | null> => {
  if (!getSupabasePublicConfig()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getSessionProfile = cache(async (): Promise<Profile | null> => {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;
  return data as Profile;
});

/** CMS access for admins and contributors. */
export async function requireEditor(): Promise<Profile> {
  const profile = await getSessionProfile();
  if (!profile) {
    redirect("/login?next=/admin");
  }
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireEditor();
  if (profile.role !== "admin") {
    redirect("/admin");
  }
  return profile;
}
