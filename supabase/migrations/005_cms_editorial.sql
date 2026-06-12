-- Editorial CMS: lesson content JSON, revisions, media library, activity log

alter table public.lessons
  add column if not exists slug text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists content_json jsonb,
  add column if not exists content_plain text not null default '';

create unique index if not exists lessons_category_slug_idx
  on public.lessons (category_id, slug)
  where slug is not null;

create table if not exists public.lesson_revisions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  summary text,
  content_json jsonb,
  content_html text not null default '',
  thumbnail_url text,
  status text not null check (status in ('draft', 'published', 'archived')),
  edited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists lesson_revisions_lesson_id_created_at_idx
  on public.lesson_revisions (lesson_id, created_at desc);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_path text not null,
  public_url text not null,
  mime_type text,
  size bigint,
  width integer,
  height integer,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists media_assets_created_at_idx on public.media_assets (created_at desc);

create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_logs_created_at_idx
  on public.admin_activity_logs (created_at desc);

-- Backfill plain text from existing HTML for search
update public.lessons
set content_plain = regexp_replace(
  regexp_replace(coalesce(content_html, ''), '<[^>]+>', ' ', 'g'),
  '\s+',
  ' ',
  'g'
)
where content_plain = '' and coalesce(content_html, '') <> '';
