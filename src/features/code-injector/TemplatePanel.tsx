import { useState, type FormEvent } from 'react';
import type { CodeGroup, CodeKind } from '../../../supabase/functions/_shared/workspace-contracts';
import { workspaceError, workspaceRequest } from '../workspace/api';
import { presence, readTemplate, type CodeItem, type ParsedTemplate } from './code-matching';

function Mark({ templates, existing }: { templates: ParsedTemplate[]; existing: CodeItem[] }) {
  const match = presence(templates, existing);
  return match === 'absent' ? null : <span className={'injector-mark injector-mark--' + match}
    role="img" aria-label={match === 'complete' ? 'All items match' : 'Some items match'}>✓</span>;
}

export function TemplatePanel({ templates, groups, selected, existing, disabled, choose, addTemplate, addGroup }: {
  templates: ParsedTemplate[]; groups: CodeGroup[]; selected: string[]; existing: CodeItem[]; disabled: boolean;
  choose(ids: string[]): void; addTemplate(template: ParsedTemplate): void; addGroup(group: CodeGroup): void;
}) {
  const [form, setForm] = useState<'template' | 'group' | null>(null);
  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [kind, setKind] = useState<CodeKind>('html');
  const [members, setMembers] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const labels = { html: 'HTML', script: 'Script', css: 'CSS' };
  const toggle = (ids: string[], id: string) => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id];

  function start(next: typeof form) {
    setForm(next);
    setError('');
    setName('');
    setSource('');
    setMembers(next === 'group' ? selected : []);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (form === 'template') {
        let items: CodeItem[];
        try { items = readTemplate(kind, source); }
        catch { setError('The template could not be parsed as ' + labels[kind] + '. Check its syntax and try again.'); return; }
        if (!items.length) { setError('Add at least one recognizable code item.'); return; }
        if (new Set(items.map(item => item.key)).size !== items.length) {
          setError('This template contains repeated match identities. Separate the code into distinct templates.'); return;
        }
        const result = await workspaceRequest({ action: 'injector_template_add', name, kind, source });
        addTemplate({ ...result, items });
      } else {
        addGroup(await workspaceRequest({ action: 'injector_group_add', name, templateIds: members }));
      }
      start(null);
    } catch (error) { setError(workspaceError(error)); }
    finally { setBusy(false); }
  }

  return <div className="injector-template-panel">
    <div className="workspace-actions">
      <button type="button" disabled={disabled || busy} onClick={() => start('template')}>Add code template</button>
      <button type="button" disabled={disabled || busy || !templates.length} onClick={() => start('group')}>Create New Group</button>
    </div>
    {form && <form className="injector-card" onSubmit={event => void save(event)}>
      <strong>{form === 'template' ? 'New code template' : 'New saved group'}</strong>
      <label>Name <input value={name} maxLength={100} required disabled={disabled || busy} onChange={event => setName(event.target.value)} /></label>
      {form === 'template' ? <>
        <label>Code type <select value={kind} disabled={disabled || busy} onChange={event => setKind(event.target.value as CodeKind)}>
          {Object.entries(labels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
        </select></label>
        <label>Code <textarea value={source} required disabled={disabled || busy} rows={6} onChange={event => setSource(event.target.value)} /></label>
      </> : templates.map(template => <label key={template.id}>
        <input type="checkbox" checked={members.includes(template.id)} disabled={disabled || busy}
          onChange={() => setMembers(toggle(members, template.id))} /> {template.name}
      </label>)}
      <div className="workspace-actions">
        <button type="submit" disabled={disabled || busy || !name.trim() || (form === 'group' && !members.length)}>Save</button>
        <button type="button" disabled={busy} onClick={() => start(null)}>Cancel</button>
      </div>
    </form>}
    {error && <p role="alert">{error}</p>}
    <h3>Code templates</h3>
    {!templates.length && <p>No saved templates.</p>}
    {templates.map(template => <label className="injector-card injector-card--choice" key={template.id}>
      <input type="checkbox" aria-label={'Select template ' + template.name} checked={selected.includes(template.id)}
        disabled={disabled || !template.items.length} onChange={() => choose(toggle(selected, template.id))} />
      <span><strong>{template.name}</strong><small>{labels[template.kind]} · {template.items.length} items</small></span>
      <Mark templates={[template]} existing={existing} />
    </label>)}
    {selected.length > 1 && <p>{selected.length} templates selected for this operation.</p>}
    {groups.length > 0 && <h3>Saved groups</h3>}
    {groups.map(group => {
      const members = group.templateIds.flatMap(id => templates.find(template => template.id === id) ?? []);
      return <div className="injector-card injector-card--choice" key={group.id}>
        <button type="button" disabled={disabled || members.length !== group.templateIds.length || members.some(item => !item.items.length)}
          onClick={() => choose(group.templateIds)}>Use {group.name}</button>
        <small>{members.length} templates</small>
        <Mark templates={members} existing={existing} />
      </div>;
    })}
  </div>;
}
