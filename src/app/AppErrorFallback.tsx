import { PagePanel } from '../shared/ui/PagePanel';
import './app-error.css';

export function AppErrorFallback() {
  return (
    <PagePanel>
      <div role="alert">
        <h1>Luxraj CMS could not open this screen</h1>
        <p>Reload the page to try again.</p>
      </div>
      <button
        className="app-error__reload"
        type="button"
        onClick={() => window.location.reload()}
      >
        Reload page
      </button>
    </PagePanel>
  );
}
