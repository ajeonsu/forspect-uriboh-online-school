import fs from "fs";
import path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminMediaItem = {
  id: string;
  file_name: string;
  public_url: string;
  file_path: string;
  source: "upload" | "lesson" | "static";
  created_at?: string;
};

function toAbsoluteUrl(origin: string, href: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  const p = href.startsWith("/") ? href : `/${href}`;
  return `${origin.replace(/\/$/, "")}${p}`;
}

function fileNameFromPath(p: string): string {
  const parts = p.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? p;
}

export async function listUploadedMedia(
  supabase: SupabaseClient,
  limit: number,
  uploadedBy?: string,
): Promise<AdminMediaItem[]> {
  let query = supabase
    .from("media_assets")
    .select("id, file_name, file_path, public_url, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (uploadedBy) query = query.eq("uploaded_by", uploadedBy);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    file_name: row.file_name,
    public_url: row.public_url,
    file_path: row.file_path,
    source: "upload" as const,
    created_at: row.created_at,
  }));
}

export async function listLessonThumbnailMedia(
  supabase: SupabaseClient,
  origin: string,
  limit: number,
  createdBy?: string,
): Promise<AdminMediaItem[]> {
  let query = supabase.from("lessons").select("id, thumbnail_url, thumbnail_path").limit(120);
  if (createdBy) query = query.eq("created_by", createdBy);
  const { data, error } = await query;
  if (error) throw error;

  const items: AdminMediaItem[] = [];
  const seen = new Set<string>();

  for (const row of data ?? []) {
    let href: string | null = null;
    if (row.thumbnail_url?.trim()) href = row.thumbnail_url.trim();
    else if (row.thumbnail_path?.trim()) {
      href = row.thumbnail_path.startsWith("/") ? row.thumbnail_path : `/${row.thumbnail_path}`;
    }
    if (!href) continue;

    const public_url = toAbsoluteUrl(origin, href);
    if (seen.has(public_url)) continue;
    seen.add(public_url);

    items.push({
      id: `lesson-thumb:${row.id}`,
      file_name: fileNameFromPath(href),
      public_url,
      file_path: href,
      source: "lesson",
    });
    if (items.length >= limit) break;
  }

  return items;
}

let publicThumbsCache: { key: string; at: number; items: AdminMediaItem[] } | null = null;
const PUBLIC_THUMBS_TTL_MS = 5 * 60 * 1000;

export function listPublicThumbsMedia(origin: string, rootDir: string, limit: number): AdminMediaItem[] {
  const cacheKey = `${origin}:${limit}`;
  const now = Date.now();
  if (publicThumbsCache && publicThumbsCache.key === cacheKey && now - publicThumbsCache.at < PUBLIC_THUMBS_TTL_MS) {
    return publicThumbsCache.items;
  }

  const thumbsDir = path.join(rootDir, "public", "thumbs");
  if (!fs.existsSync(thumbsDir)) return [];

  const files = fs
    .readdirSync(thumbsDir)
    .filter((f) => /\.(png|jpe?g|webp|gif|svg)$/i.test(f))
    .sort();

  const items: AdminMediaItem[] = [];
  for (const file of files) {
    const href = `/thumbs/${file}`;
    items.push({
      id: `static:${file}`,
      file_name: file,
      public_url: toAbsoluteUrl(origin, href),
      file_path: href,
      source: "static",
    });
    if (items.length >= limit) break;
  }
  publicThumbsCache = { key: cacheKey, at: now, items };
  return items;
}

export function mergeMediaLists(lists: AdminMediaItem[][], max: number): AdminMediaItem[] {
  const out: AdminMediaItem[] = [];
  const seen = new Set<string>();
  for (const list of lists) {
    for (const item of list) {
      if (seen.has(item.public_url)) continue;
      seen.add(item.public_url);
      out.push(item);
      if (out.length >= max) return out;
    }
  }
  return out;
}
