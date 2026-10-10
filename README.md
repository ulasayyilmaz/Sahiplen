# Sahiplen

Sahiplen helps people adopt shelter dogs in Turkey. In 2026 millions of stray dogs were collected
into municipal shelters; this site lets adopters search dogs across shelters by city, size, sex and
age and browse them in a gallery. Shelter staff sign up, get approved by the platform admin, and
manage their own shelter's dogs and photos.

The UI is Turkish. Code, comments and commits are English. See [CLAUDE.md](CLAUDE.md) for
conventions and the iteration plan.

**Status:** iteration 2 done — public gallery, staff accounts with admin approval, dog management and
photo upload. The data is still **fake seed data**. Next: iteration 3 (dog detail page, shelter
contact); until then adopters only see the gallery cards.

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
| `TEST_USER_PASSWORD`            | Optional, local only: password of the [test accounts](#test-accounts), used by `verify:rls`        |

The two `NEXT_PUBLIC_*` values are public by design: the data is protected by Row Level Security.
**Never** use the `service_role` / secret key in this app, never commit `.env.local`, and never set
`TEST_USER_PASSWORD` in Vercel.

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

`shelters`, `dogs` (with `estimated_birth_date`, never a stored age), `dog_photos` (max 3 per dog,
lowest `sort_order` is the cover), `profiles` (one per account: name, phone, shelter, role,
`approved`) and `status_history` (written automatically by a trigger whenever a dog's status
changes, with who changed it). Photo files live in the public Storage bucket `dog-photos`.

### Access rules (RLS)

RLS is enabled on every table; all rules are enforced in the database, not in the app.

| Who                     | Can                                                                                                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anyone                  | Read shelters, dogs with status `available`, and photos of available dogs                                                                                                              |
| Logged in, not approved | The above, plus read their own profile                                                                                                                                                 |
| Approved staff          | Read, add and edit their own shelter's dogs (any status) and their status history; add, reorder and delete those dogs' photos (own shelter's storage folder only); edit own name/phone |
| Platform admin          | Everything above for all shelters, add/edit shelters, delete dogs, list staff with emails, approve/reject staff (`admin_*` database functions)                                         |

Nobody can approve themselves, change their own role or shelter, move a dog to another shelter, or
demote/delete an admin account through the app. Staff can't delete dogs; they change the status.

The seed has 42 available dogs and 8 hidden ones: **Çomar, Kınalı** (reserved), **Kahve, Patron,
Susam** (adopted), **Sarıkız, Karamel** (deceased), **Fırtına** (transferred). None of these names
should ever appear on the public site.

> **Known gap:** the database lets anyone read _every_ column of an available dog through the API,
> including `microchip_number` and `health_notes`, even though the site doesn't show them yet.
> Decide which fields are public before iteration 3's detail page (proposal: hide the microchip
> number, allow lookup by exact number only).

### Verifying the rules

`npm run verify:rls` runs 48 checks against the live database: as an anonymous visitor, and logged
in as each test account. Every "cannot" check has a matching "can" check, so a broken setup doesn't
pass by accident. Without `TEST_USER_PASSWORD` only the 13 anonymous checks run. **Run it after
every migration.**

## Staff accounts

1. Staff sign up at `/kayit` (name, phone, shelter from the list, email, password) and confirm their
   email. A database trigger creates their profile as **unapproved staff**, whatever the sign-up
   request contains.
2. Until approved, `/panel` only shows "Kaydın onay bekliyor".
3. The platform admin approves them at `/yonetim`, choosing the shelter (defaults to the requested
   one). Rejecting deletes the account. Staff can also be moved to another shelter or revoked.
4. Approved staff manage their shelter's dogs at `/panel`: add/edit dogs, change status (anything but
   "Yuva bekliyor" removes the dog from the gallery at once), upload up to 3 photos.

Shelters are created by the admin at `/yonetim` (staff pick from that list when signing up).

**Making someone platform admin** (only possible in SQL, by design): sign up normally, then in
Supabase → SQL Editor:

```sql
update public.profiles set role = 'platform_admin', approved = true
where user_id = (select id from auth.users where email = 'someone@example.com');
```

### Supabase Auth settings (dashboard)

- **Authentication → URL Configuration:** Site URL = the production URL
  (`https://sahiplen.vercel.app`); Redirect URLs: `https://sahiplen.vercel.app/**` and
  `http://localhost:3000/**`.
- **Email:** Supabase's built-in email only delivers to members of the Supabase project team and is
  heavily rate-limited. **Before real shelters sign up, configure custom SMTP** (e.g. Resend with a
  verified domain). Custom SMTP should also unlock editing the email templates; Turkish templates
  should link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/panel`
  (sign-up) and `…&type=recovery&next=/sifre-yenile` (password reset). Until then the default English
  emails work, but their links must be opened in the browser used to sign up.

### Photos

Photos are checked and resized **in the browser** before upload (`src/lib/photos/`): shapes between
2:1 and 1:2 only, at least 300 px, longest side scaled to 1200 px with proportions kept, EXIF
rotation applied, WebP (JPEG on Safari). The browser uploads straight to Storage, then a server
action records the photo. Cards crop to a square with `object-cover`, so photos are never stretched.
Files are cached by the CDN for 1 hour, so a deleted photo can stay reachable at its exact URL for up
to an hour.

### Test accounts

Four accounts in the Supabase project, all `@example.com` with one shared password (in
`.env.local` as `TEST_USER_PASSWORD`):

| Account        | Role                                                   |
| -------------- | ------------------------------------------------------ |
| `test-admin`   | platform admin                                         |
| `test-staff-a` | approved staff, İstanbul — Patili Dostlar (shelter 01) |
| `test-staff-b` | approved staff, Ankara — Can Dostlar (shelter 03)      |
| `test-pending` | signed up, not approved                                |

Create them in Supabase → Authentication → Users → Add user (tick **Auto Confirm User**), make
`test-admin` an admin with the SQL above, and approve the two staff accounts at `/yonetim`. They
belong in the test project only, never in production.

## Scripts

| Script                 | What it does                                                           |
| ---------------------- | ---------------------------------------------------------------------- |
| `npm run dev`          | Development server                                                     |
| `npm run build`        | Production build                                                       |
| `npm run lint`         | ESLint                                                                 |
| `npm run format`       | Prettier (write)                                                       |
| `npm run format:check` | Prettier (check only)                                                  |
| `npm run db:push`      | Apply pending migrations + seed to the linked Supabase project         |
| `npm run db:types`     | Generate TypeScript types from the linked project                      |
| `npm run verify:rls`   | Checks the access rules against the live database (reads `.env.local`) |

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

Database migrations are **not** run by Vercel. Run `npm run db:push` (and `npm run verify:rls`)
yourself before deploying code that depends on a schema change.

### Production vs. test data (planned)

Right now one Supabase project holds the fake seed data and the test accounts, and the live site
uses it. When the first real shelter is ready: keep this project as the **test** project (local
development and Vercel Preview), create a new empty **production** project for Vercel Production,
and push the migrations there **without** `--include-seed`.
