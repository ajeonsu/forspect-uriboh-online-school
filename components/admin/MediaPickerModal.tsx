"use client";

import { CmsLink } from "@/components/admin/CmsLink";
import { useCallback, useEffect, useState } from "react";

type Asset = { id: string; file_name: string; public_url: string; source?: string };

export function MediaPickerModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (url: string) => void;
}) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/media?limit=80");
      const j = (await res.json()) as { assets?: Asset[]; error?: string; counts?: Record<string, number> };
      if (!res.ok) {
        setAssets([]);
        setError(j.error ?? "Could not load media library");
        return;
      }
      setAssets(j.assets ?? []);
      if ((j.assets ?? []).length === 0) {
        setError("");
      }
    } catch {
      setAssets([]);
      setError("Network error loading media");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  if (!open) return null;

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h2>Insert from media library</h2>
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
        {loading ? (
          <p className="admin-empty">Loading…</p>
        ) : error ? (
          <p className="admin-form-alert">{error}</p>
        ) : assets.length === 0 ? (
          <div className="admin-empty" style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0 }}>No images in your library yet.</p>
            <p className="admin-table__muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
              Upload images on the{" "}
              <CmsLink path="/media" onClick={onClose}>
                Media
              </CmsLink>{" "}
              page, then return here to insert one.
            </p>
          </div>
        ) : (
          <div className="admin-media-grid">
            {assets.map((a) => (
              <button
                key={a.id}
                type="button"
                className="admin-media-card"
                onClick={() => {
                  onPick(a.public_url);
                  onClose();
                }}
              >
                <img src={a.public_url} alt={a.file_name} loading="lazy" />
                <div className="admin-media-card__meta">
                  {a.file_name}
                  {a.source && a.source !== "upload" ? (
                    <span className="admin-media-card__tag">{a.source}</span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
