import { z } from "zod";

const emptyStringToNull = (val: unknown) =>
  typeof val === "string" && val.trim() === "" ? null : val;

const categoryIdSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ID must be lowercase letters, numbers, and hyphens");

const optionalParentIdSchema = z.preprocess(
  emptyStringToNull,
  z.union([z.null(), categoryIdSchema]).optional(),
);

export const categorySchema = z.object({
  id: categoryIdSchema,
  parent_id: optionalParentIdSchema,
  label: z.string().trim().min(1, "Label is required"),
  title: z.string().trim().min(1, "Title is required"),
  subtitle: z.preprocess(emptyStringToNull, z.string().optional().nullable()),
  description: z.preprocess(emptyStringToNull, z.string().optional().nullable()),
  emoji: z.preprocess(emptyStringToNull, z.string().optional().nullable()),
  cover_class: z.preprocess(emptyStringToNull, z.string().optional().nullable()),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

const slugSchema = z.preprocess(
  emptyStringToNull,
  z
    .union([
      z.null(),
      z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens"),
    ])
    .optional(),
);

const publishedAtSchema = z.preprocess(
  emptyStringToNull,
  z.union([z.null(), z.string().datetime({ message: "Invalid publish date" })]).optional(),
);

export const lessonSchema = z.object({
  category_id: z.string().min(1),
  lesson_no: z.string().min(1),
  slug: slugSchema,
  title: z.string().min(1),
  excerpt: z.string().optional().nullable(),
  seo_title: z.string().max(120).optional().nullable(),
  seo_description: z.string().max(320).optional().nullable(),
  content_json: z.array(z.unknown()).optional().nullable(),
  content_html: z.string().optional(),
  content_plain: z.string().optional(),
  thumbnail_path: z.string().optional().nullable(),
  thumbnail_url: z.string().url().optional().nullable().or(z.literal("")),
  thumb_intro: z.string().optional().nullable(),
  thumb_accent: z.string().optional().nullable(),
  thumb_subtitle: z.string().optional().nullable(),
  views_count: z.number().int().nonnegative().optional(),
  likes_count: z.number().int().nonnegative().optional(),
  popular_rank: z.number().int().positive().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  published_at: publishedAtSchema,
  cross_category_ids: z.array(z.string()).optional(),
  autosave: z.boolean().optional(),
  create_revision: z.boolean().optional(),
});

export const lessonPublishSchema = z.object({
  confirm_overwrite: z.boolean().optional(),
});

const optionalIsoDatetime = z.preprocess(
  emptyStringToNull,
  z.union([z.null(), z.string().datetime({ message: "Invalid date/time (use ISO format)" })]).optional(),
);

const optionalUrl = z.preprocess(
  emptyStringToNull,
  z.union([z.null(), z.string().url()]).optional(),
);

export const seminarSchema = z.object({
  title: z.string().min(1).transform((s) => s.trim()),
  description: z.preprocess(emptyStringToNull, z.string().optional().nullable()),
  host_name: z.preprocess(emptyStringToNull, z.string().optional().nullable()),
  category_tags: z.array(z.string()).optional().nullable(),
  start_at: optionalIsoDatetime,
  end_at: optionalIsoDatetime,
  location: z.preprocess(emptyStringToNull, z.string().optional().nullable()),
  apply_url: optionalUrl,
  thumbnail_path: z.preprocess(emptyStringToNull, z.string().optional().nullable()),
  thumbnail_url: optionalUrl,
  video_url: optionalUrl,
  status: z.enum(["draft", "published", "archived"]).optional(),
  moderation_status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export const profileRoleSchema = z.object({
  role: z.enum(["admin", "user"]),
});

export function formatZodError(error: z.ZodError): string {
  const first = error.issues[0];
  if (!first) return "Validation failed";
  const path = first.path.length ? `${String(first.path.join("."))}: ` : "";
  return `${path}${first.message}`;
}
