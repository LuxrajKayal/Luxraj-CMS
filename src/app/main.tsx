import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './app.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Luxraj CMS could not start. Check for the root element in index.html.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
