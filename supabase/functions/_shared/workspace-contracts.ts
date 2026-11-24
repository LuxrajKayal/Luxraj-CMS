export interface Repository {
  id: number;
  name: string;
  defaultBranch: string;
  private: boolean;
}

export interface Selection {
  repositoryId: number;
  branch: string | null;
}

export interface Workspace {
  repositories: Repository[];
  selection: Selection | null;
  branches: string[];
}

export interface TreeEntry {
  name: string;
  kind: 'folder' | 'file';
}

export interface Directory {
  commit: string;
  entries: TreeEntry[];
}

export type HtmlDiscovery = { commit: string; files: string[] };
export type InjectorHtmlMatches = { matches: string[]; unreadable: string[] };
export type CodeKind = 'html' | 'script' | 'css';
export type CodeTemplate = { id: string; name: string; kind: CodeKind; source: string };
export type CodeGroup = { id: string; name: string; templateIds: string[] };
export type CodeCatalog = { templates: CodeTemplate[]; groups: CodeGroup[] };
export type CommitLimit = { maximumFiles: number };

export interface SourceFile {
  source: string;
}

export interface FileVersion extends SourceFile {
  commit: string;
  blob: string;
}

export interface DraftSummary {
  path: string;
  updatedAt: string;
  revision?: string;
  file?: boolean;
}

export interface Draft extends DraftSummary {
  originalCommit: string;
  originalBlob: string;
  originalSource: string;
  proposedSource: string;
  revision: string;
}

export interface OpenDraft {
  current: FileVersion;
  draft: Draft | null;
}

export interface SavedDraft {
  draft: Draft | null;
}

export interface DraftIdentity {
  repositoryId: number;
  branch: string;
  path: string;
  revision: string;
}

export interface ManagedDraft extends DraftIdentity {
  repository: string;
  updatedAt: string;
  contentBytes: number;
  pending: boolean;
  available: boolean;
  committedSha?: string | null;
  fileSize?: number;
  fileState?: 'uploading' | 'saved' | 'deleting';
}

export const maxFileBytes = 8 * 1024 * 1024;
export type FileMetadata = { size: number; sha256: string; mime: string; blob?: string };
export type FilePayload = Omit<FileMetadata, 'sha256'> & { sha256: string | null; contents: string | null };
export type StoredFile = FileMetadata & { path: string; revision: string; originalBlob: string | null; committedSha: string | null; origin?: 'website_control' };
export type FileInspection = { commit: string; original: FilePayload | null };
export type FileComparison = { draft: StoredFile; original: FilePayload | null; proposed: FilePayload };
export type ProfilePictureLocation = { repositoryId: number; branch: string; folder: string; publicPrefix: string };
export type ReviewFile = { path: string; revision: string; file?: { size: number; sha256: string; originalBlob: string | null } };
export type CommitReview = { id: string; repository: string; branch: string; head: string; message: string; files: ReviewFile[] };
export type CommitReceipt = { sha: string; url: string; retained: number | null; fileCount: number; reviewId?: string };
export type HistoryCommit = { sha: string; parents: string[]; message: string; author: string; date: string };
export type HistoryPage = { head: string; commits: HistoryCommit[]; refs: { name: string; sha: string }[]; next: number | null };
export type CommittedFile = { path: string; status: string; previousPath?: string };
export type CommitDetail = HistoryCommit & { files: CommittedFile[]; complete: boolean };
export type CommittedDiff = { original: string; proposed: string };

export type WebsiteRegistration = { name: string; application: string; inputs: string[]; destinations: string[] };
export type WebsiteControl = WebsiteRegistration & { id: string };
export type WebsiteLaunch = { commit: string; source: string; control: WebsiteControl };
export type MaintenanceMode = 'controls' | 'drafts' | 'all';
export type MaintenanceResult = { deleted: number; next: string | null; remaining: number | null; reset: boolean };
type WorkspaceScope = { repositoryId: number; branch: string };

export interface DraftDeletion extends DraftIdentity {
  result: 'deleted' | 'conflict' | 'unavailable';
}

export interface StorageUsage {
  databaseBytes: number;
  databaseLimitMb: number;
  databaseCeilingMb: number;
  fileBytes: number | null;
  fileLimitMb: number;
  fileCeilingMb: number;
  draftTableBytes: number;
  draftContentBytes: number;
}

export type WorkspaceRequest =
  | { action: 'load' }
  | { action: 'select'; repositoryId: number; branch?: string }
  | { action: 'tree'; repositoryId: number; branch: string; path: string[]; commit?: string }
  | { action: 'file_manager_tree'; repositoryId: number; branch: string; path: string[]; includeExecutables?: boolean }
  | { action: 'file_inspect'; repositoryId: number; branch: string; path: string[]; commit: string }
  | { action: 'file_save' | 'profile_picture_stage'; repositoryId: number; branch: string; path: string[]; commit: string;
      originalBlob: string | null; contents: string; size: number; sha256: string; mime: string; origin?: 'website_control' }
  | { action: 'file_drafts'; repositoryId: number; branch: string }
  | { action: 'file_comparison'; repositoryId: number; branch: string; path: string[]; revision: string }
  | { action: 'profile_picture_location' }
  | ({ action: 'save_profile_picture_location' } & ProfilePictureLocation)
  | { action: 'verify_profile_picture'; repositoryId: number; branch: string; path: string[]; revision: string }
  | { action: 'discover_html'; repositoryId: number; branch: string }
  | { action: 'discover_sources'; repositoryId: number; branch: string }
  | { action: 'scan_injector_html'; repositoryId: number; branch: string; commit: string; files: string[]; category: string; page: string }
  | { action: 'injector_catalog' }
  | { action: 'injector_template_add'; name: string; kind: CodeKind; source: string }
  | { action: 'injector_template_update'; id: string; name: string; kind: CodeKind; source: string }
  | { action: 'injector_group_add'; name: string; templateIds: string[] }
  | { action: 'commit_limit' }
  | { action: 'save_commit_limit'; maximumFiles: number }
  | { action: 'file' | 'open_draft'; repositoryId: number; branch: string; path: string[]; commit: string }
  | { action: 'save_draft'; repositoryId: number; branch: string; path: string[]; commit: string; source: string; revision: string | null }
  | { action: 'changes'; repositoryId: number; branch: string }
  | { action: 'diff'; repositoryId: number; branch: string; path: string[] }
  | { action: 'draft_catalog' }
  | { action: 'pending_count' }
  | { action: 'website_maintenance'; mode: MaintenanceMode; after?: string }
  | ({ action: 'website_list' } & WorkspaceScope)
  | ({ action: 'website_register'; registration: WebsiteRegistration } & WorkspaceScope)
  | ({ action: 'website_launch'; id: string } & WorkspaceScope)
  | ({ action: 'website_input'; id: string; commit: string; path: string } & WorkspaceScope)
  | { action: 'delete_drafts'; drafts: DraftIdentity[] }
  | { action: 'storage_status' }
  | { action: 'storage_save'; databaseLimitMb: number; fileLimitMb: number }
  | { action: 'review_commit'; repositoryId: number; branch: string; message: string; files: ReviewFile[] }
  | { action: 'confirm_commit'; repositoryId: number; branch: string; reviewId: string }
  | { action: 'reconcile_commit'; repositoryId: number; branch: string; reviewId: string; sha: string }
  | { action: 'history'; repositoryId: number; branch: string; page: number; head?: string }
  | { action: 'commit_detail'; repositoryId: number; branch: string; sha: string }
  | { action: 'commit_diff'; repositoryId: number; branch: string; sha: string; path: string };
