import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import aitDevtools from '@apps-in-toss/devtools/unplugin';

export default defineConfig({
  plugins: [react(), aitDevtools.vite()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
  },
});
