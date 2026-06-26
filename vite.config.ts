import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // Relative base so the build works under any GitHub Pages project subpath
  // (e.g. username.github.io/<repo>/) without hard-coding the repo name.
  // Safe here because the app is a single page with no client-side router.
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
