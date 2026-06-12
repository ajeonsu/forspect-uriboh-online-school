-- Run in Supabase SQL editor after the user has signed up once.
-- Replace the email with BOOTSTRAP_ADMIN_EMAIL from .env.local.

update public.profiles
set role = 'admin'
where lower(email) = lower('your-admin@example.com');

-- Verify:
-- select id, email, role from public.profiles where lower(email) = lower('your-admin@example.com');
