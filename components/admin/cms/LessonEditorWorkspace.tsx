"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArticleBody } from "@/components/ArticleBody";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { VisualContentEditor } from "@/components/admin/VisualContentEditor";
import type { LessonEditorContent } from "@/components/admin/VisualContentEditor.types";
import { useCmsBase } from "@/components/admin/CmsWorkspaceProvider";
import { cmsHref } from "@/lib/workspace/paths";
import { useAdminToast } from "@/components/admin/cms/AdminToast";
import { useConfirm, type ConfirmRequest } from "@/components/AppConfirm";
import { withAdminConfirm } from "@/lib/confirm-action";
import { AdminCard } from "@/components/admin/ui/AdminChrome";
import { buildTocAndHtml, estimateReadingMinutes } from "@/lib/article";
import { LessonToc } from "@/components/LessonToc";

export type LessonEditorInitial = {
  id: string;
  category_id: string;
  lesson_no: string;
  slug?: string | null;
  title: string;
  excerpt?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  content_json?: unknown[] | null;
  content_html: string;
  content_plain?: string | null;
  thumbnail_path?: string | null;
  thumbnail_url?: string | null;
  thumb_intro?: string | null;
  thumb_accent?: string | null;
  thumb_subtitle?: string | null;
  views_count?: number;
  likes_count?: number;
  popular_rank?: number | null;
  status?: "draft" | "published" | "archived";
  published_at?: string | null;
  cross_category_ids?: string[];
};

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

export function LessonEditorWorkspace({
  initial,
  genreOptions,
}: {
  initial?: LessonEditorInitial;
  genreOptions: { id: string; label: string }[];
}) {
  const router = useRouter();
  const { push: toast } = useAdminToast();
  const { confirm } = useConfirm();
  const cmsBase = useCmsBase();
  const lessonId = initial?.id;
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [mediaOpen, setMediaOpen] = useState(false);
  const [revisions, setRevisions] = useState<
    { id: string; title: string; status: string; created_at: string }[]
  >([]);
  const dirtyRef = useRef(false);

  const [form, setForm] = useState({
    category_id: initial?.category_id ?? genreOptions[0]?.id ?? "",
    lesson_no: initial?.lesson_no ?? "01",
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    excerpt: initial?.excerpt ?? "",
    seo_title: initial?.seo_title ?? "",
    seo_description: initial?.seo_description ?? "",
    content_html: initial?.content_html ?? "<p></p>",
    content_json: (initial?.content_json as unknown[] | null) ?? null,
    content_plain: initial?.content_plain ?? "",
    thumbnail_path: initial?.thumbnail_path ?? "",
    thumbnail_url: initial?.thumbnail_url ?? "",
    thumb_intro: initial?.thumb_intro ?? "",
    thumb_accent: initial?.thumb_accent ?? "",
    thumb_subtitle: initial?.thumb_subtitle ?? "",
    views_count: initial?.views_count ?? 0,
    likes_count: initial?.likes_count ?? 0,
    popular_rank: initial?.popular_rank ?? null,
    status: (initial?.status ?? "draft") as "draft" | "published" | "archived",
    published_at: initial?.published_at ?? "",
    cross_category_ids: (initial?.cross_category_ids ?? []).join(", "),
  });

  const crossCsv = form.cross_category_ids;

  const payload = useMemo(
    () => ({
      ...form,
      popular_rank: form.popular_rank,
      published_at: form.published_at || null,
      cross_category_ids: crossCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }),
    [form, crossCsv],
  );

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    setSaveState("dirty");
  }, []);

  const onContentChange = useCallback(
    (c: LessonEditorContent) => {
      setForm((f) => ({
        ...f,
        content_html: c.content_html,
        content_json: c.content_json,
        content_plain: c.content_plain,
      }));
      markDirty();
    },
    [markDirty],
  );

  const saveLesson = useCallback(
    async (opts: { autosave?: boolean; createRevision?: boolean } = {}) => {
      if (!form.title.trim()) {
        setFieldErrors({ title: "Title is required" });
        return null;
      }
      setSaveState("saving");
      const body = {
        ...payload,
        autosave: opts.autosave ?? false,
        create_revision: opts.createRevision ?? !opts.autosave,
      };
      const method = lessonId ? "PATCH" : "POST";
      const url = lessonId ? `/api/admin/lessons/${lessonId}` : "/api/admin/lessons";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json()) as { lesson?: { id: string }; error?: string };
      if (!res.ok) {
        setSaveState("error");
        const msg = j.error?.includes("[")
          ? "Could not save: check slug (lowercase-hyphens) and publish date (ISO), or leave them blank."
          : (j.error ?? "Save failed");
        if (!opts.autosave) toast(msg, "error");
        return null;
      }
      dirtyRef.current = false;
      setSaveState("saved");
      if (!opts.autosave) toast("Lesson saved");
      if (!lessonId && j.lesson?.id) {
        router.replace(`/admin/lessons/${j.lesson.id}/edit`);
      }
      return j.lesson ?? null;
    },
    [cmsBase, form.title, lessonId, payload, router, toast],
  );

  useEffect(() => {
    if (!lessonId || !dirtyRef.current || tab !== "edit") return;
    const t = window.setTimeout(() => {
      void saveLesson({ autosave: true, createRevision: false });
    }, 3500);
    return () => window.clearTimeout(t);
  }, [lessonId, payload, saveLesson, tab]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  useEffect(() => {
    if (!lessonId) return;
    void fetch(`/api/admin/lessons/${lessonId}/revisions`)
      .then((r) => r.json())
      .then((j: { revisions?: typeof revisions }) => setRevisions(j.revisions ?? []));
  }, [lessonId]);

  const previewToc = buildTocAndHtml(form.content_html);
  const readMin = estimateReadingMinutes(form.content_html);

  async function action(path: string, success: string, confirmOpts: ConfirmRequest) {
    if (!lessonId) return;
    if (!(await confirm(confirmOpts))) return;
    const res = await fetch(path, { method: "POST" });
    const j = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast(j.error ?? "Action failed", "error");
      return;
    }
    toast(success);
    router.refresh();
  }

  return (
    <AdminCard className="lesson-editor">
      <div className="lesson-editor__breadcrumb">
        <Link href={cmsHref(cmsBase, "/lessons")}>← Lessons</Link>
        <span className={`admin-save-pill admin-save-pill--${saveState}`}>
          {saveState === "saving" && "Saving…"}
          {saveState === "saved" && "Saved"}
          {saveState === "dirty" && "Unsaved changes"}
          {saveState === "error" && "Save failed"}
          {saveState === "idle" && "Draft"}
        </span>
      </div>

      <div className="lesson-editor__toolbar">
        <div className="lesson-editor__tabs">
          <button type="button" className={tab === "edit" ? "is-active" : ""} onClick={() => setTab("edit")}>
            Edit
          </button>
          <button type="button" className={tab === "preview" ? "is-active" : ""} onClick={() => setTab("preview")}>
            Live preview
          </button>
          {lessonId && (
            <Link href={cmsHref(cmsBase, `/lessons/${lessonId}/preview`)} className="btn" target="_blank">
              Public preview
            </Link>
          )}
        </div>
        <div className="lesson-editor__actions">
          <button
            type="button"
            className="btn"
            disabled={saveState === "saving"}
            onClick={() => {
              void (async () => {
                if (
                  !(await confirm(
                    withAdminConfirm(
                      lessonId
                        ? "Save changes to this lesson draft?"
                        : "Create this lesson draft?",
                      { title: lessonId ? "Save draft" : "Create draft" },
                    ),
                  ))
                ) {
                  return;
                }
                void saveLesson();
              })();
            }}
          >
            Save draft
          </button>
          {lessonId && (
            <>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  void action(
                    `/api/admin/lessons/${lessonId}/publish`,
                    "Published",
                    withAdminConfirm(
                      form.status === "published"
                        ? "Update the live published lesson with these changes?"
                        : "Publish this lesson on the public site?",
                      {
                        title: form.status === "published" ? "Update published lesson" : "Publish lesson",
                        confirmLabel: "Publish",
                      },
                    ),
                  );
                }}
              >
                Publish
              </button>
              <button
                type="button"
                className="btn"
                onClick={() =>
                  void action(
                    `/api/admin/lessons/${lessonId}/archive`,
                    "Archived",
                    withAdminConfirm(
                      "Archive this lesson? It will be hidden from the public site.",
                      { title: "Archive lesson", confirmLabel: "Archive" },
                    ),
                  )
                }
              >
                Archive
              </button>
              <button
                type="button"
                className="btn"
                onClick={() =>
                  void action(
                    `/api/admin/lessons/${lessonId}/duplicate`,
                    "Duplicated",
                    withAdminConfirm("Create a duplicate of this lesson?", {
                      title: "Duplicate lesson",
                    }),
                  )
                }
              >
                Duplicate
              </button>
            </>
          )}
        </div>
      </div>

      <div className="lesson-editor__grid">
        <div className="lesson-editor__main">
          <div className="admin-form admin-form--wide" hidden={tab !== "edit"}>
              <div className="admin-form__row-3">
                <div>
                  <label>Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => {
                      setForm({ ...form, title: e.target.value });
                      markDirty();
                    }}
                  />
                  {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}
                </div>
                <div>
                  <label>Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => {
                      setForm({ ...form, slug: e.target.value });
                      markDirty();
                    }}
                    placeholder="auto-from-title"
                  />
                </div>
                <div>
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => {
                      setForm({ ...form, status: e.target.value as typeof form.status });
                      markDirty();
                    }}
                  >
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                    <option value="archived">archived</option>
                  </select>
                </div>
              </div>

              <div className="admin-form__row-3">
                <div>
                  <label>Category *</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => {
                      setForm({ ...form, category_id: e.target.value });
                      markDirty();
                    }}
                  >
                    {genreOptions.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Lesson no *</label>
                  <input
                    value={form.lesson_no}
                    onChange={(e) => {
                      setForm({ ...form, lesson_no: e.target.value });
                      markDirty();
                    }}
                  />
                </div>
                <div>
                  <label>Publish date (ISO)</label>
                  <input
                    value={form.published_at ?? ""}
                    onChange={(e) => {
                      setForm({ ...form, published_at: e.target.value });
                      markDirty();
                    }}
                  />
                </div>
              </div>

              <div>
                <label>Summary / excerpt</label>
                <textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => {
                    setForm({ ...form, excerpt: e.target.value });
                    markDirty();
                  }}
                />
              </div>

              <div className="admin-form__row-2">
                <div>
                  <label>SEO title</label>
                  <input
                    value={form.seo_title}
                    onChange={(e) => {
                      setForm({ ...form, seo_title: e.target.value });
                      markDirty();
                    }}
                  />
                </div>
                <div>
                  <label>SEO description</label>
                  <input
                    value={form.seo_description}
                    onChange={(e) => {
                      setForm({ ...form, seo_description: e.target.value });
                      markDirty();
                    }}
                  />
                </div>
              </div>

              <MediaUploadField
                label="Thumbnail"
                bucket="lesson-thumbnails"
                onUploaded={(path, url) => {
                  setForm({ ...form, thumbnail_path: path, thumbnail_url: url });
                  markDirty();
                }}
              />
              {form.thumbnail_url && (
                <img src={form.thumbnail_url} alt="" className="lesson-editor__thumb-preview" />
              )}

              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button type="button" className="btn" onClick={() => setMediaOpen(true)}>
                  Insert image from library
                </button>
              </div>
              <VisualContentEditor
                editorKey={lessonId ?? "new-lesson"}
                label="Lesson content"
                initialHtml={initial?.content_html ?? form.content_html}
                initialJson={initial?.content_json ?? form.content_json}
                onChange={onContentChange}
              />
              <MediaPickerModal
                open={mediaOpen}
                onClose={() => setMediaOpen(false)}
                onPick={(url) => {
                  void navigator.clipboard.writeText(url);
                  toast("Image URL copied — paste into an image block in the editor");
                }}
              />
          </div>
          <div className="admin-preview-frame lesson-editor__preview" hidden={tab !== "preview"}>
              <p className="admin-visual-editor__hint" style={{ marginBottom: 12 }}>
                Live preview updates instantly from the editor — no save required. Use{" "}
                <strong>Public preview</strong> for the full lesson page layout in a new tab.
              </p>
              <div className="catalog-head">
                <div className="catalog-head__cat">
                  LESSON {form.lesson_no} · {genreOptions.find((g) => g.id === form.category_id)?.label}
                </div>
                <h1>{form.title || "Untitled lesson"}</h1>
                <div className="catalog-head__meta">
                  <span className="catalog-head__metaitem">{readMin}分で読了</span>
                  <span className="catalog-head__metaitem">Status: {form.status}</span>
                </div>
              </div>
              <div className="topic-page">
                <LessonToc items={previewToc.items} />
                <ArticleBody html={previewToc.htmlWithIds} />
              </div>
          </div>
        </div>

        <aside className="lesson-editor__aside admin-form">
          <h3>Metadata</h3>
          <label>Cross-listed categories</label>
          <input
            value={crossCsv}
            onChange={(e) => {
              setForm({ ...form, cross_category_ids: e.target.value });
              markDirty();
            }}
          />
          <label>thumb_intro</label>
          <input
            value={form.thumb_intro}
            onChange={(e) => {
              setForm({ ...form, thumb_intro: e.target.value });
              markDirty();
            }}
          />
          <label>thumb_accent</label>
          <input
            value={form.thumb_accent}
            onChange={(e) => {
              setForm({ ...form, thumb_accent: e.target.value });
              markDirty();
            }}
          />
          <label>thumb_subtitle</label>
          <input
            value={form.thumb_subtitle}
            onChange={(e) => {
              setForm({ ...form, thumb_subtitle: e.target.value });
              markDirty();
            }}
          />
          <label>views_count</label>
          <input
            type="number"
            value={form.views_count}
            onChange={(e) => {
              setForm({ ...form, views_count: Number(e.target.value) });
              markDirty();
            }}
          />
          <label>likes_count</label>
          <input
            type="number"
            value={form.likes_count}
            onChange={(e) => {
              setForm({ ...form, likes_count: Number(e.target.value) });
              markDirty();
            }}
          />
          <label>popular_rank</label>
          <input
            type="number"
            value={form.popular_rank ?? ""}
            onChange={(e) => {
              setForm({
                ...form,
                popular_rank: e.target.value === "" ? null : Number(e.target.value),
              });
              markDirty();
            }}
          />

          {lessonId && (
            <>
              <h3 style={{ marginTop: 20 }}>Revisions</h3>
              {revisions.length === 0 ? (
                <p className="admin-empty">No revisions yet.</p>
              ) : (
                <ul className="revision-list">
                  {revisions.map((r) => (
                    <li key={r.id}>
                      <div>{r.title}</div>
                      <div className="revision-list__meta">
                        {r.status} · {new Date(r.created_at).toLocaleString()}
                      </div>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          void (async () => {
                            if (
                              !(await confirm(
                                withAdminConfirm(
                                  "Restore this revision? The current draft will be replaced.",
                                  { title: "Restore revision", confirmLabel: "Restore" },
                                ),
                              ))
                            ) {
                              return;
                            }
                            const res = await fetch(
                              `/api/admin/lessons/${lessonId}/restore-revision`,
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ revision_id: r.id }),
                              },
                            );
                            if (!res.ok) {
                              toast("Restore failed", "error");
                              return;
                            }
                            toast("Revision restored");
                            router.refresh();
                          })();
                        }}
                      >
                        Restore
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </aside>
      </div>
    </AdminCard>
  );
}
