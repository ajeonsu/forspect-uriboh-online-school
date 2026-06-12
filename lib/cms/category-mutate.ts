import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";
import type { categorySchema } from "@/lib/validation";

type CategoryInput = z.infer<typeof categorySchema>;

function nullIfBlank(val: unknown): string | null | undefined {
  if (val === undefined) return undefined;
  if (val === null) return null;
  if (typeof val === "string" && val.trim() === "") return null;
  return typeof val === "string" ? val.trim() : (val as string);
}

export function prepareCategoryRow(
  body: Partial<CategoryInput>,
  opts?: { categoryId?: string },
): Record<string, unknown> {
  const row: Record<string, unknown> = { ...body };

  if ("id" in row && typeof row.id === "string") {
    row.id = row.id.trim();
  }

  if ("parent_id" in row) {
    row.parent_id = nullIfBlank(row.parent_id) ?? null;
  }

  for (const key of ["label", "title", "subtitle", "description", "emoji", "cover_class"] as const) {
    if (key in row && typeof row[key] === "string") {
      const trimmed = (row[key] as string).trim();
      row[key] = trimmed === "" && key !== "label" && key !== "title" ? null : trimmed;
    }
  }

  const parentId = row.parent_id as string | null | undefined;
  const categoryId = opts?.categoryId ?? (typeof row.id === "string" ? row.id : undefined);
  if (parentId && categoryId && parentId === categoryId) {
    throw new Error("A category cannot be its own parent.");
  }

  return row;
}

export async function validateCategoryParent(
  supabase: SupabaseClient,
  parentId: string | null | undefined,
  categoryId?: string,
) {
  const normalized = parentId == null || parentId === "" ? null : parentId.trim();
  if (!normalized) return null;
  if (categoryId && normalized === categoryId) {
    throw new Error("A category cannot be its own parent.");
  }
  const { data, error } = await supabase.from("categories").select("id").eq("id", normalized).maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new Error(`Parent category "${normalized}" does not exist. Choose a valid parent or leave empty.`);
  }
  return normalized;
}

export async function validateCategoryIdAvailable(supabase: SupabaseClient, id: string) {
  const { data } = await supabase.from("categories").select("id").eq("id", id).maybeSingle();
  if (data) throw new Error(`Category id "${id}" is already in use.`);
}

export async function validateLessonCategory(
  supabase: SupabaseClient,
  categoryId: string,
) {
  const { data, error } = await supabase.from("categories").select("id").eq("id", categoryId).maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new Error(`Category "${categoryId}" does not exist.`);
  }
}

export async function validateCategoryIds(
  supabase: SupabaseClient,
  ids: string[],
) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return;
  const { data, error } = await supabase.from("categories").select("id").in("id", unique);
  if (error) throw error;
  const found = new Set((data ?? []).map((r) => r.id));
  const missing = unique.filter((id) => !found.has(id));
  if (missing.length > 0) {
    throw new Error(`Unknown categor${missing.length === 1 ? "y" : "ies"}: ${missing.join(", ")}`);
  }
}

export function friendlyDbMessage(message: string): string {
  if (message.includes("categories_parent_id_fkey")) {
    return "Invalid parent category. Choose an existing parent or leave parent empty.";
  }
  if (message.includes("lessons_category_id_fkey")) {
    return "Invalid lesson category. Choose an existing category.";
  }
  if (message.includes("lesson_cross_links_target_category_id_fkey")) {
    return "One or more cross-listed categories do not exist.";
  }
  if (message.includes("row-level security") || message.includes("RLS")) {
    return "Permission denied. Confirm you are logged in as an admin and SUPABASE_SERVICE_ROLE_KEY is set for admin APIs.";
  }
  if (message.includes("duplicate key") || message.includes("categories_pkey")) {
    return "This category ID already exists. Choose a different ID.";
  }
  return message;
}
