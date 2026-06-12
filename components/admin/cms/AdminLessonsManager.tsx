"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCmsBase } from "@/components/admin/CmsWorkspaceProvider";
import { cmsHref } from "@/lib/workspace/paths";
import { useAdminToast } from "@/components/admin/cms/AdminToast";
import { useConfirm, type ConfirmRequest } from "@/components/AppConfirm";
import { withAdminConfirm } from "@/lib/confirm-action";
import { TableSkeleton } from "@/components/skeletons/Skeletons";
import { AdminCard, AdminPageHeader, AdminTableWrap, StatusBadge } from "@/components/admin/ui/AdminChrome";
import { AdminLessonThumb } from "@/components/admin/AdminLessonThumb";

type LessonRow = {
  id: string;
  category_id: string;
  lesson_no: string;
  title: string;
  status: string;
  thumbnail_url: string | null;
  views_count: number;
  likes_count: number;
  popular_rank: number | null;
  updated_at: string;
};

type Genre = { id: string; label: string };

type InitialList = {
  lessons: LessonRow[];
  total: number;
  page: number;
  limit: number;
};

function isDefaultListQuery(q: string, categoryId: string, status: string, sort: string, page: number) {
  return page === 1 && !q && !categoryId && !status && sort === "newest";
}

export function AdminLessonsManager({
  genres,
  initial,
}: {
  genres: Genre[];
  initial?: InitialList;
}) {
  const { push: toast } = useAdminToast();
  const { confirm } = useConfirm();
  const cmsBase = useCmsBase();
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<LessonRow[]>(initial?.lessons ?? []);
  const [total, setTotal] = useState(initial?.total ?? 0);
  const [loading, setLoading] = useState(!initial);
  const skipFirstClientFetch = useRef(Boolean(initial));
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const id = window.setTimeout(() => {
      setQ(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
      sort,
    });
    if (q.trim()) params.set("q", q.trim());
    if (categoryId) params.set("category_id", categoryId);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/lessons?${params}`, { cache: "no-store" });
    const j = (await res.json()) as {
      lessons?: LessonRow[];
      total?: number;
      error?: string;
    };
    setLoading(false);
    if (!res.ok) {
      toast(j.error ?? "Failed to load lessons", "error");
      return;
    }
    setRows(j.lessons ?? []);
    setTotal(j.total ?? 0);
  }, [categoryId, page, q, sort, status, toast]);

  useEffect(() => {
    if (skipFirstClientFetch.current && isDefaultListQuery(q, categoryId, status, sort, page)) {
      skipFirstClientFetch.current = false;
      setLoading(false);
      return;
    }
    void load();
  }, [load, q, categoryId, status, sort, page]);

  async function quickAction(path: string, msg: string, confirmOpts: ConfirmRequest) {
    if (!(await confirm(confirmOpts))) return;
    const res = await fetch(path, { method: "POST" });
    if (!res.ok) {
      toast("Action failed", "error");
      return;
    }
    toast(msg);
    void load();
  }

  async function bulkArchive() {
    if (
      !(await confirm(
        withAdminConfirm(`Archive ${selected.size} selected lesson(s)?`, {
          title: "Archive lessons",
          confirmLabel: "Archive",
        }),
      ))
    ) {
      return;
    }
    for (const id of selected) {
      await fetch(`/api/admin/lessons/${id}/archive`, { method: "POST" });
    }
    toast(`Archived ${selected.size} lessons`);
    setSelected(new Set());
    void load();
  }

  async function deleteLesson(id: string, title: string) {
    if (
      !(await confirm(
        withAdminConfirm(
          `Permanently delete “${title}”? Prefer Archive to hide content without losing data.`,
          {
            title: "Delete lesson",
            tone: "danger",
            confirmLabel: "Delete",
          },
        ),
      ))
    ) {
      return;
    }
    const res = await fetch(`/api/admin/lessons/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast("Delete failed", "error");
      return;
    }
    toast("Lesson deleted");
    void load();
  }

  const pages = Math.max(1, Math.ceil(total / 20));

  return (
    <>
      <AdminPageHeader
        title="Lessons"
        description="Search, filter, and manage the full lesson catalog and publishing workflow."
        actions={
          <Link href={cmsHref(cmsBase, "/lessons/new")} className="btn btn--primary">
            New lesson
          </Link>
        }
      />

      <AdminCard className="admin-lessons-filters-card" title="Filters">
      <div className="admin-filters" style={{ border: "none", background: "transparent", padding: 0 }}>
        <input
          placeholder="Search title…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setQ(searchInput.trim());
              setPage(1);
            }
          }}
        />
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All categories</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="archived">archived</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="views">Most viewed</option>
          <option value="likes">Most liked</option>
          <option value="popular_rank">Popular rank</option>
        </select>
        <button type="button" className="btn" onClick={() => void load()}>
          Apply
        </button>
        {selected.size > 0 && (
          <button type="button" className="btn" onClick={() => void bulkArchive()}>
            Archive selected ({selected.size})
          </button>
        )}
      </div>
      </AdminCard>

      <AdminCard>
      {loading && rows.length === 0 ? (
        <TableSkeleton rows={10} cols={8} />
      ) : rows.length === 0 ? (
        <p className="admin-empty">No lessons match your filters.</p>
      ) : (
        <AdminTableWrap className={loading ? "admin-table-wrap--busy" : undefined}>
        <table className="admin-table admin-table--lessons">
          <thead>
            <tr>
              <th style={{ width: 36 }} />
              <th>Thumb</th>
              <th>Title</th>
              <th>Category</th>
              <th className="admin-table__num">No</th>
              <th>Status</th>
              <th className="admin-table__num">Views</th>
              <th className="admin-table__num">Likes</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.has(l.id)}
                    onChange={(e) => {
                      const next = new Set(selected);
                      if (e.target.checked) next.add(l.id);
                      else next.delete(l.id);
                      setSelected(next);
                    }}
                  />
                </td>
                <td>
                  <AdminLessonThumb url={l.thumbnail_url} />
                </td>
                <td className="admin-table__title">{l.title}</td>
                <td className="admin-table__muted">{l.category_id}</td>
                <td className="admin-table__num">{l.lesson_no}</td>
                <td>
                  <StatusBadge value={l.status} />
                </td>
                <td className="admin-table__num">{l.views_count.toLocaleString()}</td>
                <td className="admin-table__num">{l.likes_count.toLocaleString()}</td>
                <td className="admin-table__muted">{new Date(l.updated_at).toLocaleDateString()}</td>
                <td>
                  <span className="admin-table__actions">
                    <Link
                      href={`/admin/lessons/${l.id}/edit`}
                      prefetch={false}
                      className="admin-btn admin-btn--sm"
                    >
                      Edit
                    </Link>
                    <Link
                      href={cmsHref(cmsBase, `/lessons/${l.id}/preview`)}
                      prefetch={false}
                      target="_blank"
                      className="admin-btn admin-btn--sm admin-btn--ghost"
                    >
                      Preview
                    </Link>
                    <button
                      type="button"
                      className="admin-btn admin-btn--sm"
                      onClick={() =>
                        void quickAction(
                          `/api/admin/lessons/${l.id}/publish`,
                          "Published",
                          withAdminConfirm(`Publish “${l.title}”?`, {
                            title: "Publish lesson",
                            confirmLabel: "Publish",
                          }),
                        )
                      }
                    >
                      Publish
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--sm admin-btn--ghost"
                      onClick={() =>
                        void quickAction(
                          `/api/admin/lessons/${l.id}/duplicate`,
                          "Duplicated",
                          withAdminConfirm(`Duplicate “${l.title}”?`, { title: "Duplicate lesson" }),
                        )
                      }
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--sm admin-btn--ghost"
                      onClick={() =>
                        void quickAction(
                          `/api/admin/lessons/${l.id}/archive`,
                          "Archived",
                          withAdminConfirm(`Archive “${l.title}”?`, {
                            title: "Archive lesson",
                            confirmLabel: "Archive",
                          }),
                        )
                      }
                    >
                      Archive
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--sm admin-btn--danger"
                      onClick={() => void deleteLesson(l.id, l.title)}
                    >
                      Delete
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </AdminTableWrap>
      )}

      <div className="admin-pagination">
        <button type="button" className="btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span>
          Page {page} / {pages} ({total} total)
        </span>
        <button
          type="button"
          className="btn"
          disabled={page >= pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
      </AdminCard>
    </>
  );
}
