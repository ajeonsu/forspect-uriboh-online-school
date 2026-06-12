export type LessonEditorContent = {
  content_html: string;
  content_json: unknown[];
  content_plain: string;
};

export type VisualContentEditorProps = {
  label?: string;
  initialHtml: string;
  initialJson?: unknown[] | null;
  onChange: (payload: LessonEditorContent) => void;
  editorKey?: string;
};
