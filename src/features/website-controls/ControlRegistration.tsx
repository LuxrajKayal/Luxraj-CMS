import { useState, type FormEvent } from 'react';
import type { WebsiteRegistration } from '../../../supabase/functions/_shared/workspace-contracts';
import type { FileScope } from '../file-manager/FileDestination';
import { RepositoryFilePicker } from './RepositoryFilePicker';

export function ControlRegistration({ scope, saving, save, cancel }: {
  scope: FileScope; saving: boolean; save(registration: WebsiteRegistration): Promise<void>; cancel(): void;
}) {
  const [name, setName] = useState('');
  const [application, setApplication] = useState('');
  const [inputs, setInputs] = useState<string[]>([]);
  const [destinations, setDestinations] = useState('');
  const [picker, setPicker] = useState<'application' | 'inputs' | 'destination' | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save({ name, application, inputs, destinations: destinations.split(/\r?\n/).filter(path => path.trim()) });
  }
  return <form className="website-registration" onSubmit={submit}>
    <h2>Add Control</h2>
    <label>Control name <input value={name} maxLength={100} onChange={event => setName(event.target.value)} required /></label>
    <label>HTML application <input value={application} onChange={event => setApplication(event.target.value)} placeholder="tools/application.html" required /></label>
    <div className="workspace-actions">
      <button type="button" onClick={() => setPicker(picker === 'application' ? null : 'application')}>Browse HTML applications</button>
      <button type="button" onClick={() => setPicker(picker === 'inputs' ? null : 'inputs')}>Add associated files</button>
    </div>
    {picker && <RepositoryFilePicker key={picker} scope={scope} label={picker === 'application' ? 'HTML applications' : picker === 'inputs' ? 'Associated files' : 'Output destination'}
      htmlOnly={picker === 'application'} multiple={picker === 'inputs'} destination={picker === 'destination' ? '' : undefined}
      disabled={saving} onCancel={() => setPicker(null)} onPick={paths => {
        if (picker === 'application') setApplication(paths[0]);
        else if (picker === 'inputs') setInputs(current => [...new Set([...current, ...paths])]);
        else setDestinations(current => [current, paths[0]].filter(Boolean).join('\n'));
        setPicker(null);
      }} />}
    {!!inputs.length && <ul className="website-paths">{inputs.map(path => <li key={path}>
      <code>{path}</code> <button type="button" aria-label={'Remove ' + path}
        onClick={() => setInputs(current => current.filter(value => value !== path))}>Remove</button>
    </li>)}</ul>}
    <label>Output destination paths (optional, one per line)
      <textarea rows={3} value={destinations} onChange={event => setDestinations(event.target.value)} />
    </label>
    <button type="button" onClick={() => setPicker('destination')}>Browse output destination</button>
    <div className="workspace-actions">
      <button className="website-primary" type="submit" disabled={saving}>Save Control</button>
      <button type="button" onClick={cancel} disabled={saving}>Cancel</button>
    </div>
  </form>;
}
