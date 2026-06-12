import { jsonError, jsonOk, requireApiEditor } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;

  const form = await request.formData();
  const file = form.get("file");
  const bucket = (form.get("bucket") as string) || "lesson-thumbnails";
  if (!(file instanceof File)) return jsonError("file is required", 400);
  if (file.size > MAX_BYTES) return jsonError("File must be 5MB or smaller", 400);
  if (!file.type.startsWith("image/")) return jsonError("Only image uploads are allowed", 400);
  if (bucket !== "lesson-thumbnails" && bucket !== "seminar-assets") {
    return jsonError("Invalid bucket", 400);
  }

  const supabase = createAdminClient();
  const path = `${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (uploadError) return jsonError(uploadError.message, 500);

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path);
  const file_path = `${bucket}/${path}`;
  const { data: asset, error: assetErr } = await supabase
    .from("media_assets")
    .insert({
      file_name: file.name,
      file_path,
      public_url: publicUrl.publicUrl,
      mime_type: file.type,
      size: file.size,
      uploaded_by: profile?.id ?? null,
    })
    .select()
    .single();
  if (assetErr) return jsonError(assetErr.message, 500);

  return jsonOk({
    path: file_path,
    url: publicUrl.publicUrl,
    thumbnail_path: `thumbs/${file.name}`,
    asset,
  });
}
