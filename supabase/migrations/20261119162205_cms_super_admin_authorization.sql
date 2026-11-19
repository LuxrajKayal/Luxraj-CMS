begin;

create table public.cms_user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null
    constraint cms_user_roles_supported_role check (role = 'super_admin')
    constraint cms_user_roles_single_super_admin unique
);

alter table public.cms_user_roles enable row level security;

revoke all on table public.cms_user_roles from public, anon, authenticated, service_role;
grant select on table public.cms_user_roles to authenticated, service_role;

create policy "Users can read their own CMS role"
  on public.cms_user_roles
  for select
  to authenticated
  using (user_id = (select auth.uid()));

commit;
