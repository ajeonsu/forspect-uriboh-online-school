import path from "path";
import { jsonError, jsonOk, requireApiEditor } from "@/lib/api";
import { editorScope } from "@/lib/cms/editor-scope";
import {
  listLessonThumbnailMedia,
  listPublicThumbsMedia,
  listUploadedMedia,
  mergeMediaLists,
} from "@/lib/admin/media-list";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const scope = editorScope(profile!);
  const ownerFilter = scope.isAdmin ? undefined : scope.userId;

  const url = new URL(request.url);
  const limit = Math.min(120, Number(url.searchParams.get("limit") ?? "60"));
  const origin = url.origin;

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return jsonError(
      "Media library requires SUPABASE_SERVICE_ROLE_KEY in .env.local. Restart the dev server after adding it.",
      503,
    );
  }

  try {
    const rootDir = path.join(process.cwd());
    const [uploaded, lessonThumbs, staticThumbs] = await Promise.all([
      listUploadedMedia(supabase, limit, ownerFilter).catch((e: Error) => {
        if (e.message.includes("media_assets") || e.message.includes("does not exist")) {
          return [] as Awaited<ReturnType<typeof listUploadedMedia>>;
        }
        throw e;
      }),
      listLessonThumbnailMedia(supabase, origin, limit, ownerFilter),
      Promise.resolve(scope.isAdmin ? listPublicThumbsMedia(origin, rootDir, limit) : []),
    ]);

    const assets = mergeMediaLists([uploaded, lessonThumbs, staticThumbs], limit);

    const res = jsonOk({
      assets,
      counts: {
        uploads: uploaded.length,
        lesson_thumbnails: lessonThumbs.length,
        static_thumbs: staticThumbs.length,
        total: assets.length,
      },
    });
    res.headers.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60");
    return res;
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed to load media", 500);
  }
}
