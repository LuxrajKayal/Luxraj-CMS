begin;

create table public.cms_github_connection (
  singleton boolean primary key default true check (singleton),
  revision uuid not null default gen_random_uuid(),
  status text not null default 'disconnected'
    check (status in ('disconnected', 'connected', 'reconnect_required', 'revocation_pending')),
  installation_id bigint check (installation_id > 0),
  app_id bigint check (app_id > 0),
  owner_id bigint check (owner_id > 0),
  owner_login text,
  owner_type text check (owner_type in ('User', 'Organization')),
  repositories text[] not null default '{}',
  state_hash text check (state_hash ~ '^[0-9a-f]{64}$'),
  initiated_by uuid,
  initiator_session uuid,
  expires_at timestamptz,
  candidate_id bigint check (candidate_id > 0),
  check (
    (status = 'disconnected' and installation_id is null and app_id is null
      and owner_id is null and owner_login is null and owner_type is null)
    or
    (status <> 'disconnected' and installation_id is not null and app_id is not null
      and owner_id is not null and owner_login is not null and owner_type is not null)
  ),
  check (
    (state_hash is null and initiated_by is null and initiator_session is null
      and expires_at is null and candidate_id is null)
    or
    (state_hash is not null and initiated_by is not null and initiator_session is not null
      and expires_at is not null)
  )
);

insert into public.cms_github_connection default values;
alter table public.cms_github_connection enable row level security;
revoke all on table public.cms_github_connection from public, anon, authenticated, service_role;
grant select, update on table public.cms_github_connection to service_role;

commit;
