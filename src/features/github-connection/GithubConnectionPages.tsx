import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, Outlet, useSearchParams } from 'react-router';
import { PagePanel } from '../../shared/ui/PagePanel';
import { connectionError, githubConnection, type ConnectionStatus } from './api';
import './github-connection.css';

function useConnectionStatus() {
  const [connection, setConnection] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    githubConnection('status').then(result => {
      if (active) setConnection(result);
    }).catch(error => {
      if (active) setError(connectionError(error));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [attempt]);

  function refresh() {
    setLoading(true);
    setError('');
    setAttempt(current => current + 1);
  }

  return { connection, setConnection, loading, error, refresh };
}

export function RequireGithubConnection() {
  const { connection, loading, error, refresh } = useConnectionStatus();
  if (loading) return <PagePanel><p role="status">Checking GitHub connection…</p></PagePanel>;
  if (error) return (
    <PagePanel>
      <p role="alert">{error}</p>
      <button className="github-control" type="button" onClick={refresh}>Try again</button>
    </PagePanel>
  );
  return connection?.status === 'connected' ? <Outlet /> : <Navigate to="/github/connect" replace />;
}

export function GithubCallback() {
  const completion = useRef<Promise<ConnectionStatus> | null>(null);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let active = true;
    completion.current ??= githubConnection('complete');
    completion.current.then(result => {
      if (result.status !== 'connected') throw new Error('invalid_installation');
      if (active) setComplete(true);
    }).catch(error => {
      if (active) setError(connectionError(error));
    });
    return () => { active = false; };
  }, []);

  if (complete) return <Navigate to="/dashboard" replace />;
  return (
    <PagePanel>
      {error
        ? <><p role="alert">{error}</p><Link to="/github/connect" replace>Return to GitHub connection</Link></>
        : <p role="status">Verifying your GitHub App installation…</p>}
    </PagePanel>
  );
}

const statusLabels = {
  connected: 'Connected',
  disconnected: 'Disconnected',
  reconnect_required: 'Reconnect required',
  revocation_pending: 'Disconnected from CMS. GitHub revocation is pending.',
};

function ConnectionControls() {
  const { connection, setConnection, loading, error, refresh } = useConnectionStatus();
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState('');

  async function connect() {
    setWorking(true);
    setActionError('');
    try {
      const { installUrl } = await githubConnection('start');
      const url = new URL(installUrl);
      if (url.origin !== 'https://github.com' || !/^\/apps\/[a-z\d-]+\/installations\/new$/i.test(url.pathname)) {
        throw new Error('unavailable');
      }
      window.location.assign(url.href);
    } catch (error) {
      setActionError(connectionError(error));
      setWorking(false);
    }
  }

  async function disconnect() {
    if (connection?.status !== 'revocation_pending' &&
        !window.confirm('Disconnect Luxraj CMS and uninstall its GitHub App from this account?')) return;
    setWorking(true);
    setActionError('');
    try {
      setConnection(await githubConnection('disconnect'));
    } catch (error) {
      setActionError(connectionError(error));
      refresh();
    } finally {
      setWorking(false);
    }
  }

  if (loading) return <p role="status">Checking GitHub connection…</p>;
  if (error || !connection) return (
    <>
      <p role="alert">{error || 'GitHub connection status is unavailable.'}</p>
      <button className="github-control" type="button" onClick={refresh}>Try again</button>
    </>
  );

  const { status, owner, repositories, manageUrl } = connection;
  return (
    <>
      <p role={status === 'revocation_pending' ? 'alert' : 'status'}>{statusLabels[status]}</p>
      {actionError && <p role="alert">{actionError}</p>}
      {owner && <p>GitHub owner <strong>{owner}</strong></p>}
      {status === 'connected' && (
        <>
          <h2>Selected repositories</h2>
          {repositories.length
            ? <ul>{repositories.map(repository => <li key={repository}>{repository}</li>)}</ul>
            : <p>This installation currently has no selected repositories.</p>}
        </>
      )}
      {status === 'revocation_pending' && <p>Use GitHub installation settings to finish uninstalling if retrying fails.</p>}
      {status === 'disconnected' && <p>Install the Luxraj CMS GitHub App and choose Selected repositories.</p>}
      <div className="github-actions">
        {status !== 'revocation_pending' && (
          <button className="github-control" type="button" disabled={working} onClick={connect}>
            {status === 'disconnected' ? 'Connect GitHub' : 'Reconnect GitHub'}
          </button>
        )}
        {status !== 'disconnected' && (
          <button className="github-control" type="button" disabled={working} onClick={disconnect}>
            {status === 'revocation_pending' ? 'Retry GitHub uninstall' : 'Disconnect GitHub'}
          </button>
        )}
        <button className="github-control" type="button" disabled={working} onClick={refresh}>Refresh status</button>
      </div>
      {manageUrl && (
        <p><a href={manageUrl} target="_blank" rel="noopener noreferrer">Open GitHub installation settings</a></p>
      )}
      {status === 'connected' && <p><Link to="/dashboard">Open Dashboard</Link></p>}
    </>
  );
}

export function GithubOnboarding() {
  const [params] = useSearchParams();
  return (
    <PagePanel>
      <h1>Connect GitHub</h1>
      {params.get('result') === 'callback_failed' &&
        <p role="alert">GitHub setup could not be verified. Start the connection again.</p>}
      <ConnectionControls />
    </PagePanel>
  );
}

export function GithubSettings() {
  return (
    <section className="github-settings">
      <h1>Settings</h1>
      <h2>GitHub Connection</h2>
      <ConnectionControls />
    </section>
  );
}
