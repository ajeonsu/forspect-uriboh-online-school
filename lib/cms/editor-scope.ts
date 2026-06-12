import type { Profile } from "@/lib/types";

export type EditorScope = {
  isAdmin: boolean;
  userId: string;
};

export function editorScope(profile: Profile): EditorScope {
  return { isAdmin: profile.role === "admin", userId: profile.id };
}

export function assertOwnsRow(
  scope: EditorScope,
  row: { created_by?: string | null; uploaded_by?: string | null },
  label = "resource",
) {
  if (scope.isAdmin) return;
  const owner = row.created_by ?? row.uploaded_by;
  if (owner !== scope.userId) {
    throw new Error(`You can only manage your own ${label}.`);
  }
}

export function assertAdmin(scope: EditorScope, action = "perform this action") {
  if (!scope.isAdmin) {
    throw new Error(`Only administrators can ${action}.`);
  }
}
