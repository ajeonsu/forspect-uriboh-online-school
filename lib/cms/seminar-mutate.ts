import type { z } from "zod";
import type { seminarSchema } from "@/lib/validation";

type SeminarInput = z.infer<typeof seminarSchema>;

function nullIfBlank(val: unknown): string | null | undefined {
  if (val === undefined) return undefined;
  if (val === null) return null;
  if (typeof val === "string" && val.trim() === "") return null;
  return typeof val === "string" ? val.trim() : (val as string);
}

/** Normalize optional URLs and ISO datetimes before Supabase insert/update. */
export function prepareSeminarPatch(body: Partial<SeminarInput>): Record<string, unknown> {
  const patch: Record<string, unknown> = { ...body };

  for (const key of ["apply_url", "thumbnail_url", "video_url", "thumbnail_path"] as const) {
    if (key in patch) {
      patch[key] = nullIfBlank(patch[key]) ?? null;
    }
  }

  for (const key of ["start_at", "end_at"] as const) {
    if (key in patch) {
      const v = nullIfBlank(patch[key]);
      patch[key] = v ?? null;
    }
  }

  for (const key of ["description", "host_name", "location"] as const) {
    if (key in patch && typeof patch[key] === "string" && (patch[key] as string).trim() === "") {
      patch[key] = null;
    }
  }

  if (Array.isArray(patch.category_tags)) {
    patch.category_tags = (patch.category_tags as string[]).map((t) => t.trim()).filter(Boolean);
  }

  return patch;
}
