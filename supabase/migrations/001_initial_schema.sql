-- URIBOH initial schema (profiles, categories, lessons, engagement, seminars)
create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id text primary key,
  parent_id text references public.categories(id) on delete set null,
  label text not null,
  title text not null,
  subtitle text,
  description text,
  emoji text,
  cover_class text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  category_id text not null references public.categories(id) on delete restrict,
  lesson_no text not null,
  title text not null,
  excerpt text,
  content_html text not null default '',
  thumbnail_path text,
  thumbnail_url text,
  thumb_intro text,
  thumb_accent text,
  thumb_subtitle text,
  views_count integer not null default 0,
  likes_count integer not null default 0,
  popular_rank integer,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, lesson_no)
);

create table public.lesson_cross_links (
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  target_category_id text not null references public.categories(id) on delete cascade,
  primary key (lesson_id, target_category_id)
);

create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table public.lesson_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table public.seminars (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  host_name text,
  category_tags text[],
  start_at timestamptz,
  end_at timestamptz,
  location text,
  apply_url text,
  thumbnail_path text,
  thumbnail_url text,
  video_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lessons_category_id_idx on public.lessons (category_id);
create index lessons_status_idx on public.lessons (status);
create index seminars_status_idx on public.seminars (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger lessons_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

create trigger seminars_updated_at
  before update on public.seminars
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'user'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
