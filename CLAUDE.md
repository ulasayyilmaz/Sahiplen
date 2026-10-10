# Sahiplen

A website for adopting shelter dogs in Turkey. In 2026 the government collected millions of stray
dogs into municipal shelters. Adopters search dogs across shelters by criteria and browse them in a
gallery. Shelter staff sign up, are approved by the platform admin, and manage their own shelter's
dogs and photos.

## Language

- **UI is Turkish.** Every user-facing string lives in `src/lib/strings/tr.ts`; never hardcode UI text
  in components (keeps the door open for i18n).
- Code, comments, identifiers, commit messages and docs are in **English**.

## Stack (fixed — don't substitute)

- Next.js (App Router, Server Components), TypeScript strict, Tailwind CSS v4, npm
- Supabase Postgres via `@supabase/ssr`; Supabase CLI via `npx supabase` (pinned devDependency)
- Vercel hosting (GitHub integration, deploys on push to `main`)
- ESLint (flat config) + Prettier (with `prettier-plugin-tailwindcss`)

## Iteration plan

0. Skeleton: repo, framework, database connection, deployment — **done**
1. Public read-only gallery with filters, fake seed data — **done**
2. Shelter staff accounts: auth, admin approval, CRUD for own shelter's dogs, photo upload, RLS — **done**
3. Adoption path: dog detail page, shelter contact, share previews, distance sorting, staleness flags
   — **next**; start with the detail page, and first decide which dog columns are public (today
   anon can read every column of an available dog, incl. `microchip_number`)
4. Growth: saved searches/alerts, community-dog lookup by neighborhood/microchip, stats

Only build what the current iteration asks for.

## Commands

```bash
npm run dev            # local dev server
npm run build          # production build (must pass)
npm run lint           # eslint (must pass with zero errors)
npm run format         # prettier --write
npm run format:check   # prettier --check
npm run db:push        # apply migrations + seed to the linked remote Supabase project
npm run db:types       # regenerate src/lib/supabase/database.types.ts from the linked project
npm run verify:rls     # 48 access-rule checks: anon + logged in as each test account
```

There is **no local Supabase stack / Docker**. Migrations and seed go straight to the remote project
via `npx supabase link` + `npm run db:push`.

## Conventions

- **Database changes only via new files in `supabase/migrations/`** (`npx supabase migration new <name>`).
  Never edit a migration that has already been pushed. After any schema change, run `npm run db:types`
  and commit the regenerated types.
- `src/lib/supabase/database.types.ts` is generated — don't edit by hand.
- **RLS is enabled on every table.** Every new table needs RLS enabled plus explicit grants and policies
  in the same migration. Tables are least-privilege: grants are revoked from `anon`/`authenticated` and
  added back explicitly.
- Public visibility rules: anyone may read `shelters`, `dogs` with `status = 'available'`, and photos of
  available dogs. Deceased (and other non-available) dogs, `status_history` and `profiles` must never be
  publicly readable. App queries also filter `status = 'available'` as defense in depth, but RLS is the
  guarantee.
- Staff/admin rules are also enforced only in the database: approved staff write their own shelter's
  dogs/photos/storage folder; admin actions are `security definer` functions in `public`
  (`admin_set_staff`, `admin_reject_staff`, `admin_list_staff`) that first check
  `private.is_platform_admin()`. Policy helpers live in the non-exposed `private` schema. Role,
  approval and shelter can never be changed by users themselves. See the README's access table.
- **Staff queries must filter by `shelter_id` explicitly** (`src/lib/dogs/staff-queries.ts`): RLS also
  lets everyone read _available_ dogs of other shelters, so RLS alone would mix them in.
- **Run `npm run verify:rls` after every migration**, and add checks for any new rule (each "cannot"
  needs a matching "can" control).
- Store `estimated_birth_date`, never an age. Ages and age groups are computed (`src/lib/dogs/age.ts`)
  using today's date in `Europe/Istanbul`.
- Gallery filter state lives in URL search params (shareable, back-button friendly); queries run on the
  server. Filter parsing/URL building is in `src/lib/dogs/filters.ts`.
- Data access goes through `src/lib/**/queries.ts` / `staff-queries.ts`; components don't build Supabase
  queries directly. Mutations are Server Actions in `src/lib/**/actions.ts`.
- Auth: `src/proxy.ts` refreshes the session and redirects logged-out users from `/panel` and
  `/yonetim`; pages and actions call `getCurrentUser` / `requireUser` / `requireApprovedStaff` /
  `requireAdmin` (`src/lib/auth/session.ts`). Identity comes from `getClaims()`, never `getSession()`.
- Forms: Server Action + zod schema + `useActionState`, returning `FormState` (`src/lib/forms.ts`);
  shared field components in `src/components/form/`. Redirect targets go through `safeNextPath`.
- Photos: rules in `src/lib/photos/rules.ts`, browser resize in `resize.ts`; the browser uploads to the
  `dog-photos` bucket at `<shelter_id>/<dog_id>/<uuid>.webp`, then `addDogPhoto` records it.
- Gallery-only `loading.tsx`/`error.tsx` live in the `src/app/(gallery)` route group so they don't apply
  to other pages. URLs are Turkish ASCII slugs (`/kayit`, `/giris`, `/panel`, `/yonetim`).
- Accessibility: every image has Turkish alt text, every control has a label, everything is keyboard
  reachable with a visible focus ring.
- Mobile-first Tailwind; default Tailwind palette, no design system yet.

## Secrets

- Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used, read from `.env.local`
  (template: `.env.example`). Both are public by design; RLS protects the data.
- `TEST_USER_PASSWORD` (test accounts, `verify:rls` only) is local-only: never in Vercel, never in code.
- Database pushes go to the live project the site uses: show the dry-run and get the user's OK first.
- **Never** use the `service_role` / secret key anywhere in app code or scripts. Never commit `.env*`
  files other than `.env.example`.

## Git

- Small commits, Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, with scopes like
  `feat(db):`, `feat(gallery):`). Run `npm run lint && npm run build` before committing.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
