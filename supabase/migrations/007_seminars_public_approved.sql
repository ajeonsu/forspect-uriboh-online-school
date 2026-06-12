-- Only approved seminars are visible to anonymous users (pending/rejected hidden)

drop policy if exists seminars_public_read on public.seminars;
create policy seminars_public_read on public.seminars
  for select
  using (
    status = 'published'
    and (
      moderation_status is null
      or moderation_status = 'approved'
    )
  );
