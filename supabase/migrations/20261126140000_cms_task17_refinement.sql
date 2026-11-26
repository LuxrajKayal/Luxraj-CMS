begin;
alter table public.cms_members add column onboarding_completed boolean not null default false;
alter table public.cms_tasks drop constraint cms_tasks_status_check;
alter table public.cms_tasks add constraint cms_tasks_status_check check (status in ('pending','working','finished','submitted','returned','rejected','terminated','completed'));
create table public.cms_task_drafts (
  user_id uuid not null, task_id text not null, file_id uuid not null,
  primary key(task_id,file_id),
  foreign key(user_id,task_id) references public.cms_tasks(user_id,id) on delete cascade,
  foreign key(user_id,file_id) references public.cms_member_files(user_id,id) on delete restrict
);
create index cms_task_drafts_file on public.cms_task_drafts(file_id);
alter table public.cms_task_drafts enable row level security;
revoke all on public.cms_task_drafts from public, anon, authenticated, service_role;
grant select,insert,delete on public.cms_task_drafts to service_role;
-- Existing submitted/returned work can be resumed using its current immutable submission.
insert into public.cms_task_drafts(user_id,task_id,file_id)
select t.user_id,t.id,f.file_id from public.cms_tasks t join public.cms_task_submission_files f on f.submission_id=t.submission_id
on conflict do nothing;

create function public.cms_member_task_progress(actor uuid, task_key text, next_status text, file_ids uuid[]) returns void
language plpgsql security invoker set search_path = '' as $$
declare task public.cms_tasks;
begin
  perform from public.cms_members where user_id=actor and not disabled for update;
  if not found then raise exception 'member_forbidden'; end if;
  select * into task from public.cms_tasks where id=task_key and user_id=actor for update;
  if not found or task.active_review is not null or task.status not in ('pending','working','finished','returned')
    or next_status not in ('working','finished') then raise exception 'task_unavailable'; end if;
  if next_status='finished' and coalesce(cardinality(file_ids),0)=0 then raise exception 'task_files_invalid'; end if;
  if file_ids is null or cardinality(file_ids) <> (select count(*) from public.cms_member_files where user_id=actor and kind='work' and id=any(file_ids))
    then raise exception 'task_files_invalid'; end if;
  if next_status='finished' then
    perform from public.cms_member_apps where user_id=actor for share;
    if not found then raise exception 'assignment_revoked'; end if;
  end if;
  delete from public.cms_task_drafts where task_id=task_key;
  insert into public.cms_task_drafts(user_id,task_id,file_id) select actor,task_key,unnest(file_ids);
  update public.cms_tasks set status=next_status where id=task_key;
end $$;

create function public.cms_delete_terminated_task(task_key text) returns void
language plpgsql security invoker set search_path = '' as $$
declare task public.cms_tasks;
begin
  select * into task from public.cms_tasks where id=task_key for update;
  if not found or task.status <> 'terminated' or task.active_review is not null then raise exception 'task_unavailable'; end if;
  if exists (select 1 from public.cms_change_set_files d join public.cms_task_submissions s on s.id=d.submission_id
    where s.task_id=task_key and d.committed_sha is null and (d.file_state is null or d.file_state='saved'))
  then raise exception 'task_has_publish_drafts'; end if;
  delete from public.cms_tasks where id=task_key;
end $$;

create function public.cms_delete_private_work(actor uuid, file_key uuid) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  perform from public.cms_members where user_id=actor and not disabled for update;
  if not found then raise exception 'member_forbidden'; end if;
  if exists (select 1 from public.cms_task_drafts where user_id=actor and file_id=file_key)
     or exists (select 1 from public.cms_task_submission_files where user_id=actor and file_id=file_key)
  then raise exception 'member_file_linked'; end if;
  delete from public.cms_member_files where user_id=actor and id=file_key and kind='work';
  if not found then raise exception 'member_forbidden'; end if;
end $$;
grant delete on public.cms_tasks to service_role;
revoke all on function public.cms_member_task_progress(uuid,text,text,uuid[]), public.cms_delete_terminated_task(text), public.cms_delete_private_work(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.cms_member_task_progress(uuid,text,text,uuid[]), public.cms_delete_terminated_task(text), public.cms_delete_private_work(uuid,uuid) to service_role;

create or replace function public.cms_submit_task(actor uuid, task_key text, file_ids uuid[]) returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare member public.cms_members; task public.cms_tasks; submission uuid;
begin
  select * into member from public.cms_members where user_id = actor and not disabled for share;
  if not found then raise exception 'member_forbidden'; end if;
  select * into task from public.cms_tasks where id = task_key and user_id = actor for update;
  if not found or task.status not in ('pending','returned','working','finished') then raise exception 'task_unavailable'; end if;
  if cardinality(file_ids) is null or cardinality(file_ids) = 0 or
    cardinality(file_ids) <> (select count(*) from public.cms_member_files f where f.id = any(file_ids)
      and f.user_id = actor and f.kind = 'work') then raise exception 'task_files_invalid'; end if;
  if task.status in ('working','finished') and (
    task.status <> 'finished' or
    exists (select 1 from unnest(file_ids) f(id) where not exists
      (select 1 from public.cms_task_drafts d where d.task_id=task_key and d.file_id=f.id)) or
    cardinality(file_ids) <> (select count(*) from public.cms_task_drafts where task_id=task_key)
  ) then raise exception 'task_files_invalid'; end if;
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


commit;
