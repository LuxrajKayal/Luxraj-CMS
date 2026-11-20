begin;

alter table public.cms_change_set_files
  add column committed_sha text check (committed_sha ~ '^[0-9a-f]{40}$'),
  drop constraint cms_change_set_files_pkey,
  add primary key (revision);

create unique index cms_active_draft_scope on public.cms_change_set_files (user_id, repository_id, branch, path)
  where committed_sha is null;
create index cms_draft_catalog_scope on public.cms_change_set_files (user_id, repository_id, branch, path);
grant update (committed_sha) on public.cms_change_set_files to service_role;

create or replace view public.cms_draft_catalog with (security_invoker = true) as
  select user_id, repository_id, branch, path, revision, updated_at,
    octet_length(original_source) + octet_length(proposed_source) as content_bytes,
    committed_sha is null and original_source <> proposed_source as pending,
    committed_sha
  from public.cms_change_set_files;

create table public.cms_commit_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  repository_id bigint not null check (repository_id > 0),
  repository text not null,
  branch text not null,
  head text not null check (head ~ '^[0-9a-f]{40}$'),
  message text not null check (length(message) between 1 and 1000),
  files jsonb not null check (jsonb_typeof(files) = 'array' and jsonb_array_length(files) between 1 and 20),
  expires_at timestamptz not null default now() + interval '10 minutes',
  claimed boolean not null default false,
  commit_sha text check (commit_sha ~ '^[0-9a-f]{40}$')
);
alter table public.cms_commit_reviews enable row level security;
revoke all on table public.cms_commit_reviews from public, anon, authenticated, service_role;
grant select, insert, update (claimed, commit_sha) on public.cms_commit_reviews to service_role;

create function public.cms_record_commit(review_id uuid, actor_id uuid, github_sha text) returns integer
language plpgsql security invoker set search_path = ''
as $$
declare review public.cms_commit_reviews;
declare count_archived integer;
begin
  if github_sha !~ '^[0-9a-f]{40}$' then
    raise exception 'invalid_commit_sha';
  end if;

  -- Serialize retries and refuse to assign a different SHA to an already
  -- recorded review. A lost RPC response must not strand committed drafts.
  select * into review from public.cms_commit_reviews
    where id = review_id and user_id = actor_id and claimed
    for update;
  if not found then raise exception 'review_not_found'; end if;
  if review.commit_sha is not null and review.commit_sha <> github_sha then
    raise exception 'review_commit_mismatch';
  end if;
  if review.commit_sha is null then
    update public.cms_commit_reviews set commit_sha = github_sha where id = review_id;
  end if;

  update public.cms_change_set_files as draft set committed_sha = github_sha
    from jsonb_to_recordset(review.files) as file(path text, revision uuid)
    where draft.user_id = review.user_id and draft.repository_id = review.repository_id
      and draft.branch = review.branch and draft.path = file.path and draft.revision = file.revision
      and draft.committed_sha is null;

  -- Return a stable total on repeat attempts, not just rows updated by this call.
  select count(*) into count_archived
    from public.cms_change_set_files as draft
    join jsonb_to_recordset(review.files) as file(path text, revision uuid)
      on draft.path = file.path and draft.revision = file.revision
    where draft.user_id = review.user_id and draft.repository_id = review.repository_id
      and draft.branch = review.branch and draft.committed_sha = github_sha;
  return count_archived;
end;
$$;
revoke all on function public.cms_record_commit(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.cms_record_commit(uuid, uuid, text) to service_role;

commit;
