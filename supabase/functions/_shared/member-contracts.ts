import type { FilePayload, StoredFile, WebsiteLaunch } from './workspace-contracts.ts';

export const memberRoles = ['author', 'developer', 'advisor'] as const;
export type MemberRole = typeof memberRoles[number];
export type MemberProfile = {
  user_id: string; full_name: string; birth_date: string; gender: string; qualifications: string;
  role: MemberRole; description: string; picture_state: 'unset' | 'pending' | 'returned' | 'published';
  pending_picture: string | null; approved_picture_url: string | null; picture_comment: string; picture_review?: string | null; disabled: boolean; onboarding_completed?: boolean;
};
export type MemberAccount = { id: string; email: string; profile: MemberProfile | null };
export type MemberFields = Pick<MemberProfile, 'full_name' | 'birth_date' | 'gender' | 'qualifications' | 'role' | 'description'> & { email: string };
export type MemberApp = { id: string; name: string };
export type Assignment = MemberApp & { repository_id: number; branch: string; application: string; inputs: string[] };
export type MemberFile = { id: string; name: string; mime: string; created_at: string };
export type MemberOutput = Pick<FilePayload, 'size' | 'mime' | 'sha256' | 'contents'> & { id: string; name: string };
export type TaskState = 'pending' | 'working' | 'finished' | 'submitted' | 'returned' | 'rejected' | 'terminated' | 'completed';
export type MemberTask = { id: string; user_id: string; task_type: string; description: string; status: TaskState;
  comment: string; submission_id: string | null; created_at: string; active_review: string | null;
  commit_sha: string | null; commit_repository: string | null; commit_branch: string | null };
export type Submission = { id: string; task_id: string; user_id: string; role: MemberRole; full_name: string;
  created_at: string; seen: boolean; files: MemberFile[] };
export type MemberHome = { profile: MemberProfile; apps: MemberApp[]; tasks: MemberTask[]; drafts: MemberFile[]; links?: { task_id: string; file_id: string }[]; draftBytes?: number; draftCount?:number; counts?:Partial<Record<TaskState,number>> };
export type DraftLink = { submissionId: string } | { pictureId: string; pictureUrl: string };
export const pictureFilename = (user: string, picture: string) => user + '-' + picture + '.webp';

export type MemberCalls = {
  member_home: [{ section?: 'profile' | 'dashboard' | 'tasks' | 'drafts' | 'workstation' }, MemberHome];
  member_context: [object, { profile: MemberProfile }];
  member_onboard: [object, { saved: true }];
  member_progress: [{ taskId: string; status: 'working' | 'finished'; files: string[]; append?:boolean }, { saved: true }];
  member_read_draft: [{ fileId: string }, { file: MemberOutput }];
  member_delete_draft: [{ fileId: string }, { deleted: true }];
  people_delete_task: [{ taskId: string }, { deleted: true }];
  member_launch: [{ appId: string }, WebsiteLaunch];
  member_input: [{ appId: string; commit: string; path: string }, { file: FilePayload }];
  member_draft_input: [{ appId: string; fileId: string }, { file: MemberOutput }];
  member_save: [{ appId: string | null; file: MemberOutput }, { id: string }];
  member_submit: [{ taskId: string; files: string[] }, { id: string }];
  people_list: [{page?:number;search?:string;role?:string}, { accounts: MemberAccount[];total?:number }];
  people_save: [{ id?: string; fields: MemberFields; password?: string }, { id: string }];
  people_delete: [{ id: string }, { deleted: true }];
  people_apps: [{ userId: string }, { apps: Assignment[] }];
  people_assign: [{ userId: string; id?: string; repositoryId: number; branch: string; application: string; name: string; inputs: string[] }, { id: string }];
  people_unassign: [{ userId: string; id: string }, { deleted: true }];
  people_tasks: [{mode?:'manage'|'terminated'|'review'|'history';page?:number;search?:string;status?:string}, { tasks: MemberTask[]; submissions: Submission[];total?:number }];
  people_review_counts: [object,{pendingTasks:number;pendingProfiles:number;unread:number;latestSubmission?:string}];
  people_add_task: [{ userId: string; type: string; description: string; timeZone: string }, { id: string }];
  people_decide: [{ taskId: string; submissionId: string | null; decision: 'returned' | 'rejected' | 'terminated'; comment: string }, { saved: true }];
  people_seen: [{ id: string }, { saved: true }];
  people_notice_count: [object, { count: number }];
  people_submission_file: [{ submissionId: string; fileId: string }, { file: MemberOutput; taskId: string }];
  people_picture: [{ userId: string; pictureId: string }, { file: MemberOutput }];
  people_return_picture: [{ userId: string; pictureId: string; comment: string }, { saved: true }];
  people_stage_picture: [{ userId: string; pictureId: string }, { draft: StoredFile }];
};

export type MemberRequest = { [K in keyof MemberCalls]: { action: K } & MemberCalls[K][0] }[keyof MemberCalls];
