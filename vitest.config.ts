import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // load all keys (3rd arg '') from .env, .env.local, .env.test*, etc.
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    test: {
      environment: 'node', // or 'jsdom'
      // include: ['test/unit/**/*.test.{ts,tsx,js}'],
      include: ['test/**/*.test.ts'],
      globals: true,
      // setupFiles: [], // dotenv/config
      reporters: ['dot'], // 'default', 'verbose', 'dot', 'tree', 'tap', 'tap-flat', 'hanging-process', 'github-actions'
      // coverage: { provider: 'v8' },
    },
  };
});

