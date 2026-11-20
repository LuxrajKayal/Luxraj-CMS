begin;

create table public.cms_workspace_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  repository_id bigint not null check (repository_id > 0),
  branch text check (length(branch) between 1 and 1024)
);

alter table public.cms_workspace_preferences enable row level security;
revoke all on table public.cms_workspace_preferences from public, anon, authenticated, service_role;
grant select, insert, update on table public.cms_workspace_preferences to service_role;

commit;
