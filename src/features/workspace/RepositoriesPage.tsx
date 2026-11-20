import { Link } from 'react-router';
import { BranchPicker, useWorkspace } from './WorkspaceLayout';

export function RepositoriesPage() {
  const { workspace: { repositories, selection }, saving, select } = useWorkspace();
  const active = repositories.find(repository => repository.id === selection?.repositoryId);

  return (
    <>
      <h1>Repositories</h1>
      {repositories.length ? (
        <ul className="workspace-repositories">
          {repositories.map(repository => (
            <li key={repository.id}>
              <strong>{repository.name}</strong>
              <span>{repository.private ? 'Private' : 'Public'}</span>
              <button type="button" disabled={saving || repository.id === active?.id}
                aria-label={repository.id === active?.id ? `${repository.name} selected` : `Select ${repository.name}`}
                onClick={() => void select(repository.id)}>
                {repository.id === active?.id ? 'Selected' : 'Select'}
              </button>
            </li>
          ))}
        </ul>
      ) : <p>The GitHub App has no accessible repositories.</p>}
      {active && <><h2>{active.name}</h2><BranchPicker /></>}
      {selection?.branch && <p><Link to="/code-editor">Open Code Editor</Link></p>}
    </>
  );
}
