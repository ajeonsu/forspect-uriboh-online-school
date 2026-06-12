import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireApiUser() {
  const profile = await getSessionProfile();
  if (!profile) {
    return { error: jsonError("Unauthorized", 401) as NextResponse, profile: null };
  }
  return { error: null, profile };
}

/** Any signed-in user (contributor or admin). */
export async function requireApiEditor() {
  const profile = await getSessionProfile();
  if (!profile) {
    return { error: jsonError("Unauthorized", 401) as NextResponse, profile: null };
  }
  return { error: null, profile };
}

export async function requireApiAdmin() {
  const { error, profile } = await requireApiEditor();
  if (error) return { error, profile: null };
  if (profile!.role !== "admin") {
    return { error: jsonError("Forbidden", 403) as NextResponse, profile: null };
  }
  return { error: null, profile };
}
