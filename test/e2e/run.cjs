// Launches Playwright with the React Native client's node_modules on NODE_PATH so
// specs living in test/e2e can import @playwright/test.
const { spawnSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const clientDir = path.join(repoRoot, 'src/DealsSeeker.ReactNative');
const nodeModules = path.join(clientDir, 'node_modules');

const result = spawnSync(
  process.execPath,
  [
    path.join(nodeModules, '@playwright/test/cli.js'),
    'test',
    '--config',
    path.join(clientDir, 'playwright.config.ts'),
    ...process.argv.slice(2),
  ],
  {
    cwd: clientDir,
    env: { ...process.env, NODE_PATH: nodeModules },
    stdio: 'inherit',
  }
);

process.exit(result.status ?? 1);
