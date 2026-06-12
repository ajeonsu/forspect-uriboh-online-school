"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Row = {
  id: string;
  category_id: string;
  lesson_no: string;
  title: string;
  status: string;
};

export function AdminLessonList({
  lessons,
  genreOptions,
}: {
  lessons: Row[];
  genreOptions: { id: string; label: string }[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const genre = sp.get("genre") ?? "";
  const status = sp.get("status") ?? "";
  const q = (sp.get("q") ?? "").toLowerCase();

  const filtered = lessons.filter((l) => {
    if (genre && l.category_id !== genre) return false;
    if (status && l.status !== status) return false;
    if (q && !l.title.toLowerCase().includes(q) && !l.lesson_no.includes(q)) return false;
    return true;
  });

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/admin/lessons?${next.toString()}`);
  }

  return (
    <>
      <div className="admin-filters">
        <select value={genre} onChange={(e) => setParam("genre", e.target.value)}>
          <option value="">All genres</option>
          {genreOptions.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setParam("status", e.target.value)}>
          <option value="">All statuses</option>
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="archived">archived</option>
        </select>
        <input
          placeholder="Search title / no"
          defaultValue={sp.get("q") ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") setParam("q", (e.target as HTMLInputElement).value);
          }}
        />
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Genre</th>
            <th>No</th>
            <th>Title</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {filtered.map((l) => (
            <tr key={l.id}>
              <td>{l.category_id}</td>
              <td>{l.lesson_no}</td>
              <td>{l.title}</td>
              <td>{l.status}</td>
              <td>
                <span className="admin-table__actions">
                  <Link href={`/admin/lessons/${l.id}/edit`}>Edit</Link>
                  <Link href={`/admin/lessons/${l.id}/preview`} target="_blank">
                    Preview
                  </Link>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
        Showing {filtered.length} of {lessons.length}
      </p>
    </>
  );
}
