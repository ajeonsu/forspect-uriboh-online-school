"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { VisualContentEditor } from "@/components/admin/VisualContentEditor";

export type SeminarRow = {
  id: string;
  title: string;
  description?: string | null;
  host_name?: string | null;
  category_tags?: string[] | null;
  start_at?: string | null;
  end_at?: string | null;
  location?: string | null;
  apply_url?: string | null;
  thumbnail_path?: string | null;
  thumbnail_url?: string | null;
  video_url?: string | null;
  status?: string;
  moderation_status?: string;
};

export function SeminarModerationForm({
  initial,
  isAdmin = true,
}: {
  initial: SeminarRow;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");

  async function save(patch: Record<string, unknown>) {
    setError("");
    const res = await fetch(`/api/admin/seminars/${initial.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? "Save failed");
      return false;
    }
    router.refresh();
    return true;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tags = (form.category_tags ?? []).map((t) => String(t).trim()).filter(Boolean);
    await save({
      title: form.title,
      description: form.description,
      host_name: form.host_name,
      category_tags: tags,
      start_at: form.start_at || null,
      end_at: form.end_at || null,
      location: form.location,
      apply_url: form.apply_url || null,
      thumbnail_path: form.thumbnail_path,
      thumbnail_url: form.thumbnail_url || null,
      video_url: form.video_url || null,
      status: form.status,
      moderation_status: form.moderation_status,
    });
  }

  async function moderate(status: "approved" | "rejected") {
    if (!window.confirm(`${status === "approved" ? "Approve" : "Reject"} this seminar?`)) return;
    const ok = await save({ moderation_status: status });
    if (ok) setForm({ ...form, moderation_status: status });
  }

  return (
    <form onSubmit={onSubmit} className="admin-form">
      <p>
        Moderation: <strong>{form.moderation_status ?? "approved"}</strong>
        {isAdmin && form.moderation_status === "pending" && (
          <>
            {" "}
            <button type="button" className="btn btn--primary" onClick={() => void moderate("approved")}>
              Approve
            </button>{" "}
            <button type="button" className="btn" onClick={() => void moderate("rejected")}>
              Reject
            </button>
          </>
        )}
      </p>
      <div>
        <label>Title</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <VisualContentEditor
        editorKey={initial.id}
        label="Description"
        initialHtml={
          initial.description?.includes("<")
            ? initial.description
            : `<p>${initial.description ?? ""}</p>`
        }
        onChange={(c) => setForm({ ...form, description: c.content_html })}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label>Host</label>
          <input
            value={form.host_name ?? ""}
            onChange={(e) => setForm({ ...form, host_name: e.target.value })}
          />
        </div>
        <div>
          <label>Location</label>
          <input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
      </div>
      <div>
        <label>Category tags (comma-separated)</label>
        <input
          value={(form.category_tags ?? []).join(", ")}
          onChange={(e) =>
            setForm({
              ...form,
              category_tags: e.target.value.split(",").map((s) => s.trim()),
            })
          }
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label>start_at (ISO)</label>
          <input value={form.start_at ?? ""} onChange={(e) => setForm({ ...form, start_at: e.target.value })} />
        </div>
        <div>
          <label>end_at (ISO)</label>
          <input value={form.end_at ?? ""} onChange={(e) => setForm({ ...form, end_at: e.target.value })} />
        </div>
      </div>
      <div>
        <label>apply_url</label>
        <input value={form.apply_url ?? ""} onChange={(e) => setForm({ ...form, apply_url: e.target.value })} />
      </div>
      <MediaUploadField
        label="Thumbnail"
        bucket="seminar-assets"
        onUploaded={(path, url) => setForm({ ...form, thumbnail_path: path, thumbnail_url: url })}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label>status</label>
          <select value={form.status ?? "draft"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </div>
        <div>
          <label>moderation_status</label>
          <select
            value={form.moderation_status ?? "approved"}
            onChange={(e) => setForm({ ...form, moderation_status: e.target.value })}
          >
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </select>
        </div>
      </div>
      {error && <p style={{ color: "#E11D48" }}>{error}</p>}
      <button type="submit" className="btn btn--primary">
        Save seminar
      </button>
    </form>
  );
}
