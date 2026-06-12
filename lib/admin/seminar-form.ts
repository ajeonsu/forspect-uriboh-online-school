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

function emptySeminar(): SeminarRow {
  return {
    id: "",
    title: "",
    description: "",
    host_name: "",
    category_tags: [],
    start_at: "",
    end_at: "",
    location: "",
    apply_url: "",
    status: "draft",
    moderation_status: "approved",
  };
}

/** Default form state for creating a seminar (safe to call from Server Components). */
export function seminarFormDefaults(isAdmin: boolean): SeminarRow {
  const base = emptySeminar();
  if (!isAdmin) {
    base.moderation_status = "pending";
    base.status = "draft";
  }
  return base;
}
