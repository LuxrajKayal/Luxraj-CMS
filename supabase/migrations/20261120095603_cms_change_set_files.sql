begin;

-- One pending change set per user, repository and branch, with one row per file.
create table public.cms_change_set_files (
  user_id uuid not null references auth.users (id) on delete cascade,
  repository_id bigint not null check (repository_id > 0),
  branch text not null check (length(branch) between 1 and 1024),
  path text not null check (length(path) between 1 and 1024),
  original_commit text not null check (original_commit ~ '^[0-9a-f]{40}$'),
  original_blob text not null check (original_blob ~ '^[0-9a-f]{40}$'),
  original_source text not null check (octet_length(original_source) <= 1048576),
  proposed_source text not null check (octet_length(proposed_source) <= 1048576),
  revision uuid not null default gen_random_uuid(),
  updated_at timestamptz not null default now(),
  primary key (user_id, repository_id, branch, path),
  check (original_source <> proposed_source)
);

alter table public.cms_change_set_files enable row level security;
revoke all on table public.cms_change_set_files from public, anon, authenticated, service_role;
grant select, insert, delete on table public.cms_change_set_files to service_role;
grant update (proposed_source, revision, updated_at) on table public.cms_change_set_files to service_role;

commit;
