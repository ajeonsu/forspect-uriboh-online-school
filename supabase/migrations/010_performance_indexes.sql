-- Query performance for lists, admin filters, engagement, and analytics

create index if not exists idx_lessons_status_updated_at
  on public.lessons (status, updated_at desc);

create index if not exists idx_lessons_category_status_no
  on public.lessons (category_id, status, lesson_no);

create index if not exists idx_lessons_status_views
  on public.lessons (status, views_count desc);

create index if not exists idx_lessons_status_likes
  on public.lessons (status, likes_count desc);

create index if not exists idx_lessons_slug
  on public.lessons (slug)
  where slug is not null;

create index if not exists idx_lessons_created_by_status
  on public.lessons (created_by, status)
  where created_by is not null;

create index if not exists idx_categories_parent_sort
  on public.categories (parent_id, sort_order);

create index if not exists idx_categories_active_sort
  on public.categories (is_active, sort_order);

create index if not exists idx_seminars_status_start_at
  on public.seminars (status, start_at);

create index if not exists idx_seminars_moderation_start
  on public.seminars (moderation_status, start_at)
  where moderation_status is not null;

create index if not exists idx_favorites_user_created
  on public.favorites (user_id, created_at desc);

create index if not exists idx_favorites_lesson
  on public.favorites (lesson_id);

create index if not exists idx_lesson_likes_user_created
  on public.lesson_likes (user_id, created_at desc);

create index if not exists idx_lesson_likes_lesson
  on public.lesson_likes (lesson_id);

create index if not exists idx_profiles_role
  on public.profiles (role);

-- analytics_events from 003_admin_cms.sql
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'analytics_events'
  ) then
    execute 'create index if not exists idx_analytics_events_type_created on public.analytics_events (event_type, created_at desc)';
    execute 'create index if not exists idx_analytics_events_created on public.analytics_events (created_at desc)';
  end if;
end $$;

-- Substring search (title / plain text)
create extension if not exists pg_trgm;

create index if not exists idx_lessons_title_trgm
  on public.lessons using gin (title gin_trgm_ops);

create index if not exists idx_lessons_content_plain_trgm
  on public.lessons using gin (content_plain gin_trgm_ops);
