-- Run as a database owner against an isolated, migrated database.
begin;

insert into auth.users (id) values
  ('17000000-0000-4000-8000-000000000001'),
  ('17000000-0000-4000-8000-000000000002'),
  ('17000000-0000-4000-8000-000000000003'),
  ('17000000-0000-4000-8000-000000000004');
insert into public.cms_user_roles (user_id,role) values ('17000000-0000-4000-8000-000000000001','super_admin');

set local role authenticated;
do $$
begin
  begin
    perform from public.cms_member_files;
    raise exception 'browser can read private work';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.cms_submit_task(null,null,null);
    raise exception 'browser can use service-only submission RPC';
  exception when insufficient_privilege then null;
  end;
end;
$$;
set local role service_role;

do $$
declare
  administrator constant uuid := '17000000-0000-4000-8000-000000000001';
  author constant uuid := '17000000-0000-4000-8000-000000000002';
  developer constant uuid := '17000000-0000-4000-8000-000000000003';
  advisor constant uuid := '17000000-0000-4000-8000-000000000004';
  assigned constant uuid := '17100000-0000-4000-8000-000000000001';
  other_app constant uuid := '17100000-0000-4000-8000-000000000002';
  draft constant uuid := '17200000-0000-4000-8000-000000000001';
  profile_file constant uuid := '17200000-0000-4000-8000-000000000002';
  reviewed constant uuid := '17300000-0000-4000-8000-000000000001';
  rejected_review constant uuid := '17300000-0000-4000-8000-000000000002';
  draft_revision constant uuid := '17400000-0000-4000-8000-000000000001';
  task_key constant text := 'TSK-25-11-2026-16-33';
  old_sha constant text := repeat('a',40);
  confirmed_sha constant text := repeat('b',40);
  old_url constant text := 'https://example.test/pictures/previous.webp';
  filename text := author::text || '-' || profile_file::text || '.webp';
  new_url text := 'https://example.test/pictures/' || filename;
  prev_submission uuid;
  next_submission uuid;
begin
  insert into public.cms_members (user_id,role,full_name,birth_date,gender,qualifications,description,approved_picture_url)
    values (author,'author','Fixture Author','1999-01-01','Unspecified','Testing','',old_url),
      (developer,'developer','Fixture Developer','1999-01-01','Unspecified','Testing','',null),
      (advisor,'advisor','Fixture Advisor','1999-01-01','Unspecified','Testing','',null);
  insert into public.cms_member_apps (id,user_id,repository_id,branch,name,application)
    values (assigned,author,7,'test','Tool One','tool.html'), (other_app,developer,7,'test','Tool Two','tool.html');
  insert into public.cms_tasks (id,user_id,task_type,description) values (task_key,author,'Fixture','Test the task link');
  begin
    insert into public.cms_tasks (id,user_id,task_type,description) values (task_key,developer,'Fixture','Duplicate');
    raise exception 'duplicate Task ID accepted';
  exception when unique_violation then null;
  end;
  if public.cms_save_member_file(author,assigned,draft,'fixture.bin','','AP8=',repeat('c',64)) <> draft then
    raise exception 'private draft insert failed';
  end if;
  perform public.cms_save_member_file(author,assigned,draft,'fixture.bin','','AP8=',repeat('c',64));
  if public.cms_read_member_file(developer,draft,'work') is not null or
     public.cms_read_member_file(author,draft,'work')->>'contents' <> 'AP8=' then
    raise exception 'private file ownership or byte round trip failed';
  end if;
  begin
    perform public.cms_submit_task(developer,task_key,array[draft]);
    raise exception 'foreign task accepted';
  exception when raise_exception then
    if sqlerrm <> 'task_unavailable' then raise; end if;
  end;
  prev_submission := public.cms_submit_task(author,task_key,array[draft]);
  if not exists (select from public.cms_tasks where id = task_key and status = 'submitted' and submission_id = prev_submission) then
    raise exception 'task submission did not update its status';
  end if;
  update public.cms_tasks set status = 'returned' where id = task_key;
  next_submission := public.cms_submit_task(author,task_key,array[draft]);
  if prev_submission = next_submission or (select count(*) from public.cms_task_submissions where task_id = task_key and not seen) <> 2 then
    raise exception 'resubmission lost its history or notifications';
  end if;
  delete from public.cms_member_apps where id = assigned;
  begin
    perform public.cms_save_member_file(author,assigned,gen_random_uuid(),'revoked.bin','','AA==',repeat('d',64));
    raise exception 'revocation did not block new draft';
  exception when raise_exception then
    if sqlerrm <> 'assignment_revoked' then raise; end if;
  end;
  if public.cms_read_member_file(author,draft,'work') is null then raise exception 'revocation deleted private work'; end if;
  perform public.cms_save_member_file(author,null,profile_file,'profile.webp','image/webp',
    encode(convert_to(repeat('x',15000),'UTF8'),'base64'),repeat('e',64));
  if not exists (select from public.cms_members where user_id = author and pending_picture = profile_file and approved_picture_url = old_url) then
    raise exception 'pending picture replaced the active picture prematurely';
  end if;
  insert into public.cms_profile_picture_location (repository_id,branch,folder,public_prefix)
    values (7,'test','pictures','https://example.test/pictures/')
    on conflict (singleton) do update set repository_id=excluded.repository_id,branch=excluded.branch,
      folder=excluded.folder,public_prefix=excluded.public_prefix;
  insert into public.cms_change_set_files (user_id,repository_id,branch,path,original_commit,original_blob,
    original_source,proposed_source,revision,submission_id)
    values (administrator,7,'test','fixture.txt',old_sha,old_sha,'old','new',draft_revision,next_submission);
  insert into public.cms_commit_reviews (id,user_id,repository_id,repository,branch,head,message,files,
    claimed,task_links,picture_links)
    values (reviewed,administrator,7,'owner/fixture','test',old_sha,'[' || task_key || '] Fixture',
      jsonb_build_array(jsonb_build_object('path','fixture.txt','revision',draft_revision),
        jsonb_build_object('path','pictures/' || filename,'revision',gen_random_uuid())),
      true, jsonb_build_array(jsonb_build_object('task',task_key,'submission',next_submission)),
      jsonb_build_array(jsonb_build_object('picture',profile_file,'url',new_url))),
    (rejected_review,administrator,7,'owner/fixture','test',old_sha,'Old submission',
      jsonb_build_array(jsonb_build_object('path','fixture.txt','revision',draft_revision)),
      true, jsonb_build_array(jsonb_build_object('task',task_key,'submission',prev_submission)), '[]');
  begin
    perform public.cms_claim_linked_review(rejected_review,administrator);
    raise exception 'stale submission accepted for publishing';
  exception when raise_exception then
    if sqlerrm <> 'task_review_stale' then raise; end if;
  end;
  perform public.cms_claim_linked_review(reviewed,administrator);
  if not exists (select from public.cms_tasks where id = task_key and status = 'submitted' and active_review = reviewed) then
    raise exception 'review bypassed status lifecycle';
  end if;
  begin
    perform public.cms_disable_member(author);
    raise exception 'deletion can race a claimed review';
  exception when raise_exception then
    if sqlerrm <> 'review_in_progress' then raise; end if;
  end;
  perform public.cms_release_linked_review(reviewed,administrator);
  if not exists (select from public.cms_tasks where id = task_key and status = 'submitted' and active_review is null) then
    raise exception 'failed commit completed task or left it locked';
  end if;
  perform public.cms_claim_linked_review(reviewed,administrator);
  if public.cms_record_linked_commit(reviewed,administrator,confirmed_sha) <> 1 or
     public.cms_record_linked_commit(reviewed,administrator,confirmed_sha) <> 1 then
    raise exception 'receipt did not retain the exact revision or was not idempotent';
  end if;
  if not exists (select from public.cms_tasks where id = task_key and status = 'completed' and commit_sha = confirmed_sha) or
     not exists (select from public.cms_members where user_id = author and pending_picture is null
       and picture_state = 'published' and approved_picture_url = new_url) then
    raise exception 'verified commit did not complete task and activate new profile picture';
  end if;
  update public.cms_tasks set status = 'terminated' where id = task_key;
  perform public.cms_reset_website_preferences(administrator,true);
  if not exists (select from public.cms_tasks where id = task_key and status = 'terminated' and commit_sha = confirmed_sha) or
     not exists (select from public.cms_members where user_id = author and approved_picture_url = new_url) or
     public.cms_read_member_file(author,draft,'work') is null then
    raise exception 'termination or Settings cleanup deleted member records or verified association';
  end if;
end;
$$;

reset role;
delete from auth.users where id = '17000000-0000-4000-8000-000000000002';
do $$
begin
  if exists (select from public.cms_tasks where id = 'TSK-25-11-2026-16-33') or
     exists (select from public.cms_member_files where user_id = '17000000-0000-4000-8000-000000000002') then
    raise exception 'explicit account deletion left private data';
  end if;
end;
$$;
rollback;
