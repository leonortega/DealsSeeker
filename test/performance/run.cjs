// Runs one k6 scenario against a disposable DealsSeeker API.
// Usage: node test/performance/run.cjs [search-heavy|auth-heavy|write-burst|soak]
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const artifacts = path.join(__dirname, '.artifacts');
const scenario = process.argv[2] || 'search-heavy';
const scenarios = ['search-heavy', 'auth-heavy', 'write-burst', 'soak'];
const k6Bin = process.env.K6_BIN || 'k6';
const apiUrl = process.env.API_URL || 'http://127.0.0.1:5006';
const dbPath = path.join(artifacts, 'performance.db');

let apiProcess;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function stopApi() {
  if (apiProcess && !apiProcess.killed) {
    apiProcess.kill('SIGTERM');
  }
}

process.on('SIGINT', () => {
  stopApi();
  process.exit(130);
});
process.on('SIGTERM', () => {
  stopApi();
  process.exit(143);
});

function startApi() {
  apiProcess = spawn(
    'dotnet',
    [
      'run',
      '--project',
      'src/DealsSeeker.Api/DealsSeeker.Api.csproj',
      '--no-launch-profile',
      '--urls',
      apiUrl,
    ],
    {
      cwd: repoRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        ASPNETCORE_ENVIRONMENT: 'Development',
        ASPNETCORE_URLS: apiUrl,
        Database__ConnectionString: `Data Source=${dbPath}`,
        LoggingPersistence__EnableDatabaseSink: 'false',
      },
    }
  );
  return new Promise((resolve, reject) => {
    apiProcess.once('exit', (code) => reject(new Error(`API exited early (${code})`)));
    resolve();
  });
}

async function waitForHealth() {
  // Cold starts and JIT can make the first health request slow; a short
  // timeout aborts it and leaves the API warming up while we retry.
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${apiUrl}/health/live`, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        return;
      }
    } catch {
      // API is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`API did not become healthy at ${apiUrl}/health/live after 60 attempts`);
}

async function main() {
  if (!scenarios.includes(scenario)) {
    fail(`Unknown scenario "${scenario}". Choose one of: ${scenarios.join(', ')}`);
  }
  if (spawnSync(k6Bin, ['version'], { stdio: 'ignore' }).status !== 0) {
    fail(`k6 was not found. Install it from https://k6.io/docs/get-started/installation/ or set K6_BIN.`);
  }

  fs.mkdirSync(artifacts, { recursive: true });
  for (const suffix of ['', '-wal', '-shm']) {
    const file = `${dbPath}${suffix}`;
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  }

  const seedCount = Number(process.env.SEED_OFFERS || '0');

  // First boot applies the migrations; the seeder needs the schema and a quiet DB.
  startApi();
  await waitForHealth();

  if (seedCount > 0) {
    stopApi();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Seeding ${seedCount} offers...`);
    const seed = spawnSync(
      'python',
      [path.join(__dirname, 'seed.py'), dbPath, String(seedCount)],
      { stdio: 'inherit' }
    );
    if (seed.status !== 0) {
      throw new Error('Seeding failed');
    }
    startApi();
    await waitForHealth();
  }

  const summary = path.join(artifacts, `${scenario}-${Date.now()}.json`);
  const script = path.join(__dirname, 'scenarios', `${scenario}.js`);
  console.log(`Running ${scenario}; summary will be written to ${summary}`);

  const result = spawnSync(
    k6Bin,
    ['run', '--summary-export', summary, script],
    {
      cwd: repoRoot,
      stdio: 'inherit',
      env: { ...process.env, API_URL: apiUrl },
    }
  );
  process.exitCode = result.status ?? 1;
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(stopApi);
