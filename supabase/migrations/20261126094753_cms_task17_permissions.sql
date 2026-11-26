begin;

create table public.cms_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('author', 'developer', 'advisor')),
  full_name text not null check (char_length(full_name) between 1 and 150),
  birth_date date not null,
  gender text not null check (char_length(gender) between 1 and 100),
  qualifications text not null check (char_length(qualifications) between 1 and 2000),
  description text not null check (char_length(description) <= 4000),
  picture_state text not null default 'unset' check (picture_state in ('unset', 'pending', 'returned', 'published')),
  pending_picture uuid,
  approved_picture_url text,
  picture_comment text not null default '',
  picture_review uuid,
  disabled boolean not null default false
);

create table public.cms_member_apps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.cms_members(user_id) on delete cascade,
  repository_id bigint not null check (repository_id > 0),
  branch text not null check (char_length(branch) between 1 and 1024),
  name text not null check (char_length(name) between 1 and 100),
  application text not null check (application ~* '\.html$'),
  inputs text[] not null default '{}',
  unique(user_id, repository_id, branch, application)
);

-- Member work has no Git destination. Bytes stay private and separate from publishable drafts.
create table public.cms_member_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.cms_members(user_id) on delete cascade,
  application_id uuid,
  kind text not null check (kind in ('work', 'picture')),
  name text not null check (char_length(name) between 1 and 255),
  mime text not null check (char_length(mime) <= 128),
  bytes bytea not null check (octet_length(bytes) <= 8388608),
  digest text not null check (digest ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique(user_id,id),
  check ((kind = 'work' and application_id is not null) or
    (kind = 'picture' and application_id is null and mime = 'image/webp' and octet_length(bytes) between 15000 and 150000))
);
create index cms_member_files_owner on public.cms_member_files (user_id, kind, created_at desc);
create unique index cms_members_pending_picture on public.cms_members (pending_picture) where pending_picture is not null;
alter table public.cms_members add constraint cms_member_picture_owner
  foreign key (user_id,pending_picture) references public.cms_member_files(user_id,id)
  deferrable initially deferred;

create table public.cms_tasks (
  id text primary key check (id ~ '^TSK-[0-9]{2}-[0-9]{2}-[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  user_id uuid not null references public.cms_members(user_id) on delete cascade,
  task_type text not null check (char_length(task_type) between 1 and 150),
  description text not null check (char_length(description) between 1 and 4000),
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'submitted', 'returned', 'rejected', 'terminated', 'completed')),
  comment text not null default '',
  submission_id uuid,
  active_review uuid,
  commit_sha text check (commit_sha ~ '^[0-9a-f]{40}$'),
  commit_repository text,
  commit_branch text,
  unique(user_id,id),
  check ((status <> 'completed' or commit_sha is not null) and (commit_sha is null or status in ('completed','terminated')))
);
create index cms_tasks_member on public.cms_tasks (user_id, created_at desc);

-- Immutable submissions also supply the Admin's Task 17 notification list.
create table public.cms_task_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  task_id text not null,
  role text not null check (role in ('author', 'developer', 'advisor')),
  full_name text not null,
  created_at timestamptz not null default now(),
  seen boolean not null default false,
  foreign key (user_id,task_id) references public.cms_tasks(user_id,id) on delete cascade,
  unique(task_id,id),
  unique(user_id,id)
);
create index cms_task_submissions_unseen on public.cms_task_submissions (created_at desc) where not seen;
alter table public.cms_tasks add constraint cms_task_current_submission
  foreign key (id,submission_id) references public.cms_task_submissions(task_id,id)
  deferrable initially deferred;

create table public.cms_task_submission_files (
  user_id uuid not null,
  submission_id uuid not null,
  file_id uuid not null,
  primary key (submission_id,file_id),
  foreign key (user_id,submission_id) references public.cms_task_submissions(user_id,id) on delete cascade,
  foreign key (user_id,file_id) references public.cms_member_files(user_id,id) on delete cascade
);

-- Retain the provenance of archived drafts even when their source is explicitly deleted.
alter table public.cms_change_set_files add column submission_id uuid;
alter table public.cms_change_set_files add column picture_id uuid;
alter table public.cms_change_set_files add column picture_url text;
alter table public.cms_change_set_files add constraint cms_draft_task_picture_exclusion
  check (submission_id is null or picture_id is null);
create index cms_draft_submission on public.cms_change_set_files (submission_id) where submission_id is not null;
create index cms_draft_picture on public.cms_change_set_files (picture_id) where picture_id is not null;

alter table public.cms_commit_reviews add column task_links jsonb not null default '[]';
alter table public.cms_commit_reviews add column picture_links jsonb not null default '[]';
alter table public.cms_commit_reviews add column claimed_at timestamptz;

alter table public.cms_members enable row level security;
alter table public.cms_member_apps enable row level security;
alter table public.cms_member_files enable row level security;
alter table public.cms_tasks enable row level security;
alter table public.cms_task_submissions enable row level security;
alter table public.cms_task_submission_files enable row level security;
revoke all on public.cms_members, public.cms_member_apps, public.cms_member_files, public.cms_tasks,
  public.cms_task_submissions, public.cms_task_submission_files from public, anon, authenticated, service_role;
grant select,insert,update,delete on public.cms_members, public.cms_member_apps to service_role;
grant select,insert,delete on public.cms_member_files to service_role;
grant select,insert,update on public.cms_tasks, public.cms_task_submissions to service_role;
grant select,insert on public.cms_task_submission_files to service_role;
grant update (claimed_at) on public.cms_commit_reviews to service_role;

create or replace view public.cms_draft_catalog with (security_invoker = true) as
  select draft.user_id, draft.repository_id, draft.branch, draft.path, draft.revision, draft.updated_at,
    octet_length(draft.original_source) + octet_length(draft.proposed_source) as content_bytes,
    draft.committed_sha is null and (draft.original_source <> draft.proposed_source or coalesce(draft.file_state = 'saved', false))
      and (draft.file_state is null or draft.file_state = 'saved') as pending,
    draft.committed_sha, draft.file_size, draft.file_state, submission.task_id
  from public.cms_change_set_files draft
  left join public.cms_task_submissions submission on submission.id = draft.submission_id;

create function public.cms_member_file_budget() returns trigger
language plpgsql security invoker set search_path = ''
as $$
declare cap bigint; used bigint;
begin
  select database_limit_mb::bigint * 1000000 into strict cap
    from public.cms_storage_policy where singleton for update;
  used := pg_database_size(current_database());
  if used + octet_length(new.bytes) + 65536 > cap then
    raise exception 'member_storage_limit';
  end if;
  return new;
end;
$$;
create trigger cms_member_files_budget before insert on public.cms_member_files
  for each row execute function public.cms_member_file_budget();

create function public.cms_save_member_file(actor uuid, app uuid, file uuid, file_name text,
  content_type text, payload text, checksum text) returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare member public.cms_members;
begin
  select * into member from public.cms_members where user_id = actor and not disabled for update;
  if not found then raise exception 'member_forbidden'; end if;
  if app is not null then
    perform from public.cms_member_apps where id = app and user_id = actor for share;
    if not found then raise exception 'assignment_revoked'; end if;
  elsif member.picture_review is not null then
    raise exception 'review_in_progress';
  end if;
  insert into public.cms_member_files (id,user_id,application_id,kind,name,mime,bytes,digest)
    values (file,actor,app,case when app is null then 'picture' else 'work' end,file_name,content_type,decode(payload,'base64'),checksum)
    on conflict (id) do nothing;
  if not found then
    if exists (select from public.cms_member_files f where f.id = file and f.user_id = actor
      and f.application_id is not distinct from app and f.digest = checksum and f.name = file_name and f.mime = content_type)
      then return file; end if;
    raise exception 'member_file_conflict';
  end if;
  if app is null then
    update public.cms_members set pending_picture = file, picture_state = 'pending', picture_comment = '' where user_id = actor;
    if member.pending_picture is not null then
      delete from public.cms_member_files where id = member.pending_picture and user_id = actor;
    end if;
  end if;
  return file;
end;
$$;

create function public.cms_submit_task(actor uuid, task_key text, file_ids uuid[]) returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare member public.cms_members; task public.cms_tasks; submission uuid;
begin
  select * into member from public.cms_members where user_id = actor and not disabled for share;
  if not found then raise exception 'member_forbidden'; end if;
  select * into task from public.cms_tasks where id = task_key and user_id = actor for update;
  if not found or task.status not in ('pending','returned') then raise exception 'task_unavailable'; end if;
  if cardinality(file_ids) is null or cardinality(file_ids) = 0 or
    cardinality(file_ids) <> (select count(*) from public.cms_member_files f where f.id = any(file_ids)
      and f.user_id = actor and f.kind = 'work') then raise exception 'task_files_invalid'; end if;
  perform from public.cms_member_apps a where a.user_id = actor for share;
  if not found then raise exception 'assignment_revoked'; end if;
  insert into public.cms_task_submissions (user_id,task_id,role,full_name)
    values (actor,task_key,member.role,member.full_name) returning id into submission;
  insert into public.cms_task_submission_files (user_id,submission_id,file_id)
    select actor,submission,unnest(file_ids);
  update public.cms_tasks set status = 'submitted', submission_id = submission, comment = '' where id = task_key;
  return submission;
end;
$$;

create function public.cms_disable_member(target uuid) returns void
language plpgsql security invoker set search_path = ''
as $$
declare member public.cms_members;
begin
  select * into member from public.cms_members where user_id = target for update;
  if not found then return; end if;
  if member.picture_review is not null or exists (
    select from public.cms_tasks where user_id = target and active_review is not null
  ) then raise exception 'review_in_progress'; end if;
  update public.cms_members set disabled = true where user_id = target;
end;
$$;

create function public.cms_read_member_file(owner_id uuid, file_id uuid, file_kind text) returns jsonb
language sql stable security invoker set search_path = ''
as $$
  select jsonb_build_object('id',f.id,'name',f.name,'mime',f.mime,'sha256',f.digest,
    'size',octet_length(f.bytes),'contents',replace(encode(f.bytes,'base64'),chr(10),''))
  from public.cms_member_files f where f.id = file_id and f.user_id = owner_id and f.kind = file_kind
$$;

revoke all on function public.cms_member_file_budget(), public.cms_save_member_file(uuid,uuid,uuid,text,text,text,text),
  public.cms_submit_task(uuid,text,uuid[]), public.cms_disable_member(uuid),
  public.cms_read_member_file(uuid,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.cms_member_file_budget(), public.cms_save_member_file(uuid,uuid,uuid,text,text,text,text),
  public.cms_submit_task(uuid,text,uuid[]), public.cms_disable_member(uuid), public.cms_read_member_file(uuid,uuid,text) to service_role;

create function public.cms_claim_linked_review(review_key uuid, actor uuid) returns void
language plpgsql security invoker set search_path = ''
as $$
declare review public.cms_commit_reviews; link record; owner uuid; filename text;
begin
  update public.cms_commit_reviews set claimed = true, claimed_at = clock_timestamp()
    where id = review_key and user_id = actor and claimed and claimed_at is null and commit_sha is null and expires_at > now()
    returning * into review;
  if not found then raise exception 'review_expired'; end if;
  for link in select * from jsonb_to_recordset(review.task_links) as item(task text, submission uuid) order by task loop
    perform from public.cms_members where user_id = (
      select user_id from public.cms_tasks where id = link.task
    ) and not disabled for share;
    if not found then raise exception 'task_review_stale'; end if;
    update public.cms_tasks set active_review = review_key
      where id = link.task and submission_id = link.submission and status in ('submitted','completed') and active_review is null;
    if not found then raise exception 'task_review_stale'; end if;
  end loop;
  for link in select * from jsonb_to_recordset(review.picture_links) as item(picture uuid, url text) order by picture loop
    update public.cms_members set picture_review = review_key
      where pending_picture = link.picture and picture_state = 'pending' and picture_review is null and not disabled
      returning user_id into owner;
    if not found then raise exception 'picture_review_stale'; end if;
    filename := owner::text || '-' || link.picture::text || '.webp';
    if not exists (
      select from public.cms_profile_picture_location loc, jsonb_array_elements(review.files) file
        where loc.singleton and loc.repository_id = review.repository_id and loc.branch = review.branch
          and loc.public_prefix || filename = link.url and file->>'path' = loc.folder || '/' || filename
    ) then raise exception 'picture_review_stale'; end if;
  end loop;
end;
$$;

create function public.cms_release_linked_review(review_key uuid, actor uuid) returns void
language plpgsql security invoker set search_path = ''
as $$
begin
  update public.cms_commit_reviews set claimed_at = null
    where id = review_key and user_id = actor and claimed and claimed_at is not null and commit_sha is null;
  if not found then return; end if;
  update public.cms_tasks set active_review = null where active_review = review_key;
  update public.cms_members set picture_review = null where picture_review = review_key;
end;
$$;

create function public.cms_record_linked_commit(review_key uuid, actor uuid, github_sha text) returns integer
language plpgsql security invoker set search_path = ''
as $$
declare review public.cms_commit_reviews; link record; archived integer;
begin
  select * into review from public.cms_commit_reviews where id = review_key and user_id = actor and claimed for update;
  if not found or review.claimed_at is null then raise exception 'review_expired'; end if;
  archived := public.cms_record_commit(review_key,actor,github_sha);
  if review.commit_sha is not null then return archived; end if;
  for link in select * from jsonb_to_recordset(review.task_links) as item(task text, submission uuid) loop
    update public.cms_tasks set status = 'completed', active_review = null, commit_sha = coalesce(commit_sha,github_sha),
      commit_repository = coalesce(commit_repository,review.repository), commit_branch = coalesce(commit_branch,review.branch)
      where id = link.task and submission_id = link.submission and active_review = review_key and status in ('submitted','completed');
    if not found then raise exception 'task_review_stale'; end if;
  end loop;
  for link in select * from jsonb_to_recordset(review.picture_links) as item(picture uuid, url text) loop
    update public.cms_members set picture_state = 'published', approved_picture_url = link.url,
      pending_picture = null, picture_review = null, picture_comment = ''
      where pending_picture = link.picture and picture_review = review_key and not disabled;
    if not found then raise exception 'picture_review_stale'; end if;
    delete from public.cms_member_files where id = link.picture and kind = 'picture';
  end loop;
  return archived;
end;
$$;

revoke all on function public.cms_claim_linked_review(uuid,uuid), public.cms_release_linked_review(uuid,uuid),
  public.cms_record_linked_commit(uuid,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.cms_claim_linked_review(uuid,uuid), public.cms_release_linked_review(uuid,uuid),
  public.cms_record_linked_commit(uuid,uuid,text) to service_role;

commit;
