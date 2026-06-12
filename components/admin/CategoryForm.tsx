"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CategoryRow = {
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

export function CategoryForm({ initial }: { initial?: CategoryRow }) {
  const router = useRouter();
  const [form, setForm] = useState<CategoryRow>(
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parent = form.parent_id?.trim();
    const payload = {
      ...form,
      id: form.id.trim(),
      parent_id: parent ? parent : null,
      label: form.label.trim(),
      title: form.title.trim(),
    };
    const method = initial ? "PUT" : "POST";
    const url = initial ? `/api/admin/categories/${initial.id}` : "/api/admin/categories";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? "Save failed");
      return;
    }
    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 560, marginTop: 16 }}>
      {!initial && (
        <input
          placeholder="id"
          required
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
        />
      )}
      <input placeholder="label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
      <input placeholder="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <input
        placeholder="parent_id"
        value={form.parent_id ?? ""}
        onChange={(e) => setForm({ ...form, parent_id: e.target.value || null })}
      />
      <input
        placeholder="sort_order"
        type="number"
        value={form.sort_order ?? 0}
        onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
      />
      <label>
        <input
          type="checkbox"
          checked={form.is_active ?? true}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
        />{" "}
        Active
      </label>
      {error && <p style={{ color: "#E11D48" }}>{error}</p>}
      <button type="submit" className="btn btn--primary">
        Save
      </button>
    </form>
  );
}
