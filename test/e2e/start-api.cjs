// Starts the real API against a disposable database for the E2E suite.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const artifacts = path.join(__dirname, '.artifacts');
fs.mkdirSync(artifacts, { recursive: true });

const dbPath = path.join(artifacts, 'e2e.db');
for (const suffix of ['', '-wal', '-shm']) {
  const file = `${dbPath}${suffix}`;
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
}

const child = spawn(
  'dotnet',
  [
    'run',
    '--project',
    'src/DealsSeeker.Api/DealsSeeker.Api.csproj',
    '--no-launch-profile',
    '--urls',
    'http://localhost:5005',
  ],
  {
    cwd: repoRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      ASPNETCORE_ENVIRONMENT: 'Development',
      Database__ConnectionString: `Data Source=${dbPath}`,
      LoggingPersistence__EnableDatabaseSink: 'false',
      ASPNETCORE_URLS: 'http://localhost:5005',
    },
  }
);

function stop() {
  if (!child.killed) {
    child.kill('SIGTERM');
  }
}

process.on('SIGTERM', stop);
process.on('SIGINT', stop);
child.on('exit', (code) => process.exit(code ?? 0));
