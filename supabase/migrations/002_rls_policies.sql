-- RLS policies for URIBOH
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_cross_links enable row level security;
alter table public.favorites enable row level security;
alter table public.lesson_likes enable row level security;
alter table public.seminars enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- profiles
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );

-- categories
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select
  using (is_active = true);

drop policy if exists categories_admin_all on public.categories;
create policy categories_admin_all on public.categories
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- lessons
drop policy if exists lessons_public_read on public.lessons;
create policy lessons_public_read on public.lessons
  for select
  using (status = 'published');

drop policy if exists lessons_admin_all on public.lessons;
create policy lessons_admin_all on public.lessons
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- lesson_cross_links
drop policy if exists lesson_cross_links_public_read on public.lesson_cross_links;
create policy lesson_cross_links_public_read on public.lesson_cross_links
  for select
  using (
    exists (
      select 1
      from public.lessons l
      where l.id = lesson_id
        and l.status = 'published'
    )
  );

drop policy if exists lesson_cross_links_admin_all on public.lesson_cross_links;
create policy lesson_cross_links_admin_all on public.lesson_cross_links
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- favorites
drop policy if exists favorites_own on public.favorites;
create policy favorites_own on public.favorites
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- lesson_likes
drop policy if exists lesson_likes_own on public.lesson_likes;
create policy lesson_likes_own on public.lesson_likes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- seminars
drop policy if exists seminars_public_read on public.seminars;
create policy seminars_public_read on public.seminars
  for select
  using (status = 'published');

drop policy if exists seminars_admin_all on public.seminars;
create policy seminars_admin_all on public.seminars
  for all
  using (public.is_admin())
  with check (public.is_admin());
