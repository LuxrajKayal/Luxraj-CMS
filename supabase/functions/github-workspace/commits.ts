import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.119.2';
import { maxFileBytes, type CommitReceipt, type CommitReview, type Repository, type ReviewFile } from '../_shared/workspace-contracts.ts';
import { decodeBytes, encodeBytes, sha256 } from '../_shared/file-bytes.ts';
import type { DraftLink } from '../_shared/member-contracts.ts';
import type { ChangeScope, ChangeSets } from './change-sets.ts';
import type { FileDrafts } from './file-drafts.ts';
import { isCommit, WorkspaceError, type WorkspaceGit } from './git.ts';

type Input = { repository: Repository; scope: ChangeScope; git: WorkspaceGit; changes: ChangeSets;
  fileDrafts?: Pick<FileDrafts, 'get' | 'loadBytes'>; check(): Promise<void> };
type Write = (input: object) => Promise<Response>;
export interface CommitReviews {
  prepare(input: Input, files: ReviewFile[], message: string): Promise<CommitReview>;
  confirm(input: Input, id: string, write: Write): Promise<CommitReceipt>;
  reconcile(input: Input, id: string, sha: string): Promise<CommitReceipt>;
  release?(input: Input, id: string): Promise<{ released: true }>;
}

export async function checkedDrafts({ changes, fileDrafts, scope, repository, git }: Input, files: ReviewFile[], head: string) {
  const encoder = new TextEncoder();
  async function checkFile(file: ReviewFile) {
    const fileScope = { ...scope, path: file.path };
    const binary = await fileDrafts?.get(fileScope);
    if (binary && fileDrafts) {
      if (binary.revision !== file.revision) throw new WorkspaceError('draft_conflict', 409, { path: file.path });
      const detail = { size: binary.file_size, sha256: binary.file_digest, originalBlob: binary.original_blob };
      if (file.file && (file.file.size !== detail.size || file.file.sha256 !== detail.sha256 ||
          file.file.originalBlob !== detail.originalBlob)) throw new WorkspaceError('file_integrity', 409);
      const remote = await git.fileTarget(repository, scope.branch, file.path.split('/'), head);
      if (remote.blob !== binary.original_blob) throw new WorkspaceError('commit_file_conflict', 409, { path: file.path });
      const data = await fileDrafts.loadBytes(binary);
      if (data.contents === null || data.sha256 !== detail.sha256 || data.size !== detail.size) {
        throw new WorkspaceError('file_integrity', 409);
      }
      const link: DraftLink | undefined = binary.submission_id ? { submissionId: binary.submission_id } :
        binary.picture_id && binary.picture_url ? { pictureId: binary.picture_id, pictureUrl: binary.picture_url } : undefined;
      return { size: data.size, contents: data.contents, reviewFile: { path: file.path, revision: file.revision, file: detail }, link };
    }
    if (file.file) throw new WorkspaceError('draft_conflict', 409, { path: file.path });
    const draft = await changes.get(fileScope);
    if (!draft || draft.revision !== file.revision || draft.originalSource === draft.proposedSource) {
      throw new WorkspaceError('draft_conflict', 409, { path: file.path });
    }
    let remote;
    try {
      remote = await git.fileVersion(repository, scope.branch, file.path.split('/'), head, true);
    } catch (error) {
      if (error instanceof WorkspaceError && ['remote_missing', 'unsupported_file', 'file_too_large'].includes(error.code)) {
        throw new WorkspaceError('commit_file_conflict', 409, { path: file.path });
      }
      throw error;
    }
    if (remote.blob !== draft.originalBlob) throw new WorkspaceError('commit_file_conflict', 409, { path: file.path });
    const bytes = encoder.encode(draft.proposedSource);
    return { size: bytes.length, contents: encodeBytes(bytes), reviewFile: { path: file.path, revision: file.revision } };
  }
  const drafts = [];
  let bytes = 0;
  for (let offset = 0; offset < files.length; offset += 8) {
    const batch = await Promise.all(files.slice(offset, offset + 8).map(checkFile));
    for (const draft of batch) {
      bytes += draft.size;
      if (bytes > maxFileBytes) throw new WorkspaceError('commit_too_large', 422);
      drafts.push(draft);
    }
  }
  if (drafts.some(draft => draft.reviewFile.file)) {
    const names = drafts.map(draft => draft.reviewFile.path.normalize('NFC').toLowerCase());
    if (new Set(names).size !== names.length) throw new WorkspaceError('file_path_collision', 409);
  }
  return drafts;
}

export async function writeCommit(write: Write, review: CommitReview, additions: { path: string; contents: string }[]) {
  let data;
  let response;
  try {
    const [headline] = review.message.split('\n', 1);
    response = await write({ input: {
      branch: { repositoryNameWithOwner: review.repository, branchName: review.branch },
      expectedHeadOid: review.head, message: { headline, body: review.message.slice(headline.length + 2) },
      fileChanges: { additions },
    } });
    data = await response.json().catch(() => null);
  } catch (error) {
    if (error instanceof WorkspaceError) throw error;
    throw new WorkspaceError('commit_unknown', 503);
  }
  const sha = data?.data?.createCommitOnBranch?.commit?.oid;
  if (isCommit(sha)) return sha;
  if (response.status >= 500 || (response.ok && !data?.errors?.length)) {
    throw new WorkspaceError('commit_unknown', 503);
  }
  const messages = (data?.errors ?? []).map((error: { message?: string }) => error.message ?? '').join(' ');
  if (/expected.*head|head.*(match|oid)|stale/i.test(messages)) throw new WorkspaceError('branch_changed', 409);
  throw new WorkspaceError('commit_rejected', 409);
}

type Row = { id: string; repository: string; branch: string; head: string; message: string; files: ReviewFile[];
  claimed?: boolean; commit_sha?: string | null; task_links?: { task: string; submission: string }[];
  picture_links?: { picture: string; url: string }[] };
const linked = (row: Row) => !!(row.task_links?.length || row.picture_links?.length);
function fromRow(row: Row): CommitReview {
  return { id: row.id, repository: row.repository, branch: row.branch, head: row.head, message: row.message, files: row.files };
}

export function createCommitReviews(client: SupabaseClient, commitLimit = async () => 20,
  validateSubmission?: (submission: string, allowCompleted?: boolean) => Promise<string>): CommitReviews {
  const table = 'cms_commit_reviews';
  const keys = (scope: ChangeScope) => ({ user_id: scope.userId, repository_id: scope.repositoryId, branch: scope.branch });

  async function checkLimit(count: number) {
    const maximumFiles = await commitLimit();
    if (count > maximumFiles) throw new WorkspaceError('commit_limit_exceeded', 409, { maximumFiles });
  }

  async function record(id: string, actorId: string, sha: string, hasLinks: boolean): Promise<number | null> {
    // The GitHub write cannot share a database transaction. Retry the status
    // update; the RPC is idempotent when an earlier response was lost.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = hasLinks
          ? await client.rpc('cms_record_linked_commit', { review_key: id, actor: actorId, github_sha: sha })
          : await client.rpc('cms_record_commit', { review_id: id, actor_id: actorId, github_sha: sha });
        if (!result.error && typeof result.data === 'number') return result.data;
      } catch {
        // Retrying a lost response is safe because cms_record_commit is idempotent.
      }
    }
    return null;
  }

  return {
    async prepare(input, files, message) {
      await checkLimit(files.length);
      const head = await input.git.requireBranch(input.repository, input.scope.branch);
      const drafts = await checkedDrafts(input, files, head);
      await input.check();
      const taskLinks = new Map<string, { task: string; submission: string }>();
      const pictureLinks = new Map<string, { picture: string; url: string }>();
      for (const draft of drafts) {
        if (!('link' in draft) || !draft.link) continue;
        if ('submissionId' in draft.link) {
          const submission = draft.link.submissionId;
          if (!taskLinks.has(submission)) {
            if (!validateSubmission) throw new Error('Task validation unavailable.');
            taskLinks.set(submission, { task: await validateSubmission(submission, true), submission });
          }
        } else {
          const { pictureId, pictureUrl } = draft.link;
          pictureLinks.set(pictureId, { picture: pictureId, url: pictureUrl });
        }
      }
      const hasLinks = !!(taskLinks.size || pictureLinks.size);
      const tags = [...taskLinks.values()].map(link => '[' + link.task + '] ').join('');
      const [first, ...lines] = message.replace(/\r\n?/g, '\n').trim().split('\n');
      const headline = tags + first.trimEnd();
      const body = lines.join('\n').trim();
      const formattedMessage = body ? `${headline}\n\n${body}` : headline;
      if (formattedMessage.length > 1000) throw new WorkspaceError('invalid_commit_review', 400);
      const { data, error } = await client.from(table).insert({
        ...keys(input.scope), repository: input.repository.name, head, message: formattedMessage,
        files: await Promise.all(drafts.map(async draft => hasLinks && !('file' in draft.reviewFile)
          ? { ...draft.reviewFile, digest: await sha256(decodeBytes(draft.contents)) } : draft.reviewFile)),
        ...(hasLinks ? { task_links: [...taskLinks.values()], picture_links: [...pictureLinks.values()] } : {}),
      }).select('id,repository,branch,head,message,files').single();
      if (error) throw error;
      return fromRow(data as Row);
    },
    async confirm(input, id, write) {
      const { data, error } = await client.from(table).update({ claimed: true })
        .match(keys(input.scope)).eq('id', id).eq('claimed', false)
        .gt('expires_at', new Date().toISOString()).select('id,repository,branch,head,message,files,task_links,picture_links').maybeSingle();
      if (error) throw error;
      if (!data) throw new WorkspaceError('review_expired', 409);
      const row = data as Row;
      const review = fromRow(row);
      const hasLinks = linked(row);
      await checkLimit(review.files.length);
      if (review.repository !== input.repository.name ||
          await input.git.requireBranch(input.repository, input.scope.branch) !== review.head) {
        throw new WorkspaceError('branch_changed', 409);
      }
      const drafts = await checkedDrafts(input, review.files, review.head);
      await input.check();
      await checkLimit(review.files.length);
      if (hasLinks) {
        const claim = await client.rpc('cms_claim_linked_review', { review_key: id, actor: input.scope.userId });
        if (claim.error) {
          if (['review_expired', 'task_review_stale', 'picture_review_stale'].includes(claim.error.message)) {
            throw new WorkspaceError(claim.error.message, 409);
          }
          throw claim.error;
        }
      }
      let sha: string;
      try {
        sha = await writeCommit(write, review, drafts.map(draft => ({ path: draft.reviewFile.path, contents: draft.contents })));
      } catch (failure) {
        if (hasLinks && failure instanceof WorkspaceError && failure.code !== 'commit_unknown') {
          const release = await client.rpc('cms_release_linked_review', { review_key: id, actor: input.scope.userId });
          if (release.error) throw new WorkspaceError('commit_unknown', 503);
        }
        throw failure;
      }
      const retained = await record(id, input.scope.userId, sha, hasLinks);
      return { sha, url: `https://github.com/${review.repository}/commit/${sha}`,
        retained, fileCount: drafts.length, reviewId: id };
    },

    async reconcile(input, id, sha) {
      if (!isCommit(sha)) throw new WorkspaceError('commit_unverified', 409);
      const { data, error } = await client.from(table)
        .select('id,repository,branch,head,message,files,claimed,commit_sha,task_links,picture_links')
        .match(keys(input.scope)).eq('id', id).eq('claimed', true).maybeSingle();
      if (error) throw error;
      if (!data) throw new WorkspaceError('review_expired', 409);
      const row = data as Row;
      const review = fromRow(row);
      if (review.repository !== input.repository.name ||
          (row.commit_sha && row.commit_sha !== sha)) throw new WorkspaceError('commit_unverified', 409);
      await input.check();
      const hasLinks = linked(row);
      if (hasLinks) {
        const head = await input.git.requireBranch(input.repository, input.scope.branch);
        if (head !== sha) {
          const response = await input.git.get(input.git.repoPath(input.repository) + '/compare/' + sha + '...' + head + '?per_page=1');
          const reachability = response.ok ? await response.json() : null;
          if (reachability?.merge_base_commit?.sha !== sha || reachability?.status !== 'ahead') {
            throw new WorkspaceError('commit_unverified', 409);
          }
        }
      }

      // An authenticated admin cannot mark an arbitrary SHA as the result of a
      // review: verify the real GitHub commit, its parent and its exact message.
      const response = await input.git.get(`${input.git.repoPath(input.repository)}/git/commits/${sha}`);
      if (!response.ok) throw new WorkspaceError('commit_unverified', 409);
      const remote = await response.json();
      if (remote.sha !== sha || remote.parents?.[0]?.sha !== review.head ||
          typeof remote.message !== 'string' ||
          remote.message.trimEnd() !== review.message.trimEnd()) {
        throw new WorkspaceError('commit_unverified', 409);
      }
      if (review.files.some(file => !!file.file)) {
        const detail = await input.git.get(input.git.repoPath(input.repository) + '/commits/' + sha + '?per_page=100');
        const value = detail.ok ? await detail.json() : null;
        const expected = new Set(review.files.map(file => file.path));
        if (detail.headers.get('Link')?.includes('rel="next"') || !Array.isArray(value?.files) ||
            value.files.length !== expected.size || !value.files.every((file: { filename: string }) => expected.delete(file.filename))) {
          throw new WorkspaceError('commit_unverified', 409);
        }
      }

      // Verify remaining identical saved revisions against the committed file
      // content before recording them. Newer edited drafts remain pending.
      for (const file of review.files) {
        if (file.file || file.digest) {
          const remoteFile = await input.git.fileAtCommit(input.repository, sha, file.path.split('/'));
          if (!remoteFile || remoteFile.sha256 !== (file.file?.sha256 ?? file.digest) ||
              (file.file && remoteFile.size !== file.file.size)) {
            throw new WorkspaceError('commit_unverified', 409);
          }
          continue;
        }
        const draft = await input.changes.get({ ...input.scope, path: file.path });
        if (draft?.revision !== file.revision) continue;
        let source: string;
        try {
          source = await input.git.atCommit(input.repository, sha, file.path.split('/'));
        } catch {
          throw new WorkspaceError('commit_unverified', 409);
        }
        if (source !== draft.proposedSource) throw new WorkspaceError('commit_unverified', 409);
      }
      await input.check();
      const retained = await record(id, input.scope.userId, sha, hasLinks);
      return { sha, url: `https://github.com/${review.repository}/commit/${sha}`,
        retained, fileCount: review.files.length, reviewId: id };
    },
    async release(input, id) {
      const report = await client.from(table).select('repository,head,task_links,picture_links')
        .match(keys(input.scope)).eq('id', id).eq('claimed', true).is('commit_sha', null)
        .lt('claimed_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()).maybeSingle();
      if (report.error) throw report.error;
      const row = report.data as Row | null;
      if (!row || !linked(row) || row.repository !== input.repository.name ||
          await input.git.requireBranch(input.repository, input.scope.branch) !== row.head) {
        throw new WorkspaceError('commit_release_blocked', 409);
      }
      await input.check();
      const release = await client.rpc('cms_release_linked_review', { review_key: id, actor: input.scope.userId });
      if (release.error) throw release.error;
      return { released: true };
    },
  };
}
