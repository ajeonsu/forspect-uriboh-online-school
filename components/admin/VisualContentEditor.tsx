"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { VisualContentEditorProps } from "@/components/admin/VisualContentEditor.types";

export type { LessonEditorContent, VisualContentEditorProps } from "@/components/admin/VisualContentEditor.types";

export const VisualContentEditor = dynamic(
  () =>
    import("@/components/admin/VisualContentEditorInner").then((m) => m.VisualContentEditorInner),
  {
    ssr: false,
    loading: () => (
      <div className="admin-visual-editor">
        <div className="admin-visual-editor__loading">Loading editor…</div>
      </div>
    ),
  },
) as ComponentType<VisualContentEditorProps>;
