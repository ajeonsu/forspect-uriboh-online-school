# Migrations

Apply in order:

1. `001_initial_schema.sql` — tables, indexes, triggers, `profiles` on signup
2. `002_rls_policies.sql` — RLS + `public.is_admin()`

```bash
# Supabase CLI (from project root)
supabase db push

# Or paste each file into the Supabase SQL editor
```

After migrations, set real keys in `.env.local` and run:

```bash
npm run db:import:dry
npm run db:import
npm run db:validate:db
```

## First admin user

1. Set `BOOTSTRAP_ADMIN_EMAIL` in `.env.local`.
2. Sign up that email at `/signup` (role is always `user` from the DB trigger).
3. Promote to admin:

```bash
npm run db:bootstrap-admin
```

Or run `supabase/scripts/promote-bootstrap-admin.sql` in the SQL editor (replace the email).
