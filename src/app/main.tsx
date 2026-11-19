import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './app.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Luxraj CMS could not start. Check for the root element in index.html.');
}

createRoot(root, {
  onCaughtError() {
    console.error('Luxraj CMS: The application error boundary caught an unexpected error.');
  },
  onUncaughtError() {
    console.error('Luxraj CMS: An unexpected error stopped the application.');
  },
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
