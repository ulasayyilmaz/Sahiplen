-- Row Level Security, grants and public read policies.
--
-- Public (anon + authenticated) may read:
--   * all shelters
--   * dogs with status = 'available'
--   * photos of available dogs
-- Everything else (non-available dogs, profiles, status_history) is not readable.
-- No write policies yet; staff writes arrive with auth in iteration 2.

-- ---------------------------------------------------------------------------
-- RLS on every table
-- ---------------------------------------------------------------------------

alter table public.shelters enable row level security;
alter table public.dogs enable row level security;
alter table public.dog_photos enable row level security;
alter table public.profiles enable row level security;
alter table public.status_history enable row level security;

-- ---------------------------------------------------------------------------
-- Grants: least privilege instead of relying on Supabase's default grants.
-- (Also removes TRUNCATE, which RLS does not cover.)
-- ---------------------------------------------------------------------------

revoke all on table
  public.shelters,
  public.dogs,
  public.dog_photos,
  public.profiles,
  public.status_history
from anon, authenticated;

grant select on table
  public.shelters,
  public.dogs,
  public.dog_photos
to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------

create policy "Shelters are publicly readable"
on public.shelters
for select
to anon, authenticated
using (true);

create policy "Available dogs are publicly readable"
on public.dogs
for select
to anon, authenticated
using (status = 'available');

create policy "Photos of available dogs are publicly readable"
on public.dog_photos
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.dogs d
    where d.id = dog_photos.dog_id
      and d.status = 'available'
  )
);

-- profiles and status_history intentionally have no policies: with RLS enabled
-- and no grants, they are unreadable for anon and authenticated.
