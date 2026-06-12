-- RLS for CMS tables (admin uses service role; users cannot read/write directly)

alter table public.newsletter_subscribers enable row level security;
alter table public.analytics_events enable row level security;

drop policy if exists newsletter_admin_all on public.newsletter_subscribers;
create policy newsletter_admin_all on public.newsletter_subscribers
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists analytics_admin_all on public.analytics_events;
create policy analytics_admin_all on public.analytics_events
  for all using (public.is_admin()) with check (public.is_admin());

-- Allow inserts for analytics from authenticated users (optional tracking)
drop policy if exists analytics_insert_authenticated on public.analytics_events;
create policy analytics_insert_authenticated on public.analytics_events
  for insert with check (auth.uid() is not null);
