export type UserRole = "admin" | "user";

export type LessonStatus = "draft" | "published" | "archived";

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  role: UserRole;
}

export interface Category {
  id: string;
  parent_id: string | null;
  label: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  emoji: string | null;
  cover_class: string | null;
  sort_order: number;
  is_active: boolean;
  subgenreIds?: string[];
}

export interface Lesson {
  id: string;
  category_id: string;
  lesson_no: string;
  title: string;
  excerpt: string | null;
  content_html?: string;
  thumbnail_path: string | null;
  thumbnail_url: string | null;
  thumb_intro: string | null;
  thumb_accent: string | null;
  thumb_subtitle: string | null;
  views_count: number;
  likes_count: number;
  popular_rank: number | null;
  status: LessonStatus;
  published_at: string | null;
}

export interface Seminar {
  id: string;
  title: string;
  description: string | null;
  host_name: string | null;
  category_tags: string[] | null;
  start_at: string | null;
  end_at: string | null;
  location: string | null;
  apply_url: string | null;
  thumbnail_path: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  status: LessonStatus;
}

export interface StaticTopic {
  no: string;
  title: string;
  views?: number;
  likes?: number;
  popular?: number;
  thumb?: string;
  thumb_intro?: string;
  thumb_accent?: string;
  thumb_subtitle?: string;
  crossList?: string[];
}

export interface StaticGenre {
  id: string;
  parent?: string;
  label: string;
  title: string;
  sub?: string;
  desc?: string;
  emoji?: string;
  cov?: string;
  subgenreIds?: string[];
  topics: StaticTopic[];
}
