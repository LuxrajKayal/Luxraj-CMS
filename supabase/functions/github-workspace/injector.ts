import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.119.2';
import { parse } from 'npm:parse5@8.1.1';
import type { CodeCatalog, CodeGroup, CodeTemplate, InjectorHtmlMatches, Repository } from '../_shared/workspace-contracts.ts';
import { WorkspaceError, type WorkspaceGit } from './git.ts';

function check(error: { code?: string; message: string; details?: string } | null) {
  if (!error) return;
  if (error.code === '23505') throw new WorkspaceError('catalog_name_taken', 409);
  if (error.message === 'database_limit') throw new WorkspaceError('database_limit', 409, JSON.parse(error.details || '{}'));
  throw error;
}

const group = ({ id, name, template_ids }: { id: string; name: string; template_ids: string[] }): CodeGroup =>
  ({ id, name, templateIds: template_ids });

export function createInjectorStore(client: SupabaseClient) {
  async function rows(table: string, columns: string, user: string) {
    const result = [];
    for (let start = 0; ; start += 100) {
      const { data, error } = await client.from(table).select(columns).eq('user_id', user)
        .order('name').order('id').range(start, start + 99);
      check(error);
      if (!data) throw new Error('Catalog unavailable.');
      result.push(...data);
      if (data.length < 100) return result;
    }
  }
  return {
    async load(user: string): Promise<CodeCatalog> {
      const [templates, groups] = await Promise.all([
        rows('cms_code_templates', 'id,name,kind,source', user),
        rows('cms_code_groups', 'id,name,template_ids', user),
      ]);
      return { templates: templates as unknown as CodeTemplate[],
        groups: (groups as unknown as Parameters<typeof group>[0][]).map(group) };
    },
    async addTemplate(user: string, template: Omit<CodeTemplate, 'id'>): Promise<CodeTemplate> {
      const { data, error } = await client.from('cms_code_templates').insert({ user_id: user, ...template })
        .select('id,name,kind,source').single();
      check(error);
      return data as CodeTemplate;
    },
    async updateTemplate(user: string, id: string, template: Omit<CodeTemplate, 'id'>): Promise<CodeTemplate> {
      const { data, error } = await client.from('cms_code_templates')
        .update(template).eq('id', id).eq('user_id', user)
        .select('id,name,kind,source').maybeSingle();
      check(error);
      if (!data) throw new WorkspaceError('catalog_missing', 404);
      return data as CodeTemplate;
    },
    async addGroup(user: string, name: string, templateIds: string[]): Promise<CodeGroup> {
      for (let offset = 0; offset < templateIds.length; offset += 100) {
        const members = templateIds.slice(offset, offset + 100);
        const { data, error } = await client.from('cms_code_templates').select('id').eq('user_id', user).in('id', members);
        check(error);
        if (data?.length !== members.length) throw new WorkspaceError('catalog_members', 422);
      }
      const { data, error } = await client.from('cms_code_groups')
        .insert({ user_id: user, name, template_ids: templateIds }).select('id,name,template_ids').single();
      check(error);
      return group(data as Parameters<typeof group>[0]);
    },
  };
}

export async function scanInjectorHtml(
  git: Pick<WorkspaceGit, 'requireBranch' | 'atCommit'>, repo: Repository, branch: string, commit: string,
  files: string[], category: string, page: string,
): Promise<InjectorHtmlMatches> {
  if (await git.requireBranch(repo, branch) !== commit) throw new WorkspaceError('branch_changed', 409);
  const result = await Promise.all(files.map(async path => {
    try {
      const source = await git.atCommit(repo, commit, path.split('/'));
      const root = parse(source.replace(/^\uFEFF/, ''), { sourceCodeLocationInfo: true }).childNodes
        .find(node => 'tagName' in node && node.tagName === 'html');
      if (!root || !('attrs' in root) || !root.sourceCodeLocation?.startTag) return 'skip';
      // Ignore identification attributes merged onto the root by HTML parser error recovery.
      const { startTag, attrs: locations } = root.sourceCodeLocation;
      const attrs = new Map(root.attrs.filter(attr => {
        const location = locations?.[attr.name];
        return location && location.startOffset >= startTag!.startOffset && location.endOffset <= startTag!.endOffset;
      }).map(attr => [attr.name, attr.value]));
      return attrs.get('data-cms-seo') === 'true' && attrs.get('data-cms-website') === category &&
        attrs.get('data-cms-seo-type') === page ? 'match' : 'skip';
    } catch (error) {
      if (error instanceof WorkspaceError && ['remote_missing', 'unsupported_file', 'file_too_large'].includes(error.code)) {
        return 'unreadable';
      }
      throw error;
    }
  }));
  if (await git.requireBranch(repo, branch) !== commit) throw new WorkspaceError('branch_changed', 409);
  return { matches: files.filter((_, i) => result[i] === 'match'), unreadable: files.filter((_, i) => result[i] === 'unreadable') };
}
