alter table public.lesson_revisions enable row level security;
alter table public.media_assets enable row level security;
alter table public.admin_activity_logs enable row level security;

drop policy if exists lesson_revisions_admin_all on public.lesson_revisions;
create policy lesson_revisions_admin_all on public.lesson_revisions
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists media_assets_admin_all on public.media_assets;
create policy media_assets_admin_all on public.media_assets
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists admin_activity_logs_admin_all on public.admin_activity_logs;
create policy admin_activity_logs_admin_all on public.admin_activity_logs
  for all using (public.is_admin()) with check (public.is_admin());
