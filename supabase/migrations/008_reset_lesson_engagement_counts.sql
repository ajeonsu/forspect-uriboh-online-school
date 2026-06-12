-- One-time: remove decorative view/like numbers from static HTML import.
-- Safe to run in Supabase SQL Editor. Does not delete lesson_likes rows.

update public.lessons
set views_count = 0,
    likes_count = 0,
    updated_at = now();

-- Optional: align likes_count with real user likes (uncomment if needed)
-- update public.lessons l
-- set likes_count = coalesce((
--   select count(*)::int from public.lesson_likes ll where ll.lesson_id = l.id
-- ), 0),
-- updated_at = now();
