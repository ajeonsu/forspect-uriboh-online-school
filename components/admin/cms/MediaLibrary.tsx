"use client";

import { useCallback, useEffect, useState } from "react";
import { MediaUploadForm } from "@/components/admin/MediaUploadForm";
import { useAdminToast } from "@/components/admin/cms/AdminToast";
import { useConfirm } from "@/components/AppConfirm";
import { withAdminConfirm } from "@/lib/confirm-action";

type Asset = {
  id: string;
  file_name: string;
  public_url: string;
  file_path: string;
  mime_type: string | null;
  created_at: string;
};

function friendlyMediaLoadError(raw: string): string {
  if (/SUPABASE_SERVICE_ROLE_KEY|service role/i.test(raw)) {
    return "The media library is not available right now. Please try again later or contact the site administrator.";
  }
  if (/media_assets|does not exist|schema cache/i.test(raw)) {
    return "The media library could not be loaded. Please contact the site administrator.";
  }
  return raw.length > 120 ? "Could not load the media library. Please refresh and try again." : raw;
}

export function MediaLibrary() {
  const { push: toast } = useAdminToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const res = await fetch("/api/admin/media?limit=80");
    const j = (await res.json()) as { assets?: Asset[]; error?: string };
    if (!res.ok) {
      setLoadError(j.error ?? "Could not load library");
      setAssets([]);
    } else {
      setAssets((j.assets ?? []) as Asset[]);
    }
    setLoading(false);
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(id: string) {
    if (!id.match(/^[0-9a-f-]{36}$/i)) {
      toast("Only uploaded files can be deleted here", "error");
      return;
    }
    if (
      !(await confirm(
        withAdminConfirm("Delete this file from storage?", {
          title: "Delete file",
          tone: "danger",
          confirmLabel: "Delete",
        }),
      ))
    ) {
      return;
    }
    const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast("Delete failed", "error");
      return;
    }
    toast("Deleted");
    void load();
  }

  return (
    <>
      <h2 className="admin-section-title" style={{ marginTop: 0 }}>
        Upload
      </h2>
      <MediaUploadForm />
      <h2 className="admin-section-title" style={{ marginTop: 28 }}>
        Library
      </h2>
      {loading && !hasLoaded ? (
        <p className="admin-empty">Loading…</p>
      ) : loadError ? (
        <p className="admin-form-alert" role="alert">
          {friendlyMediaLoadError(loadError)}
        </p>
      ) : assets.length === 0 ? (
        <div className="admin-empty" style={{ display: "grid", gap: 8 }}>
          <p style={{ margin: 0 }}>No images in your library yet.</p>
          <p className="admin-table__muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
            Choose a file above and click Upload. Images you add here can be used for lesson thumbnails,
            seminar covers, and the content editor.
          </p>
        </div>
      ) : (
        <div className="admin-media-grid">
          {assets.map((a) => (
            <div key={a.id} className="admin-media-card">
              <img src={a.public_url} alt={a.file_name} />
              <div className="admin-media-card__meta">
                <div>{a.file_name}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn--sm"
                    onClick={() => {
                      void navigator.clipboard.writeText(a.public_url);
                      toast("URL copied");
                    }}
                  >
                    Copy URL
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--sm admin-btn--danger"
                    onClick={() => void remove(a.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
