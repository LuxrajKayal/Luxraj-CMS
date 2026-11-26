begin;
alter table public.cms_tasks add column force_completed_at timestamptz, add column force_completed_by uuid, add column force_completion_reason text;
alter table public.cms_tasks drop constraint cms_tasks_check;
alter table public.cms_tasks add constraint cms_tasks_completion_check check (
 (status <> 'completed' or commit_sha is not null or force_completed_at is not null)
 and (commit_sha is null or status in ('completed','terminated'))
 and ((force_completed_at is null and force_completed_by is null and force_completion_reason is null)
 or (force_completed_at is not null and force_completed_by is not null and force_completion_reason is not null
 and char_length(btrim(force_completion_reason)) between 1 and 2000 and status in ('completed','terminated')))
);
alter table public.cms_change_set_files drop constraint cms_change_set_files_check;
alter table public.cms_change_set_files add constraint cms_change_set_files_origin_check check
 (draft_origin is null or (draft_origin in ('website_control','member_submission') and storage_key is not null));
create function public.cms_force_complete_task(actor uuid, task_key text, expected_status text, expected_submission uuid, reason text)
returns void language plpgsql security invoker set search_path='' as $$
begin
 if not exists(select 1 from public.cms_user_roles where user_id=actor and role='super_admin') then raise exception 'member_forbidden'; end if;
 if reason is null or char_length(btrim(reason)) not between 1 and 2000 then raise exception 'force_reason_required'; end if;
 update public.cms_tasks set status='completed',force_completed_at=now(),force_completed_by=actor,force_completion_reason=btrim(reason)
 where id=task_key and status=expected_status and submission_id is not distinct from expected_submission
 and status in ('pending','working','finished','submitted','returned','rejected') and active_review is null and commit_sha is null;
 if not found then raise exception 'task_review_stale';end if;
end $$;
revoke all on function public.cms_force_complete_task(uuid,text,text,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.cms_force_complete_task(uuid,text,text,uuid,text) to service_role;
commit;
