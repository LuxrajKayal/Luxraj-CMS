begin;

alter table public.cms_storage_policy add column maximum_files_per_commit integer not null default 20
  check (maximum_files_per_commit between 1 and 100);
grant update (maximum_files_per_commit) on public.cms_storage_policy to service_role;

alter table public.cms_commit_reviews drop constraint cms_commit_reviews_files_check;
alter table public.cms_commit_reviews add constraint cms_commit_reviews_files_check
  check (jsonb_typeof(files) = 'array' and jsonb_array_length(files) between 1 and 100);

create table public.cms_code_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  kind text not null check (kind in ('html', 'script', 'css')),
  source text not null check (char_length(btrim(source)) > 0 and octet_length(source) <= 1048576)
);
create unique index cms_code_template_name on public.cms_code_templates (user_id, lower(name));

create table public.cms_code_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  template_ids uuid[] not null check (cardinality(template_ids) > 0 and array_position(template_ids, null) is null)
);
create unique index cms_code_group_name on public.cms_code_groups (user_id, lower(name));

alter table public.cms_code_templates enable row level security;
alter table public.cms_code_groups enable row level security;
revoke all on public.cms_code_templates, public.cms_code_groups from public, anon, authenticated, service_role;
grant select, insert on public.cms_code_templates, public.cms_code_groups to service_role;

create function public.cms_enforce_code_catalog_budget() returns trigger
language plpgsql security invoker set search_path = ''
as $$
declare
  used_bytes bigint;
  limit_bytes bigint;
begin
  select database_limit_mb::bigint * 1000000 into strict limit_bytes
    from public.cms_storage_policy where singleton for update;
  used_bytes := pg_database_size(current_database());
  if used_bytes + 65536 + octet_length(to_jsonb(new)::text) > limit_bytes then
    raise exception using message = 'database_limit', detail =
      jsonb_build_object('usedBytes', used_bytes, 'limitBytes', limit_bytes)::text;
  end if;
  return new;
end;
$$;
revoke all on function public.cms_enforce_code_catalog_budget() from public, anon, authenticated;
grant execute on function public.cms_enforce_code_catalog_budget() to service_role;

create trigger cms_template_budget before insert on public.cms_code_templates
  for each row execute function public.cms_enforce_code_catalog_budget();
create trigger cms_group_budget before insert on public.cms_code_groups
  for each row execute function public.cms_enforce_code_catalog_budget();

commit;
