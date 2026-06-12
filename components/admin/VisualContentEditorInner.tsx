"use client";

import { BlockNoteViewRaw as BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import { htmlToPlainText } from "@/lib/cms/lesson-content";
import { useEffect, useRef, useState } from "react";

import type { VisualContentEditorProps } from "@/components/admin/VisualContentEditor.types";

async function uploadEditorImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", "seminar-assets");
  const res = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
  const j = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !j.url) throw new Error(j.error ?? "Upload failed");
  return j.url;
}

export function VisualContentEditorInner({
  label = "Content",
  initialHtml,
  initialJson,
  onChange,
  editorKey = "default",
}: VisualContentEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const loadedKeyRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [showView, setShowView] = useState(false);

  const editor = useCreateBlockNote({
    uploadFile: uploadEditorImage,
  });

  useEffect(() => {
    if (loadedKeyRef.current === editorKey) return;
    loadedKeyRef.current = editorKey;
    setReady(false);
    void (async () => {
      try {
        const blocks =
          initialJson && initialJson.length > 0
            ? (initialJson as Parameters<typeof editor.replaceBlocks>[1])
            : editor.tryParseHTMLToBlocks(initialHtml?.trim() || "<p></p>");
        editor.replaceBlocks(editor.document, blocks);
        const content_html = editor.blocksToHTMLLossy(editor.document);
        onChangeRef.current({
          content_html,
          content_json: editor.document as unknown[],
          content_plain: htmlToPlainText(content_html),
        });
      } catch {
        editor.replaceBlocks(editor.document, [{ type: "paragraph", content: "" }]);
      }
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load when editorKey changes only
  }, [editor, editorKey]);

  useEffect(() => {
    if (!ready) {
      setShowView(false);
      return;
    }
    const id = requestAnimationFrame(() => setShowView(true));
    return () => cancelAnimationFrame(id);
  }, [ready]);

  return (
    <div className="admin-visual-editor">
      <label>{label}</label>
      {!ready || !showView ? (
        <div className="admin-visual-editor__loading">Loading editor…</div>
      ) : (
        <BlockNoteView
          editor={editor}
          onChange={() => {
            const content_html = editor.blocksToHTMLLossy(editor.document);
            onChangeRef.current({
              content_html,
              content_json: editor.document as unknown[],
              content_plain: htmlToPlainText(content_html),
            });
          }}
        />
      )}
      <p className="admin-visual-editor__hint">
        Drag blocks with the handle on the left. Type <kbd>/</kbd> to insert headings, lists, images, quotes, and
        more.
      </p>
    </div>
  );
}
