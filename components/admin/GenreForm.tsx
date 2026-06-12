"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useAdminToast } from "@/components/admin/cms/AdminToast";
import { VisualContentEditor } from "@/components/admin/VisualContentEditor";

const CATEGORY_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type GenreRow = {
  id: string;
  parent_id?: string | null;
  label: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  emoji?: string | null;
  cover_class?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

type ParentOption = { id: string; label: string };

function buildCategoryPayload(form: GenreRow): Record<string, unknown> {
  const parent = form.parent_id?.trim();
  return {
    id: form.id.trim(),
    parent_id: parent ? parent : null,
    label: form.label.trim(),
    title: form.title.trim(),
    subtitle: form.subtitle?.trim() || null,
    description: form.description?.trim() || null,
    emoji: form.emoji?.trim() || null,
    cover_class: form.cover_class?.trim() || null,
    sort_order: form.sort_order ?? 0,
    is_active: form.is_active ?? true,
  };
}

export function GenreForm({
  initial,
  parentOptions,
}: {
  initial?: GenreRow;
  parentOptions: ParentOption[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<GenreRow>(
    initial ?? {
      id: "",
      label: "",
      title: "",
      parent_id: null,
      subtitle: "",
      description: "",
      emoji: "",
      cover_class: "",
      sort_order: 0,
      is_active: true,
    },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { push: toast } = useAdminToast();
  const alertRef = useRef<HTMLDivElement>(null);

  const parentChoices = useMemo(
    () => parentOptions.filter((p) => p.id !== initial?.id),
    [initial?.id, parentOptions],
  );

  function validateClient(): string | null {
    if (!initial) {
      const id = form.id.trim();
      if (!id) return "Category ID is required — scroll up and fill in “ID (slug)”.";
      if (!CATEGORY_ID_RE.test(id)) {
        return "Category ID must use lowercase letters, numbers, and hyphens only (e.g. ai-chatgpt).";
      }
    }
    if (!form.label.trim()) return "Label is required — scroll up and fill in “Label”.";
    if (!form.title.trim()) return "Title is required — scroll up and fill in “Title”.";
    return null;
  }

  function showError(message: string) {
    setError(message);
    toast(message, "error");
    requestAnimationFrame(() => {
      alertRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const clientErr = validateClient();
    if (clientErr) {
      showError(clientErr);
      return;
    }

    const payload = buildCategoryPayload(form);
    const method = initial ? "PUT" : "POST";
    const url = initial ? `/api/admin/categories/${initial.id}` : "/api/admin/categories";

    setSaving(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        showError(j.error ?? "Save failed");
        return;
      }
      toast(initial ? "Category saved" : "Category created");
      router.push("/admin/categories");
      router.refresh();
    } catch {
      showError("Network error — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="admin-form admin-form--wide" noValidate>
      {error ? (
        <div ref={alertRef} className="admin-form-alert" role="alert">
          {error}
        </div>
      ) : (
        <div ref={alertRef} />
      )}
      {!initial && (
        <div>
          <label>ID (slug) *</label>
          <input
            required
            placeholder="e.g. ai-chatgpt"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
          />
          <p className="field-hint">Lowercase letters, numbers, and hyphens only.</p>
        </div>
      )}
      <div>
        <label>Label *</label>
        <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
      </div>
      <div>
        <label>Title *</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <label>Parent category</label>
        <select
          value={form.parent_id ?? ""}
          onChange={(e) => setForm({ ...form, parent_id: e.target.value || null })}
        >
          <option value="">None (top-level category)</option>
          {parentChoices.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} ({p.id})
            </option>
          ))}
        </select>
        <p className="field-hint">Leave empty for a top-level category on the public site.</p>
      </div>
      <div>
        <label>Subtitle</label>
        <input value={form.subtitle ?? ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
      </div>
      <VisualContentEditor
        editorKey={initial?.id ?? "new-genre"}
        label="Description"
        initialHtml={
          initial?.description?.includes("<")
            ? initial.description
            : `<p>${initial?.description ?? ""}</p>`
        }
        onChange={(c) => setForm({ ...form, description: c.content_html })}
      />
      <div className="admin-form__row-2">
        <div>
          <label>Emoji</label>
          <input value={form.emoji ?? ""} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
        </div>
        <div>
          <label>Cover class</label>
          <input
            value={form.cover_class ?? ""}
            onChange={(e) => setForm({ ...form, cover_class: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label>Sort order</label>
        <input
          type="number"
          value={form.sort_order ?? 0}
          onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
        />
      </div>
      <label>
        <input
          type="checkbox"
          checked={form.is_active ?? true}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
        />{" "}
        Active (visible on site)
      </label>
      <button type="submit" className="btn btn--primary" disabled={saving}>
        {saving ? "Saving…" : "Save category"}
      </button>
    </form>
  );
}
