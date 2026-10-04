# Sahiplen

Sahiplen helps people adopt shelter dogs in Turkey. In 2026 millions of stray dogs were collected
into municipal shelters; this site lets adopters search dogs across shelters by city, size, sex and
age and browse them in a gallery. Later iterations add shelter staff accounts so shelters can manage
their own dogs.

The UI is Turkish. Code, comments and commits are English. See [CLAUDE.md](CLAUDE.md) for
conventions and the iteration plan.

**Status:** iteration 1 — public, read-only gallery backed by **fake seed data**.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router, Server Components), TypeScript (strict), Tailwind CSS v4
- [Supabase](https://supabase.com) Postgres, accessed with `@supabase/ssr`; schema managed with the
  Supabase CLI (`npx supabase`, pinned as a devDependency)
- [Vercel](https://vercel.com) hosting
- ESLint + Prettier

## Setup

Requirements: Node.js 20.9+ (an LTS release, 22 or 24, is recommended), npm, and a Supabase project.
No Docker or local Supabase stack is needed.

```bash
npm install
cp .env.example .env.local   # then fill in the two values below
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable                        | Where to find it                                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase Dashboard → Project Settings → API / Data API                                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API Keys (legacy `anon` key or the `sb_publishable_…` key) |

Both are public by design: the data is protected by Row Level Security. **Never** use the
`service_role` / secret key in this app, and never commit `.env.local`.

## Database: migrations and seed

Schema lives in [`supabase/migrations/`](supabase/migrations), fake data in
[`supabase/seed.sql`](supabase/seed.sql). They are applied **directly to the remote project**:

```bash
npx supabase login                          # once per machine (opens browser)
npx supabase link --project-ref <ref>       # once per clone; asks for the DB password
npm run db:push                             # supabase db push --include-seed
npm run db:types                            # regenerate src/lib/supabase/database.types.ts
npm run verify:rls                          # check with the anon key that hidden data stays hidden
```

`<ref>` is the ID in your dashboard URL (`https://supabase.com/dashboard/project/<ref>`).

- `db push` applies only migrations that haven't been applied yet. The seed is applied once; the CLI
  records it and only re-runs it if the file changes, so don't edit `seed.sql` once real data exists.
- To change the schema: `npx supabase migration new <name>`, write SQL, `npm run db:push`,
  `npm run db:types`, commit everything. Never edit a migration that has already been pushed.

### Data model (summary)

`shelters`, `dogs` (with `estimated_birth_date`, never a stored age), `dog_photos`, `profiles`
(staff, used from iteration 2) and `status_history` (written automatically by a trigger whenever a
dog's status changes).

### Access rules (RLS)

RLS is enabled on every table. Anonymous and logged-in users can only **read**:

- all shelters
- dogs whose status is `available`
- photos of available dogs

Reserved, adopted, deceased and transferred dogs, `status_history` and `profiles` are not readable,
and there are no write permissions yet. `npm run verify:rls` checks these rules against the live
database using only the anon key.

The seed has 42 available dogs and 8 hidden ones: **Çomar, Kınalı** (reserved), **Kahve, Patron,
Susam** (adopted), **Sarıkız, Karamel** (deceased), **Fırtına** (transferred). None of these names
should ever appear on the site.

## Scripts

| Script                 | What it does                                                   |
| ---------------------- | -------------------------------------------------------------- |
| `npm run dev`          | Development server                                             |
| `npm run build`        | Production build                                               |
| `npm run lint`         | ESLint                                                         |
| `npm run format`       | Prettier (write)                                               |
| `npm run format:check` | Prettier (check only)                                          |
| `npm run db:push`      | Apply pending migrations + seed to the linked Supabase project |
| `npm run db:types`     | Generate TypeScript types from the linked project              |
| `npm run verify:rls`   | RLS checks with the anon key (reads `.env.local`)              |

## Deployment

The GitHub repo is connected to Vercel. Every push to `main` deploys to production; pushes to other
branches and pull requests get preview deployments.

One-time setup in Vercel:

1. **Add New → Project**, import the GitHub repo (framework preset: Next.js, defaults are fine).
2. Under **Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` for **Production** and **Preview**.
3. Deploy. If you change env vars later, redeploy: `NEXT_PUBLIC_*` values are inlined at build time.
4. Recommended: **Settings → Functions → Function Region** → the region closest to the Supabase
   project (e.g. Frankfurt `fra1` for a Central EU project), then redeploy. Pages query the database
   on every request, so this keeps those round trips short.

Database migrations are **not** run by Vercel. Run `npm run db:push` yourself before deploying code
that depends on a schema change.
