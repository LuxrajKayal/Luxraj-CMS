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
}

export type ReviewFile = { path: string; revision: string };
export type CommitReview = { id: string; repository: string; branch: string; head: string; message: string; files: ReviewFile[] };
export type CommitReceipt = { sha: string; url: string; retained: number | null; fileCount: number; reviewId?: string };
export type HistoryCommit = { sha: string; parents: string[]; message: string; author: string; date: string };
export type HistoryPage = { head: string; commits: HistoryCommit[]; refs: { name: string; sha: string }[]; next: number | null };
export type CommittedFile = { path: string; status: string; previousPath?: string };
export type CommitDetail = HistoryCommit & { files: CommittedFile[]; complete: boolean };
export type CommittedDiff = { original: string; proposed: string };

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
  | { action: 'file' | 'open_draft'; repositoryId: number; branch: string; path: string[]; commit: string }
  | { action: 'save_draft'; repositoryId: number; branch: string; path: string[]; commit: string; source: string; revision: string | null }
  | { action: 'changes'; repositoryId: number; branch: string }
  | { action: 'diff'; repositoryId: number; branch: string; path: string[] }
  | { action: 'draft_catalog' }
  | { action: 'delete_drafts'; drafts: DraftIdentity[] }
  | { action: 'storage_status' }
  | { action: 'storage_save'; databaseLimitMb: number; fileLimitMb: number }
  | { action: 'review_commit'; repositoryId: number; branch: string; message: string; files: ReviewFile[] }
  | { action: 'confirm_commit'; repositoryId: number; branch: string; reviewId: string }
  | { action: 'reconcile_commit'; repositoryId: number; branch: string; reviewId: string; sha: string }
  | { action: 'history'; repositoryId: number; branch: string; page: number; head?: string }
  | { action: 'commit_detail'; repositoryId: number; branch: string; sha: string }
  | { action: 'commit_diff'; repositoryId: number; branch: string; sha: string; path: string };
