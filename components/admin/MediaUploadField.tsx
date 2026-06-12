"use client";

import { useState } from "react";

export function MediaUploadField({
  label,
  bucket,
  onUploaded,
}: {
  label: string;
  bucket: "lesson-thumbnails" | "seminar-assets";
  onUploaded: (path: string, url: string) => void;
}) {
  const [msg, setMsg] = useState("");

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg("Uploading…");
    const form = new FormData();
    form.append("file", file);
    form.append("bucket", bucket);
    const res = await fetch("/api/admin/media/upload", { method: "POST", body: form });
    const j = (await res.json()) as { path?: string; url?: string; error?: string };
    if (!res.ok) {
      setMsg(j.error ?? "Upload failed");
      return;
    }
    if (j.path && j.url) onUploaded(j.path, j.url);
    setMsg("Uploaded");
  }

  return (
    <div>
      <label>{label}</label>
      <input type="file" accept="image/*" onChange={(e) => void onChange(e)} />
      {msg && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{msg}</p>}
    </div>
  );
}
