"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { VisualContentEditor } from "@/components/admin/VisualContentEditor";

export type LessonRow = {
  id?: string;
  category_id: string;
  lesson_no: string;
  title: string;
  excerpt?: string | null;
  content_html: string;
  thumbnail_path?: string | null;
  thumbnail_url?: string | null;
  thumb_intro?: string | null;
  thumb_accent?: string | null;
  thumb_subtitle?: string | null;
  views_count?: number;
  likes_count?: number;
  popular_rank?: number | null;
  status?: "draft" | "published" | "archived";
  cross_category_ids?: string[];
};

export function LessonForm({
  initial,
  genreOptions,
}: {
  initial?: LessonRow;
  genreOptions: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<LessonRow>(
    initial ?? {
      category_id: genreOptions[0]?.id ?? "ai-chatgpt",
      lesson_no: "01",
      title: "",
      excerpt: "",
      content_html: "<p></p>",
      status: "draft",
      views_count: 0,
      likes_count: 0,
      cross_category_ids: [],
    },
  );
  const [error, setError] = useState("");
  const lessonId = initial?.id;

  const crossCsv = (form.cross_category_ids ?? []).join(", ");

  const payload = useMemo(() => form, [form]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const method = lessonId ? "PUT" : "POST";
    const url = lessonId ? `/api/admin/lessons/${lessonId}` : "/api/admin/lessons";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        cross_category_ids: crossCsv
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? "Save failed");
      return;
    }
    router.push("/admin/lessons");
    router.refresh();
  }

  async function onDelete() {
    if (!lessonId) return;
    if (!window.confirm("Permanently delete this lesson? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Delete failed");
      return;
    }
    router.push("/admin/lessons");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="admin-form admin-form--wide">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div>
          <label>Genre</label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          >
            {genreOptions.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label} ({g.id})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Lesson no</label>
          <input value={form.lesson_no} onChange={(e) => setForm({ ...form, lesson_no: e.target.value })} />
        </div>
        <div>
          <label>Status</label>
          <select
            value={form.status ?? "draft"}
            onChange={(e) => setForm({ ...form, status: e.target.value as LessonRow["status"] })}
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </div>
      </div>

      <div>
        <label>Title</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <label>Summary (excerpt)</label>
        <textarea
          rows={2}
          value={form.excerpt ?? ""}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
        />
      </div>

      <MediaUploadField
        label="Thumbnail upload"
        bucket="lesson-thumbnails"
        onUploaded={(path, url) => setForm({ ...form, thumbnail_path: path, thumbnail_url: url })}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label>thumbnail_path</label>
          <input
            value={form.thumbnail_path ?? ""}
            onChange={(e) => setForm({ ...form, thumbnail_path: e.target.value })}
          />
        </div>
        <div>
          <label>thumbnail_url</label>
          <input
            value={form.thumbnail_url ?? ""}
            onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
          />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div>
          <label>thumb_intro</label>
          <input
            value={form.thumb_intro ?? ""}
            onChange={(e) => setForm({ ...form, thumb_intro: e.target.value })}
          />
        </div>
        <div>
          <label>thumb_accent</label>
          <input
            value={form.thumb_accent ?? ""}
            onChange={(e) => setForm({ ...form, thumb_accent: e.target.value })}
          />
        </div>
        <div>
          <label>thumb_subtitle</label>
          <input
            value={form.thumb_subtitle ?? ""}
            onChange={(e) => setForm({ ...form, thumb_subtitle: e.target.value })}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div>
          <label>views_count</label>
          <input
            type="number"
            value={form.views_count ?? 0}
            onChange={(e) => setForm({ ...form, views_count: Number(e.target.value) })}
          />
        </div>
        <div>
          <label>likes_count</label>
          <input
            type="number"
            value={form.likes_count ?? 0}
            onChange={(e) => setForm({ ...form, likes_count: Number(e.target.value) })}
          />
        </div>
        <div>
          <label>popular_rank</label>
          <input
            type="number"
            value={form.popular_rank ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                popular_rank: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </div>
      </div>

      <div>
        <label>Cross-listed genre IDs (comma-separated)</label>
        <input
          value={crossCsv}
          onChange={(e) =>
            setForm({
              ...form,
              cross_category_ids: e.target.value.split(",").map((s) => s.trim()),
            })
          }
          placeholder="ai-gemini, ai-claude"
        />
      </div>

      {lessonId && (
        <div>
          <Link href={`/admin/lessons/${lessonId}/preview`} className="btn" target="_blank">
            Open full page preview
          </Link>
        </div>
      )}

      <VisualContentEditor
        editorKey={lessonId ?? "new-lesson"}
        label="Lesson body"
        initialHtml={initial?.content_html ?? "<p></p>"}
        onChange={(c) =>
          setForm((f) => ({
            ...f,
            content_html: c.content_html,
          }))
        }
      />

      {error && <p style={{ color: "#E11D48" }}>{error}</p>}
      <div style={{ display: "flex", gap: 12 }}>
        <button type="submit" className="btn btn--primary">
          Save lesson
        </button>
        {lessonId && (
          <button type="button" className="btn" onClick={() => void onDelete()}>
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
