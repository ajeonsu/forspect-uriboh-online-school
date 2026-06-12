-- Contributors (role=user) can manage their own content; admins retain full access.

alter table public.categories
  add column if not exists created_by uuid references public.profiles(id) on delete set null;

drop policy if exists categories_owner_all on public.categories;
create policy categories_owner_all on public.categories
  for all
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists lessons_owner_all on public.lessons;
create policy lessons_owner_all on public.lessons
  for all
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists seminars_owner_all on public.seminars;
create policy seminars_owner_all on public.seminars
  for all
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists lesson_cross_links_owner on public.lesson_cross_links;
create policy lesson_cross_links_owner on public.lesson_cross_links
  for all
  using (
    exists (
      select 1 from public.lessons l
      where l.id = lesson_cross_links.lesson_id and l.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.lessons l
      where l.id = lesson_cross_links.lesson_id and l.created_by = auth.uid()
    )
  );

drop policy if exists media_assets_owner_all on public.media_assets;
create policy media_assets_owner_all on public.media_assets
  for all
  using (uploaded_by = auth.uid())
  with check (uploaded_by = auth.uid());

drop policy if exists lesson_revisions_owner_read on public.lesson_revisions;
create policy lesson_revisions_owner_read on public.lesson_revisions
  for select
  using (
    exists (
      select 1 from public.lessons l
      where l.id = lesson_revisions.lesson_id and l.created_by = auth.uid()
    )
  );
