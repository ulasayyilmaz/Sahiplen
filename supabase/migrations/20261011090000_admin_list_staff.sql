-- Staff list for the admin page, including the email address and whether it
-- has been confirmed. Emails live in auth.users, which the Data API can't read,
-- so this security definer function exposes them to the platform admin only.

create function public.admin_list_staff()
returns table (
  user_id uuid,
  full_name text,
  phone text,
  email text,
  email_confirmed boolean,
  role public.staff_role,
  approved boolean,
  shelter_id uuid,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_platform_admin() then
    raise exception 'Only the platform admin can list staff' using errcode = '42501';
  end if;

  return query
    select
      p.user_id,
      p.full_name,
      p.phone,
      u.email::text,
      u.email_confirmed_at is not null,
      p.role,
      p.approved,
      p.shelter_id,
      p.created_at
    from public.profiles p
    join auth.users u on u.id = p.user_id
    order by p.created_at desc;
end;
$$;

revoke execute on function public.admin_list_staff() from public, anon;
grant execute on function public.admin_list_staff() to authenticated;
