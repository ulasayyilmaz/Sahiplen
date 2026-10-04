-- Core schema: shelters, dogs, photos, staff profiles and dog status history.
-- RLS, grants and policies live in the next migration.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.dog_status as enum ('available', 'reserved', 'adopted', 'deceased', 'transferred');
create type public.dog_sex as enum ('male', 'female', 'unknown');
create type public.dog_size as enum ('small', 'medium', 'large');
create type public.staff_role as enum ('staff', 'shelter_admin', 'platform_admin');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.shelters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  district text not null,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  phone text,
  address text,
  visiting_hours text,
  created_at timestamptz not null default now()
);

create table public.dogs (
  id uuid primary key default gen_random_uuid(),
  shelter_id uuid not null references public.shelters (id) on delete restrict,
  name text not null,
  sex public.dog_sex not null default 'unknown',
  size public.dog_size not null,
  color text,
  -- Stored instead of age so ages never go stale.
  estimated_birth_date date not null,
  neutered boolean not null default false,
  vaccinated boolean not null default false,
  -- null = unknown
  good_with_kids boolean,
  good_with_dogs boolean,
  good_with_cats boolean,
  energy_level smallint check (energy_level between 1 and 3),
  health_notes text,
  description text,
  microchip_number text unique,
  capture_district text,
  status public.dog_status not null default 'available',
  status_changed_at timestamptz not null default now(),
  last_verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dog_photos (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dogs (id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  shelter_id uuid references public.shelters (id) on delete set null,
  role public.staff_role not null default 'staff',
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.status_history (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dogs (id) on delete cascade,
  old_status public.dog_status,
  new_status public.dog_status not null,
  changed_by uuid references auth.users (id) on delete set null,
  changed_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index shelters_city_idx on public.shelters (city);

create index dogs_status_idx on public.dogs (status);
create index dogs_size_idx on public.dogs (size);
create index dogs_sex_idx on public.dogs (sex);
create index dogs_shelter_id_idx on public.dogs (shelter_id);
create index dogs_estimated_birth_date_idx on public.dogs (estimated_birth_date);
create index dogs_created_at_idx on public.dogs (created_at desc);

create index dog_photos_dog_id_sort_order_idx on public.dog_photos (dog_id, sort_order);

create index status_history_dog_id_idx on public.status_history (dog_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger dogs_set_updated_at
before update on public.dogs
for each row execute function public.set_updated_at();

create function public.set_dog_status_changed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at := now();
  end if;
  return new;
end;
$$;

create trigger dogs_set_status_changed_at
before update of status on public.dogs
for each row execute function public.set_dog_status_changed_at();

-- Security definer so the audit row is written even though no role has
-- insert rights on status_history.
create function public.log_dog_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.status_history (dog_id, old_status, new_status, changed_by)
    values (
      new.id,
      case when tg_op = 'UPDATE' then old.status end,
      new.status,
      auth.uid()
    );
  end if;
  return null;
end;
$$;

create trigger dogs_log_status_change
after insert or update of status on public.dogs
for each row execute function public.log_dog_status_change();

-- Trigger functions must not be callable through the API.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.set_dog_status_changed_at() from public, anon, authenticated;
revoke execute on function public.log_dog_status_change() from public, anon, authenticated;
