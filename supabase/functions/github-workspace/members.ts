import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.119.2';
import { memberRoles, pictureFilename, type Assignment, type MemberFields, type MemberOutput, type MemberProfile, type MemberRequest } from '../_shared/member-contracts.ts';
import { filePath, decodeBytes, sha256 } from '../_shared/file-bytes.ts';
import { positiveId } from '../github-connection/github.ts';
import { isBranch, isCommit, WorkspaceError, type WorkspaceGit } from './git.ts';
import { validateFile } from './file-drafts.ts';

const profiles = 'cms_members';
const assignments = 'cms_member_apps';
const tasks = 'cms_tasks';
const submissions = 'cms_task_submissions';
const files = 'cms_member_files';
const profileFields = 'user_id,full_name,birth_date,gender,qualifications,role,description,picture_state,pending_picture,approved_picture_url,picture_comment,picture_review,disabled,onboarding_completed';
const assigneeFields = 'id,name,repository_id,branch,application,inputs';
const fileFields = 'id,name,mime,created_at';
const taskFields = 'id,user_id,task_type,description,status,comment,submission_id,created_at,active_review,commit_sha,commit_repository,commit_branch';
const uuid = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
const taskIdPattern = /^TSK-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}$/;
const knownErrors = new Set(['member_forbidden', 'assignment_revoked', 'member_storage_limit', 'task_unavailable',
  'task_files_invalid', 'member_file_conflict', 'review_in_progress', 'task_has_publish_drafts', 'member_file_linked']);
const bad = () => new WorkspaceError('member_invalid', 400);
const missing = () => new WorkspaceError('member_unavailable', 404);
const validId = (value: unknown): value is string => typeof value === 'string' && uuid.test(value);
const validPath = (value: unknown): value is string => typeof value === 'string' && !!value && filePath(value.split('/'));

export type MemberDependencies = {
  isAdmin(id: string): Promise<boolean>;
  openGit(): Promise<{
    repositories: WorkspaceGit['repositories'];
    forRepository(id: number): Promise<WorkspaceGit>;
    checkConnection(): Promise<void>;
  }>;
  stagePicture(body: Record<string, unknown>, id: string): Promise<object | undefined>;
  pictureLocation(): Promise<{ repositoryId: number; branch: string; folder: string; publicPrefix: string } | null>;
};

function value<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error && knownErrors.has(result.error.message)) {
    throw new WorkspaceError(result.error.message, result.error.message === 'member_forbidden' || result.error.message === 'assignment_revoked' ? 403 : 409);
  }
  if (result.error) throw result.error;
  return result.data;
}

function field(input: unknown, max: number, required = true) {
  if (typeof input !== 'string' || input.length > max || input.includes('\0') || (required && !input.trim())) throw bad();
  return input.trim();
}

export function taskId(at: Date, timeZone: string) {
  if (typeof timeZone !== 'string' || timeZone.length > 100) throw bad();
  try {
    const fields = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(at).map(part => [part.type, part.value]));
    return ['TSK', fields.day, fields.month, fields.year, fields.hour, fields.minute].join('-');
  } catch { throw bad(); }
}

export function memberFields(input?: MemberFields) {
  if (!input || !memberRoles.includes(input.role)) throw bad();
  const birth = field(input.birth_date, 10);
  const date = new Date(birth + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth) || !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== birth || date.getTime() > Date.now()) throw bad();
  const email = field(input.email, 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw bad();
  return {
    email, role: input.role, birth_date: birth, full_name: field(input.full_name, 150), gender: field(input.gender, 100),
    qualifications: field(input.qualifications, 2000), description: field(input.description, 4000, false),
  };
}

async function paginate<T>(load: (first: number, last: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 200) {
    const batch = value(await load(offset, offset + 199)) ?? [];
    rows.push(...batch);
    if (batch.length < 200) return rows;
  }
}

export function createMembers(client: SupabaseClient) {
  async function profile(userId: string): Promise<MemberProfile | null> {
    return value(await client.from(profiles).select(profileFields).eq('user_id', userId).maybeSingle());
  }
  async function requireMember(userId: string) {
    const member = await profile(userId);
    if (!member || member.disabled) throw new WorkspaceError('member_forbidden', 403);
    return member;
  }
  async function assignment(userId: string, id: string): Promise<Assignment> {
    if (!validId(id)) throw bad();
    const row = value(await client.from(assignments).select(assigneeFields).eq('user_id', userId).eq('id', id).maybeSingle());
    if (!row) throw new WorkspaceError('assignment_revoked', 403);
    return row;
  }
  async function repository(repositoryId: number, deps: MemberDependencies) {
    const remote = await deps.openGit();
    const repo = (await remote.repositories()).find(item => item.id === repositoryId);
    if (!repo) throw new WorkspaceError('repository_out_of_scope', 403);
    const git = await remote.forRepository(repositoryId);
    return { remote, repo, git };
  }
  async function readFile(userId: string, id: string, kind: 'picture' | 'work'): Promise<MemberOutput> {
    const row = value(await client.rpc('cms_read_member_file', { owner_id: userId, file_id: id, file_kind: kind })) as MemberOutput | null;
    if (!row || row.contents === null) throw missing();
    const bytes = decodeBytes(row.contents);
    if (bytes.length !== row.size || await sha256(bytes) !== row.sha256) throw new WorkspaceError('file_integrity', 409);
    return row;
  }
  async function pendingPicture(userId: string, pictureId: string) {
    if (!validId(userId) || !validId(pictureId)) throw bad();
    const member = await requireMember(userId);
    if (member.pending_picture !== pictureId || member.picture_state !== 'pending') throw new WorkspaceError('picture_review_stale', 409);
    return readFile(userId, pictureId, 'picture');
  }
  async function validateSubmission(id: string, allowCompleted = false) {
    if (!validId(id)) throw bad();
    const query = client.from(tasks).select('id').eq('submission_id', id).is('active_review', null);
    if (allowCompleted) query.in('status', ['submitted', 'completed']);
    else query.eq('status', 'submitted');
    const row = value(await query.maybeSingle());
    if (!row) throw new WorkspaceError('task_review_stale', 409);
    return row.id as string;
  }
  async function member(body: MemberRequest, actor: string, deps: MemberDependencies) {
    const account = await requireMember(actor);
    switch (body.action) {
      case 'member_context': return { profile: account };
      case 'member_onboard':
        value(await client.from(profiles).update({ onboarding_completed: true }).eq('user_id', actor).eq('disabled', false));
        return { saved: true };
      case 'member_progress':
        if (!taskIdPattern.test(body.taskId) || !['working','finished'].includes(body.status) ||
            !Array.isArray(body.files) || !body.files.every(validId)) throw bad();
        value(await client.rpc('cms_member_task_progress', { actor, task_key: body.taskId, next_status: body.status, file_ids: body.files, append_links: body.append === true }));
        return { saved: true };
      case 'member_read_draft':
        if (!validId(body.fileId)) throw bad();
        return { file: await readFile(actor, body.fileId, 'work') };
      case 'member_delete_draft':
        if (!validId(body.fileId)) throw bad();
        value(await client.rpc('cms_delete_private_work', { actor, file_key: body.fileId }));
        return { deleted: true };
      case 'member_home': {
        const section = body.section;
        const tasksNeeded = !section || ['dashboard','tasks','workstation'].includes(section);
        const draftsNeeded = !section || ['tasks','workstation','drafts'].includes(section);
        const [apps, work, drafts, links, stats] = await Promise.all([
          paginate((a, b) => client.from(assignments).select('id,name').eq('user_id', actor).order('id').range(a, b)),
          section==='dashboard' ? client.from(tasks).select(taskFields).eq('user_id',actor).order('created_at',{ascending:false}).limit(5).then(value) :
          tasksNeeded ? paginate((a,b)=>{const query=client.from(tasks).select(taskFields).eq('user_id',actor).order('created_at',{ascending:false});if(section==='workstation')query.in('status',['pending','working','returned']);return query.range(a,b);}) : Promise.resolve([]),
          draftsNeeded ? paginate((a, b) => client.from(files).select(fileFields).eq('user_id', actor).eq('kind', 'work').order('created_at', { ascending: false }).order('id').range(a, b)) : Promise.resolve([]),
          (!section||['tasks','drafts','workstation'].includes(section)) ? paginate((a,b)=>client.from('cms_task_drafts').select('task_id,file_id').eq('user_id',actor).order('task_id').order('file_id').range(a,b)) : Promise.resolve([]),
          section==='dashboard'||section==='drafts' ? client.rpc('cms_member_work_stats',{actor}).then(value) : Promise.resolve({}),
        ]);
        return { profile: account, apps, tasks: work ?? [], drafts, links, ...stats };
      }
      case 'member_launch':
      case 'member_input': {
        const app = await assignment(actor, body.appId);
        const path = body.action === 'member_launch' ? app.application : body.path;
        if (!validPath(path) || (body.action === 'member_input' && (!app.inputs.includes(path) || !isCommit(body.commit)))) {
          throw new WorkspaceError('member_file_forbidden', 403);
        }
        const { remote, repo, git } = await repository(app.repository_id, deps);
        const commit = body.action === 'member_launch' ? await git.requireBranch(repo, app.branch) : body.commit;
        const file = await git.websiteFile(repo, app.branch, path.split('/'), commit, true);
        await remote.checkConnection();
        await requireMember(actor);
        await assignment(actor, app.id);
        if (!file || file.contents === null) throw new WorkspaceError('website_file_too_large', 422);
        if (body.action === 'member_input') return { file };
        try {
          return { commit, source: new TextDecoder('utf-8', { fatal: true }).decode(decodeBytes(file.contents)),
            control: { id: app.id, name: app.name, application: app.application, inputs: app.inputs, destinations: [] } };
        } catch { throw new WorkspaceError('website_application_encoding', 422); }
      }
      case 'member_save': {
        if (!body.file || !validId(body.file.id) || (body.appId !== null && !validId(body.appId)) ||
            !filePath([body.file.name])) throw bad();
        const payload = await validateFile(body.file, body.appId === null);
        const id = value(await client.rpc('cms_save_member_file', {
          actor, app: body.appId, file: body.file.id, file_name: body.file.name, content_type: payload.mime,
          payload: body.file.contents, checksum: payload.sha256,
        }));
        return { id };
      }
      case 'member_draft_input': {
        if (!validId(body.fileId)) throw bad();
        await assignment(actor, body.appId);
        const file = await readFile(actor, body.fileId, 'work');
        await requireMember(actor);
        await assignment(actor, body.appId);
        return { file };
      }
      case 'member_submit': {
        if (!taskIdPattern.test(body.taskId) || !Array.isArray(body.files) || !body.files.length || !body.files.every(validId)) throw bad();
        return { id: value(await client.rpc('cms_submit_task', { actor, task_key: body.taskId, file_ids: body.files })) };
      }
    }
  }
  async function admin(body: MemberRequest, actor: string, deps: MemberDependencies) {
    switch (body.action) {
      case 'people_list': {
        const rows = await paginate((a, b) => client.from(profiles).select(profileFields).order('user_id').range(a, b));
        const registered = new Map((rows as MemberProfile[]).map(row => [row.user_id, row]));
        const admins = new Set((await paginate((a,b)=>client.from('cms_user_roles').select('user_id').eq('role','super_admin').order('user_id').range(a,b))).map(row=>row.user_id));
        const accounts = [];
        for (let page = 1; ; page++) {
          const { data, error } = await client.auth.admin.listUsers({ page, perPage: 200 });
          if (error) throw error;
          const { users, nextPage } = data;
          for (const user of users) {
            if (user.id !== actor && !user.is_anonymous && user.email && !admins.has(user.id)) {
              accounts.push({ id: user.id, email: user.email, profile: registered.get(user.id) ?? null });
            }
          }
          if (!nextPage || nextPage <= page) break;
        }
        const search=typeof body.search==='string'?body.search.slice(0,254).toLowerCase():'';
        const role=body.role??'';
        const filtered=accounts.filter(a=>(!role||(a.profile?.role??'unmanaged')===role)&&((a.profile?.full_name??'')+' '+a.email).toLowerCase().includes(search));
        if(body.page!==undefined){if(!Number.isSafeInteger(body.page)||body.page<0||body.page>100000)throw bad();return {accounts:filtered.slice(body.page*12,body.page*12+12),total:filtered.length};}
        return { accounts:filtered,total:filtered.length };
      }
      case 'people_save': {
        const { email, ...fields } = memberFields(body.fields);
        if (body.id !== undefined) {
          if (!validId(body.id) || body.id === actor || await deps.isAdmin(body.id)) throw bad();
          const { data, error } = await client.auth.admin.getUserById(body.id);
          if (error) throw missing();
          const { user } = data;
          if (!user || user.is_anonymous || (await profile(user.id))?.disabled) throw missing();
          if (email !== user.email) {
            const result = await client.auth.admin.updateUserById(body.id, { email, email_confirm: true });
            if (result.error) throw new WorkspaceError('member_account_update', 409);
          }
          const result = await client.from(profiles).upsert({ user_id: user.id, ...fields });
          if (result.error) {
            if (email !== user.email && user.email) await client.auth.admin.updateUserById(body.id, { email: user.email, email_confirm: true });
            throw result.error;
          }
          return { id: user.id };
        }
        const password = body.password;
        if (typeof password !== 'string' || password.length < 8 || password.length > 256) throw new WorkspaceError('member_password', 400);
        const { data, error } = await client.auth.admin.createUser({ email, password, email_confirm: true });
        if (error || !data.user) throw new WorkspaceError('member_account_create', 409);
        const saved = await client.from(profiles).insert({ user_id: data.user.id, ...fields });
        if (saved.error) {
          const rollback = await client.auth.admin.deleteUser(data.user.id);
          if (rollback.error) throw new WorkspaceError('member_account_partial', 503);
          throw saved.error;
        }
        return { id: data.user.id };
      }
      case 'people_delete': {
        if (!validId(body.id) || body.id === actor || await deps.isAdmin(body.id)) throw bad();
        value(await client.rpc('cms_disable_member', { target: body.id }));
        const result = await client.auth.admin.deleteUser(body.id);
        if (result.error && result.error.status !== 404) throw new WorkspaceError('member_delete_failed', 503);
        return { deleted: true };
      }
      case 'people_apps':
        if (!validId(body.userId)) throw bad();
        return { apps: await paginate((a, b) => client.from(assignments).select(assigneeFields).eq('user_id', body.userId).order('id').range(a, b)) };
      case 'people_assign': {
        if (!validId(body.userId) || (body.id !== undefined && !validId(body.id)) ||
            !positiveId(body.repositoryId) || !isBranch(body.branch) || !validPath(body.application) ||
            !/\.html$/i.test(body.application) || !Array.isArray(body.inputs) || !body.inputs.every(validPath)) throw bad();
        const name = field(body.name, 100);
        await requireMember(body.userId);
        const { remote, repo, git } = await repository(body.repositoryId, deps);
        const commit = await git.requireBranch(repo, body.branch);
        for (const path of new Set([body.application, ...body.inputs])) await git.websiteFile(repo, body.branch, path.split('/'), commit, false);
        await remote.checkConnection();
        if (!await deps.isAdmin(actor)) throw new WorkspaceError('forbidden', 403);
        await requireMember(body.userId);
        // Reassignment rotates the ID to revoke already open application runs.
        const record = { id: crypto.randomUUID(), user_id: body.userId,
          repository_id: body.repositoryId, branch: body.branch, application: body.application, name, inputs: [...new Set(body.inputs)],
        };
        const table = client.from(assignments);
        const result = await (body.id ? table.update(record).eq('user_id', body.userId).eq('id', body.id)
          : table.insert(record)).select('id').maybeSingle();
        if (result.error?.code === '23505') throw new WorkspaceError('assignment_exists', 409);
        const saved = value(result);
        if (!saved) throw new WorkspaceError('assignment_revoked', 409);
        return saved;
      }
      case 'people_unassign':
        if (!validId(body.id) || !validId(body.userId)) throw bad();
        if (!value(await client.from(assignments).delete().eq('user_id', body.userId).eq('id', body.id).select('id').maybeSingle())) {
          throw new WorkspaceError('assignment_revoked', 409);
        }
        return { deleted: true };
      case 'people_delete_task':
        if (!taskIdPattern.test(body.taskId)) throw bad();
        value(await client.rpc('cms_delete_terminated_task', { task_key: body.taskId }));
        return { deleted: true };
      case 'people_review_counts': {
        const [work,pictures,unread,latest] = await Promise.all([
          client.from(tasks).select('id',{count:'exact',head:true}).eq('status','submitted'),
          client.from(profiles).select('user_id',{count:'exact',head:true}).eq('picture_state','pending').eq('disabled',false),
          client.from(submissions).select('id',{count:'exact',head:true}).eq('seen',false),
          client.from(tasks).select('submission_id').eq('status','submitted').order('created_at',{ascending:false}).limit(1),
        ]);
        if(work.error||pictures.error||unread.error||latest.error)throw new Error('Review counts unavailable');
        return {pendingTasks:work.count??0,pendingProfiles:pictures.count??0,unread:unread.count??0,latestSubmission:latest.data?.[0]?.submission_id};
      }
      case 'people_tasks': {
        if(body.mode!==undefined){
          if(!['manage','terminated','review','history'].includes(body.mode)||!Number.isSafeInteger(body.page??0)||(body.page??0)<0||(body.page??0)>100000)throw bad();
          return value(await client.rpc('cms_admin_task_page',{view_mode:body.mode,search_text:typeof body.search==='string'?body.search.slice(0,254):'',status_filter:typeof body.status==='string'?body.status:'',page_offset:(body.page??0)*12,page_limit:12}));
        }
        const [work, notices] = await Promise.all([
          paginate((a, b) => client.from(tasks).select(taskFields).order('created_at', { ascending: false }).range(a, b)),
          paginate((a, b) => client.from(submissions).select(
            'id,task_id,user_id,role,full_name,created_at,seen,cms_task_submission_files(cms_member_files(id,name,mime,created_at))',
          ).order('created_at', { ascending: false }).order('id').range(a, b)),
        ]);
        return { tasks: work, submissions: notices.map(({ cms_task_submission_files, ...notice }) => ({
          ...notice, files: cms_task_submission_files.map((entry: { cms_member_files: unknown }) => entry.cms_member_files),
        })) };
      }
      case 'people_add_task': {
        if (!validId(body.userId)) throw bad();
        await requireMember(body.userId);
        const id = taskId(new Date(), body.timeZone);
        const response = await client.from(tasks).insert({ id, user_id: body.userId, task_type: field(body.type, 150), description: field(body.description, 4000) });
        if (response.error?.code === '23505') throw new WorkspaceError('duplicate_task_id', 409);
        value(response);
        return { id };
      }
      case 'people_decide': {
        if (!taskIdPattern.test(body.taskId) || !['rejected','returned','terminated'].includes(body.decision) ||
            (body.submissionId !== null && !validId(body.submissionId))) throw bad();
        const next = client.from(tasks).update({ status: body.decision, comment: field(body.comment, 2000, body.decision !== 'terminated') })
          .eq('id', body.taskId).is('active_review', null);
        if (body.submissionId) next.eq('submission_id', body.submissionId);
        else next.is('submission_id', null);
        if (body.decision === 'terminated') next.not('status', 'in', '(terminated,completed)');
        else next.eq('status', 'submitted');
        if (!value(await next.select('id').maybeSingle())) throw new WorkspaceError('task_review_stale', 409);
        return { saved: true };
      }
      case 'people_notice_count': {
        const result = await client.from(submissions).select('id', { count: 'exact', head: true }).eq('seen', false);
        if (result.error) throw result.error;
        return { count: result.count ?? 0 };
      }
      case 'people_seen':
        if (!validId(body.id)) throw bad();
        value(await client.from(submissions).update({ seen: true }).eq('id', body.id));
        return { saved: true };
      case 'people_submission_file': {
        if (!validId(body.submissionId) || !validId(body.fileId)) throw bad();
        const task = await validateSubmission(body.submissionId);
        const row = value(await client.from('cms_task_submission_files').select('user_id').eq('submission_id', body.submissionId)
          .eq('file_id', body.fileId).maybeSingle());
        if (!row) throw missing();
        return { taskId: task, file: await readFile(row.user_id, body.fileId, 'work') };
      }
      case 'people_picture':
        return { file: await pendingPicture(body.userId, body.pictureId) };
      case 'people_return_picture': {
        if (!validId(body.userId) || !validId(body.pictureId)) throw bad();
        const changed = value(await client.from(profiles).update({ picture_state: 'returned', picture_comment: field(body.comment, 2000) })
          .eq('user_id', body.userId).eq('pending_picture', body.pictureId).eq('picture_state', 'pending')
          .is('picture_review', null).select('user_id').maybeSingle());
        if (!changed) throw new WorkspaceError('picture_review_stale', 409);
        return { saved: true };
      }
      case 'people_stage_picture': {
        const file = await pendingPicture(body.userId, body.pictureId);
        const location = await deps.pictureLocation();
        if (!location) throw new WorkspaceError('invalid_profile_destination', 422);
        const { repositoryId, branch, folder } = location;
        const { repo, git } = await repository(repositoryId, deps);
        const commit = await git.requireBranch(repo, branch);
        return await deps.stagePicture({ action: 'profile_picture_stage', repositoryId, branch, commit, originalBlob: null,
          path: [...folder.split('/'), pictureFilename(body.userId, body.pictureId)],
          ...file, pictureActor: body.userId, pictureId: body.pictureId,
        }, actor);
      }
    }
  }
  return { member, admin, pendingPicture, validateSubmission };
}
