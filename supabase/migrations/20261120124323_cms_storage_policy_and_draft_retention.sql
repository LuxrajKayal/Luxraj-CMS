begin;

alter table public.cms_change_set_files
  drop constraint cms_change_set_files_check,
  drop constraint cms_change_set_files_user_id_fkey,
  add constraint cms_change_set_files_user_id_fkey foreign key (user_id)
    references auth.users (id) on delete restrict;

create view public.cms_draft_catalog with (security_invoker = true) as
  select user_id, repository_id, branch, path, revision, updated_at,
    octet_length(original_source) + octet_length(proposed_source) as content_bytes,
    original_source <> proposed_source as pending
  from public.cms_change_set_files;

revoke all on public.cms_draft_catalog from public, anon, authenticated, service_role;
grant select on public.cms_draft_catalog to service_role;

create table public.cms_storage_policy (
  singleton boolean primary key default true check (singleton),
  database_limit_mb integer not null default 350 check (database_limit_mb between 1 and 450),
  file_limit_mb integer not null default 700 check (file_limit_mb between 1 and 900)
);

insert into public.cms_storage_policy default values;
alter table public.cms_storage_policy enable row level security;
revoke all on public.cms_storage_policy from public, anon, authenticated, service_role;
grant select, update (database_limit_mb, file_limit_mb) on public.cms_storage_policy to service_role;

create function public.cms_storage_object_bytes() returns bigint
language plpgsql stable security invoker set search_path = ''
as $$
declare bytes bigint;
begin
  select case when count(*) = count(size_bytes) then coalesce(sum(size_bytes), 0) end
    into bytes
    from (
      select case when metadata->>'size' ~ '^[0-9]{1,18}$'
        then (metadata->>'size')::bigint end as size_bytes
      from storage.objects
    ) as sizes;
  return bytes;
exception when undefined_table or insufficient_privilege then
  return null;
end;
$$;

create function public.cms_storage_usage() returns jsonb
language sql stable security invoker set search_path = ''
as $$
  select jsonb_build_object(
    'databaseBytes', pg_database_size(current_database()),
    'databaseLimitMb', database_limit_mb,
    'databaseCeilingMb', 450,
    'fileBytes', public.cms_storage_object_bytes(),
    'fileLimitMb', file_limit_mb,
    'fileCeilingMb', 900,
    'draftTableBytes', pg_total_relation_size('public.cms_change_set_files'::regclass),
    'draftContentBytes', (select coalesce(sum(content_bytes), 0) from public.cms_draft_catalog)
  )
  from public.cms_storage_policy where singleton;
$$;

create function public.cms_enforce_draft_budget() returns trigger
language plpgsql security invoker set search_path = ''
as $$
declare
  current_bytes bigint;
  limit_bytes bigint;
  estimated_write bigint;
begin
  if tg_op = 'UPDATE' then
    if octet_length(new.proposed_source) < octet_length(old.proposed_source) then return new; end if;
    if new.proposed_source = old.proposed_source then return new; end if;
  end if;

  select database_limit_mb::bigint * 1000000 into strict limit_bytes
    from public.cms_storage_policy where singleton for update;
  current_bytes := pg_database_size(current_database());
  -- Budget the full new text plus room for tuple, index and page overhead.
  estimated_write := 65536 + octet_length(new.proposed_source);
  if tg_op = 'INSERT' then estimated_write := estimated_write + octet_length(new.original_source); end if;
  if current_bytes + estimated_write > limit_bytes then
    raise exception using message = 'database_limit', detail =
      jsonb_build_object('usedBytes', current_bytes, 'limitBytes', limit_bytes)::text;
  end if;
  return new;
end;
$$;

create trigger cms_draft_budget before insert or update on public.cms_change_set_files
  for each row execute function public.cms_enforce_draft_budget();

-- Future upload handlers can use this preflight. There is no CMS upload path yet.
create function public.cms_require_upload_budget(additional_bytes bigint) returns void
language plpgsql security invoker set search_path = ''
as $$
declare
  used_bytes bigint;
  limit_bytes bigint;
begin
  if additional_bytes is null or additional_bytes < 0 then raise exception 'invalid_upload_size'; end if;
  select file_limit_mb::bigint * 1000000 into strict limit_bytes
    from public.cms_storage_policy where singleton for update;
  used_bytes := public.cms_storage_object_bytes();
  if used_bytes is null then raise exception 'file_usage_unavailable'; end if;
  if additional_bytes > 0 and used_bytes::numeric + additional_bytes > limit_bytes then
    raise exception using message = 'file_limit', detail =
      jsonb_build_object('usedBytes', used_bytes, 'limitBytes', limit_bytes)::text;
  end if;
end;
$$;

revoke all on function public.cms_storage_object_bytes(), public.cms_storage_usage(),
  public.cms_enforce_draft_budget(), public.cms_require_upload_budget(bigint)
  from public, anon, authenticated, service_role;
grant execute on function public.cms_storage_object_bytes(), public.cms_storage_usage(),
  public.cms_require_upload_budget(bigint) to service_role;

commit;
