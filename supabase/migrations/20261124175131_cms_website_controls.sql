begin;

create table public.cms_website_controls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  repository_id bigint not null check (repository_id > 0),
  branch text not null check (char_length(branch) between 1 and 1024),
  name text not null check (char_length(name) between 1 and 100),
  application text not null check (char_length(application) between 1 and 1024 and application ~* '\.html$'),
  inputs text[] not null default '{}',
  destinations text[] not null default '{}'
);
create index cms_website_controls_scope on public.cms_website_controls (user_id, repository_id, branch, id);
alter table public.cms_website_controls enable row level security;
revoke all on public.cms_website_controls from public, anon, authenticated, service_role;
grant select, insert, delete on public.cms_website_controls to service_role;

alter table public.cms_change_set_files add column draft_origin text
  check (draft_origin is null or (draft_origin = 'website_control' and storage_key is not null));
create index cms_change_set_owner_revision on public.cms_change_set_files (user_id, revision);

grant delete on public.cms_workspace_preferences, public.cms_profile_picture_location to service_role;
create function public.cms_reset_website_preferences(actor uuid, full_reset boolean) returns void
language plpgsql security invoker set search_path = ''
as $$
begin
  if not exists (select from public.cms_user_roles where user_id = actor and role = 'super_admin') then
    raise insufficient_privilege;
  end if;
  delete from public.cms_website_controls where user_id = actor;
  if full_reset then
    delete from public.cms_workspace_preferences where user_id = actor;
    delete from public.cms_profile_picture_location where singleton;
    update public.cms_storage_policy set database_limit_mb = default, file_limit_mb = default,
      maximum_files_per_commit = default where singleton;
  end if;
end;
$$;
revoke all on function public.cms_reset_website_preferences(uuid, boolean) from public, anon, authenticated, service_role;
grant execute on function public.cms_reset_website_preferences(uuid, boolean) to service_role;

commit;
