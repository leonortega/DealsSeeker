/// <reference types="node" />
import path from 'path';
import { defineConfig, devices } from '@playwright/test';

const repoRoot = path.resolve(__dirname, '../..');

export default defineConfig({
  testDir: path.resolve(repoRoot, 'test/e2e'),
  testMatch: '**/*.spec.ts',
  timeout: 90_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node test/e2e/start-api.cjs',
      cwd: repoRoot,
      url: 'http://localhost:5005/health/live',
      reuseExistingServer: false,
      timeout: 180_000,
    },
    {
      command: 'node test/e2e/serve-web.cjs',
      cwd: repoRoot,
      url: 'http://localhost:8081',
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
