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

export type WorkspaceRequest =
  | { action: 'load' }
  | { action: 'select'; repositoryId: number; branch?: string }
  | { action: 'tree'; repositoryId: number; branch: string; path: string[]; commit?: string }
  | { action: 'file'; repositoryId: number; branch: string; path: string[]; commit: string };
