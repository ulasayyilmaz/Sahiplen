-- Write access for approved shelter staff and the platform admin.
--
-- Staff (approved, with a shelter) may:
--   * read, add and edit dogs of their own shelter (any status), never move them
--     to another shelter, never delete them (they change the status instead)
--   * add, reorder and delete photos of their shelter's dogs (max 3 per dog)
--   * read the status history of their shelter's dogs
--   * read and edit their own profile name/phone
-- The platform admin may additionally manage all dogs and shelters, read all
-- profiles, and approve/reject staff through the admin_* functions below.
-- Public (anon) access is unchanged.

-- ---------------------------------------------------------------------------
-- Grants (column lists keep system columns like created_at server-controlled)
-- ---------------------------------------------------------------------------

grant insert (
  shelter_id, name, sex, size, color, estimated_birth_date, neutered, vaccinated,
  good_with_kids, good_with_dogs, good_with_cats, energy_level, health_notes, description,
  microchip_number, capture_district, status, last_verified_at
) on public.dogs to authenticated;

grant update (
  name, sex, size, color, estimated_birth_date, neutered, vaccinated,
  good_with_kids, good_with_dogs, good_with_cats, energy_level, health_notes, description,
  microchip_number, capture_district, status, last_verified_at
) on public.dogs to authenticated;

grant delete on public.dogs to authenticated;

grant insert (dog_id, url, sort_order) on public.dog_photos to authenticated;
grant update (sort_order) on public.dog_photos to authenticated;
grant delete on public.dog_photos to authenticated;

grant insert, update on public.shelters to authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

grant select on public.status_history to authenticated;

-- ---------------------------------------------------------------------------
-- dogs
-- ---------------------------------------------------------------------------

create policy "Staff read their shelter's dogs; admin reads all"
on public.dogs
for select
to authenticated
using (
  shelter_id = (select private.current_shelter_id())
  or (select private.is_platform_admin())
);

create policy "Staff add dogs to their shelter; admin anywhere"
on public.dogs
for insert
to authenticated
with check (
  shelter_id = (select private.current_shelter_id())
  or (select private.is_platform_admin())
);

create policy "Staff edit their shelter's dogs; admin all"
on public.dogs
for update
to authenticated
using (
  shelter_id = (select private.current_shelter_id())
  or (select private.is_platform_admin())
)
with check (
  shelter_id = (select private.current_shelter_id())
  or (select private.is_platform_admin())
);

create policy "Only the admin deletes dogs"
on public.dogs
for delete
to authenticated
using ((select private.is_platform_admin()));

-- ---------------------------------------------------------------------------
-- dog_photos
-- ---------------------------------------------------------------------------

create policy "Staff read photos of their shelter's dogs; admin all"
on public.dog_photos
for select
to authenticated
using (
  exists (
    select 1
    from public.dogs d
    where d.id = dog_photos.dog_id
      and (
        d.shelter_id = (select private.current_shelter_id())
        or (select private.is_platform_admin())
      )
  )
);

-- Uploaded photos must point into this dog's folder of the dog-photos bucket:
-- https://<project>.supabase.co/storage/v1/object/public/dog-photos/<shelter_id>/<dog_id>/<file>
create policy "Staff add photos to their shelter's dogs; admin all"
on public.dog_photos
for insert
to authenticated
with check (
  exists (
    select 1
    from public.dogs d
    where d.id = dog_photos.dog_id
      and (
        d.shelter_id = (select private.current_shelter_id())
        or (select private.is_platform_admin())
      )
      and dog_photos.url ~ '^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/dog-photos/'
      and dog_photos.url like
        '%/dog-photos/' || d.shelter_id::text || '/' || d.id::text || '/%'
  )
);

create policy "Staff reorder photos of their shelter's dogs; admin all"
on public.dog_photos
for update
to authenticated
using (
  exists (
    select 1
    from public.dogs d
    where d.id = dog_photos.dog_id
      and (
        d.shelter_id = (select private.current_shelter_id())
        or (select private.is_platform_admin())
      )
  )
);

create policy "Staff delete photos of their shelter's dogs; admin all"
on public.dog_photos
for delete
to authenticated
using (
  exists (
    select 1
    from public.dogs d
    where d.id = dog_photos.dog_id
      and (
        d.shelter_id = (select private.current_shelter_id())
        or (select private.is_platform_admin())
      )
  )
);

-- At most 3 photos per dog. Locks the dog row so concurrent uploads can't race.
create function private.enforce_dog_photo_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform 1 from public.dogs where id = new.dog_id for update;
  if (select count(*) from public.dog_photos where dog_id = new.dog_id) >= 3 then
    raise exception 'A dog can have at most 3 photos'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

revoke execute on function private.enforce_dog_photo_limit() from public;

create trigger dog_photos_enforce_limit
before insert on public.dog_photos
for each row execute function private.enforce_dog_photo_limit();

-- ---------------------------------------------------------------------------
-- status_history (rows are still written only by the status trigger)
-- ---------------------------------------------------------------------------

create policy "Staff read history of their shelter's dogs; admin all"
on public.status_history
for select
to authenticated
using (
  exists (
    select 1
    from public.dogs d
    where d.id = status_history.dog_id
      and (
        d.shelter_id = (select private.current_shelter_id())
        or (select private.is_platform_admin())
      )
  )
);

-- ---------------------------------------------------------------------------
-- shelters
-- ---------------------------------------------------------------------------

create policy "Only the admin adds shelters"
on public.shelters
for insert
to authenticated
with check ((select private.is_platform_admin()));

create policy "Only the admin edits shelters"
on public.shelters
for update
to authenticated
using ((select private.is_platform_admin()))
with check ((select private.is_platform_admin()));

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create policy "Users read their own profile; admin reads all"
on public.profiles
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_platform_admin())
);

-- Column grants limit this to full_name and phone.
create policy "Users edit their own profile details"
on public.profiles
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Admin functions (callable as RPCs; each checks the caller is the admin).
-- Approval, role and shelter changes happen only here.
-- ---------------------------------------------------------------------------

create function public.admin_set_staff(target_user uuid, set_approved boolean, set_shelter_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_platform_admin() then
    raise exception 'Only the platform admin can manage staff' using errcode = '42501';
  end if;
  if set_approved and set_shelter_id is null then
    raise exception 'Approved staff need a shelter' using errcode = 'check_violation';
  end if;

  update public.profiles
  set approved = set_approved,
      shelter_id = set_shelter_id
  where user_id = target_user
    and role <> 'platform_admin';

  if not found then
    raise exception 'Staff member not found' using errcode = 'no_data_found';
  end if;
end;
$$;

-- Rejecting deletes the account entirely; only for accounts never approved.
create function public.admin_reject_staff(target_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_platform_admin() then
    raise exception 'Only the platform admin can manage staff' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles
    where user_id = target_user and not approved and role <> 'platform_admin'
  ) then
    raise exception 'Only pending sign-ups can be rejected' using errcode = 'check_violation';
  end if;

  delete from auth.users where id = target_user;
end;
$$;

revoke execute on function public.admin_set_staff(uuid, boolean, uuid) from public, anon;
revoke execute on function public.admin_reject_staff(uuid) from public, anon;
grant execute on function public.admin_set_staff(uuid, boolean, uuid) to authenticated;
grant execute on function public.admin_reject_staff(uuid) to authenticated;
