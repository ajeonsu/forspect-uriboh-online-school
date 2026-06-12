"use client";

import { useState } from "react";

export function MediaUploadForm() {
  const [url, setUrl] = useState("");
  const [path, setPath] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/media/upload", { method: "POST", body: form });
    const json = (await res.json()) as { url?: string; path?: string; error?: string };
    if (!res.ok) {
      setError(json.error ?? "Upload failed");
      return;
    }
    setUrl(json.url ?? "");
    setPath(json.path ?? "");
  }

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 10, maxWidth: 480 }}>
      <select name="bucket" defaultValue="lesson-thumbnails">
        <option value="lesson-thumbnails">lesson-thumbnails</option>
        <option value="seminar-assets">seminar-assets</option>
      </select>
      <input type="file" name="file" accept="image/*" required />
      <button type="submit" className="btn btn--primary">
        Upload
      </button>
      {url && (
        <div style={{ fontSize: 13 }}>
          <div>URL: {url}</div>
          <div>Path: {path}</div>
        </div>
      )}
      {error && <p style={{ color: "#E11D48" }}>{error}</p>}
    </form>
  );
}
