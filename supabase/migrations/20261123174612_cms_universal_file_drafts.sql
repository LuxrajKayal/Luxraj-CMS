begin;

insert into storage.buckets (id, name, public, file_size_limit)
values ('cms-file-drafts', 'cms-file-drafts', false, 8388608);

-- Deny direct browser access even if a wider Storage policy is added elsewhere.
create policy cms_file_drafts_service_only on storage.objects as restrictive
  for all to anon, authenticated
  using (bucket_id <> 'cms-file-drafts') with check (bucket_id <> 'cms-file-drafts');

alter table public.cms_change_set_files
  alter column original_blob drop not null,
  add column storage_key text unique,
  add column file_size integer check (file_size between 0 and 8388608),
  add column file_digest text check (file_digest ~ '^[a-f0-9]{64}$'),
  add column mime_hint text check (length(mime_hint) <= 128),
  add column file_state text check (file_state in ('uploading', 'saved', 'deleting')),
  add constraint cms_file_draft_metadata check (
    (storage_key is null and original_blob is not null and file_size is null
      and file_digest is null and mime_hint is null and file_state is null)
    or (storage_key is not null and file_size is not null and file_digest is not null
      and mime_hint is not null and file_state is not null
      and storage_key = user_id::text || '/' || revision::text
      and original_source = '' and proposed_source = '')
  );
grant update (file_state) on public.cms_change_set_files to service_role;
create unique index cms_pending_file_path_case
  on public.cms_change_set_files (user_id, repository_id, branch, lower(normalize(path, NFC)))
  where storage_key is not null and committed_sha is null;

create or replace view public.cms_draft_catalog with (security_invoker = true) as
  select user_id, repository_id, branch, path, revision, updated_at,
    octet_length(original_source) + octet_length(proposed_source) as content_bytes,
    committed_sha is null and (original_source <> proposed_source or coalesce(file_state = 'saved', false))
      and (file_state is null or file_state = 'saved') as pending,
    committed_sha, file_size, file_state
  from public.cms_change_set_files;

create function public.cms_reserve_file_draft() returns trigger
language plpgsql security invoker set search_path = ''
as $$
declare used_bytes bigint; reserved_bytes bigint; limit_bytes bigint;
begin
  if new.storage_key is null then return new; end if;
  select file_limit_mb::bigint * 1000000 into strict limit_bytes
    from public.cms_storage_policy where singleton for update;
  used_bytes := public.cms_storage_object_bytes();
  if used_bytes is null then raise exception 'file_usage_unavailable'; end if;
  select coalesce(sum(draft.file_size), 0) into reserved_bytes
    from public.cms_change_set_files draft
    where draft.file_state = 'uploading' and not exists (
      select from storage.objects obj where obj.bucket_id = 'cms-file-drafts' and obj.name = draft.storage_key
    );
  if used_bytes + reserved_bytes + new.file_size > limit_bytes then
    raise exception using message = 'file_limit', detail =
      jsonb_build_object('usedBytes', used_bytes + reserved_bytes, 'limitBytes', limit_bytes)::text;
  end if;
  return new;
end;
$$;
revoke all on function public.cms_reserve_file_draft() from public, anon, authenticated, service_role;
grant execute on function public.cms_reserve_file_draft() to service_role;
create trigger cms_file_draft_budget before insert on public.cms_change_set_files
  for each row when (new.storage_key is not null) execute function public.cms_reserve_file_draft();

create table public.cms_profile_picture_location (
  singleton boolean primary key default true check (singleton),
  repository_id bigint not null check (repository_id > 0),
  branch text not null check (length(branch) between 1 and 1024),
  folder text not null check (length(folder) between 1 and 1024),
  public_prefix text not null check (length(public_prefix) between 1 and 2048)
);
alter table public.cms_profile_picture_location enable row level security;
revoke all on public.cms_profile_picture_location from public, anon, authenticated, service_role;
grant select, insert, update on public.cms_profile_picture_location to service_role;

commit;
