-- Staff accounts: profile details, automatic profile creation on sign-up, and
-- helper functions used by RLS policies.

-- ---------------------------------------------------------------------------
-- Profile details
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column full_name text not null check (length(trim(full_name)) between 1 and 200),
  add column phone text check (length(phone) <= 40);

-- ---------------------------------------------------------------------------
-- Private schema: not exposed through the Data API, so these functions can't be
-- called directly as RPCs. Policies still call them as the requesting role.
-- ---------------------------------------------------------------------------

create schema private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- Shelter of the calling user, only once their account is approved.
-- Security definer so policies on profiles don't recurse.
create function private.current_shelter_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select shelter_id
  from public.profiles
  where user_id = auth.uid()
    and approved
$$;

create function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select approved and role = 'platform_admin'
      from public.profiles
      where user_id = auth.uid()
    ),
    false
  )
$$;

revoke execute on function private.current_shelter_id() from public;
revoke execute on function private.is_platform_admin() from public;
grant execute on function private.current_shelter_id() to authenticated;
grant execute on function private.is_platform_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Create a profile for every new auth user.
-- Sign-up metadata is controlled by the user, so role and approval are always
-- forced here; only name, phone and the requested shelter are taken from it.
-- ---------------------------------------------------------------------------

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  requested_shelter uuid;
begin
  begin
    requested_shelter := nullif(meta ->> 'shelter_id', '')::uuid;
  exception when invalid_text_representation then
    requested_shelter := null;
  end;

  if requested_shelter is not null
     and not exists (select 1 from public.shelters where id = requested_shelter) then
    requested_shelter := null;
  end if;

  insert into public.profiles (user_id, full_name, phone, shelter_id, role, approved)
  values (
    new.id,
    -- Users created in the dashboard have no metadata: fall back to the email.
    left(coalesce(nullif(trim(meta ->> 'full_name'), ''), new.email, 'İsimsiz'), 200),
    left(nullif(trim(meta ->> 'phone'), ''), 40),
    requested_shelter,
    'staff',
    false
  );

  return new;
end;
$$;

revoke execute on function private.handle_new_user() from public;
-- Supabase Auth inserts into auth.users as supabase_auth_admin, which fires this trigger.
grant usage on schema private to supabase_auth_admin;
grant execute on function private.handle_new_user() to supabase_auth_admin;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();
