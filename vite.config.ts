import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // Keep existing local development URL while building for the custom domain root.
  base: command === 'build' ? '/' : '/Luxraj-CMS/',
  plugins: [react()],
}));
