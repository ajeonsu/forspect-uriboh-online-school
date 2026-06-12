"use client";

import { useCallback, useEffect, useState } from "react";
import { MediaUploadForm } from "@/components/admin/MediaUploadForm";
import { useAdminToast } from "@/components/admin/cms/AdminToast";

type Asset = {
  id: string;
  file_name: string;
  public_url: string;
  file_path: string;
  mime_type: string | null;
  created_at: string;
};

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
    if (!window.confirm("Delete this file from storage?")) return;
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
        <p className="admin-form-alert">{loadError}</p>
      ) : assets.length === 0 ? (
        <p className="admin-empty">
          No images in the library. Upload above, or run migration <code>005_cms_editorial.sql</code> if
          uploads fail.
        </p>
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
