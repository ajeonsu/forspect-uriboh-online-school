/** Columns for lesson cards, rankings, and list pages (no article body). */
export const LESSON_LIST_SELECT =
  "id, category_id, lesson_no, slug, title, excerpt, thumbnail_path, thumbnail_url, thumb_intro, thumb_accent, thumb_subtitle, views_count, likes_count, popular_rank, status, published_at";

/** Full lesson row for detail pages. */
export const LESSON_DETAIL_SELECT = `${LESSON_LIST_SELECT}, content_html`;

export const SEMINAR_LIST_SELECT =
  "id, title, description, host_name, category_tags, start_at, end_at, location, apply_url, thumbnail_path, thumbnail_url, video_url, status";

export const CATEGORY_PUBLIC_SELECT =
  "id, parent_id, label, title, subtitle, description, emoji, cover_class, sort_order, is_active";
