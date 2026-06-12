"use client";

import { useAppToast } from "@/components/AppToast";
import { useConfirm } from "@/components/AppConfirm";
import { withAdminConfirm } from "@/lib/confirm-action";
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
  const { push: toast } = useAppToast();
  const [msg, setMsg] = useState("");

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !(await confirm(
        withAdminConfirm(`Upload "${file.name}"?`, { title: "Upload image" }),
      ))
    ) {
      e.target.value = "";
      return;
    }
    setMsg("Uploading…");
    const form = new FormData();
    form.append("file", file);
    form.append("bucket", bucket);
    const res = await fetch("/api/admin/media/upload", { method: "POST", body: form });
    const j = (await res.json()) as { path?: string; url?: string; error?: string };
    if (!res.ok) {
      const err = j.error ?? "Upload failed";
      setMsg(err);
      toast(err, "error");
      return;
    }
    if (j.path && j.url) onUploaded(j.path, j.url);
    setMsg("Uploaded");
    toast("Image uploaded");
  }

  return (
    <div>
      <label>{label}</label>
      <input type="file" accept="image/*" onChange={(e) => void onChange(e)} />
      {msg && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{msg}</p>}
    </div>
  );
}
