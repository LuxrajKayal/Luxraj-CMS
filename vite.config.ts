import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // Local development keeps its existing /Luxraj-CMS/ URL.
  // The GitHub Pages custom domain serves the built CMS at the domain root.
  base: command === 'build' ? '/' : '/Luxraj-CMS/',
  plugins: [react()],
}));
