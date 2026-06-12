# URIBOH (Next.js + Supabase)

Migration of the static URIBOH learning site to Next.js App Router with Supabase Auth, PostgreSQL, Storage, and REST APIs.

## Stack

- Next.js 15 (App Router) + TypeScript
- Supabase (Auth, Postgres, Storage)
- Vercel-ready

Original static files are preserved under `static-original/`. Thumbnails are served from `public/thumbs/` (copied from `thumbs/`).

## Setup

1. Copy `.env.local.example` to `.env.local` and fill Supabase keys.
2. Apply SQL migrations in `supabase/migrations/` (Supabase CLI or SQL editor).
3. `npm install`
4. `npm run db:import:dry` — validate counts (23 categories, 111 lessons)
5. `npm run db:import` — upsert content from `static-original/index.html`
6. Promote an admin (SQL only): `update profiles set role = 'admin' where email = 'you@example.com';`
7. `npm run dev`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:import:dry` | Parse static HTML, print counts |
| `npm run db:import` | Upsert categories/lessons/cross-links |

## Legacy hash URLs

- Next route: `/legacy` (client redirect from hash)
- Static helper: `/legacy-hash.html` (for `index.html#/g/...` bookmarks)

## API note

Lesson by slug: `GET /api/lessons/slug/[genreId]/[lessonNo]` (Next.js cannot mount both `[genreId]/[lessonNo]` and `[id]/like` under the same segment).

Likes: `POST|DELETE /api/lessons/[id]/like` (lesson UUID).

## Storage buckets

- `lesson-thumbnails` (public read, admin write)
- `seminar-assets` (public read, admin write)
