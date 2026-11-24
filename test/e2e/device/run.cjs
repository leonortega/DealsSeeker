// Maestro-based device E2E runner for the mobile-only client.
// Registers a fresh user via the API, then runs every flow with unique credentials.
const { spawnSync } = require('child_process');
const path = require('path');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5005';
const APP_ID = 'com.anonymous.dealsseekerreactnative';
const DEVICE_SERIAL = process.env.DEVICE_SERIAL || 'emulator-5554';
const flowsDir = path.join(__dirname, 'flows');

const javaBin = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin') : '';
const maestroBin = path.join(process.env.LOCALAPPDATA || '', 'DealsSeeker', 'Maestro', 'maestro', 'bin');
const adbDir = path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk', 'platform-tools');
const adbPath = process.env.ADB_PATH || path.join(adbDir, 'adb.exe');

process.env.PATH = [javaBin, maestroBin, adbDir, process.env.PATH].filter(Boolean).join(path.delimiter);
process.env.MAESTRO_CLI_NO_ANALYTICS = '1';
process.env.MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED = 'true';
process.env.MAESTRO_DRIVER_STARTUP_TIMEOUT = process.env.MAESTRO_DRIVER_STARTUP_TIMEOUT || '120000';

const allFlows = [
  'app-shell-modal-back.yaml',
  'auth-register.yaml',
  'auth-login-logout.yaml',
  'auth-invalid.yaml',
  'offers-search.yaml',
  'offers-favorite.yaml',
  'offers-comment.yaml',
  'ux-mode-switch.yaml',
  'ux-persistence.yaml',
  'ux-query-persistence.yaml',
  'ux-no-results.yaml',
  'ux-landscape.yaml',
  'ux-help.yaml',
  'ux-create-fab.yaml',
];
const flows = process.env.E2E_FLOWS ? process.env.E2E_FLOWS.split(',').filter(Boolean) : allFlows;

async function register(email, displayName) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName, email, password: 'password1' }),
  });
  if (!response.ok) {
    throw new Error(`Could not register ${email}: ${response.status} ${await response.text()}`);
  }
}

async function seedOffer(email) {
  const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password1' }),
  });
  if (!loginResponse.ok) {
    throw new Error(`Could not log in ${email} to seed an offer`);
  }
  const { accessToken } = await loginResponse.json();
  const response = await fetch(`${API_BASE_URL}/api/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      description: 'Main Street Cafe coffee at 50% off',
      tags: ['coffee', 'cafe'],
      images: [
        {
          source: 'gallery',
          mimeType: 'image/png',
          sizeBytes: 68,
          width: 1,
          height: 1,
          order: 0,
          dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        },
      ],
      location: { source: 'manual', label: 'New York', position: { lat: 40.7128, lng: -74.006 } },
    }),
  });
  if (!response.ok) {
    throw new Error(`Could not seed offer: ${response.status} ${await response.text()}`);
  }
}

async function main() {
  const maestro = spawnSync('maestro', ['--version'], { stdio: 'ignore', shell: process.platform === 'win32' });
  if (maestro.status !== 0) {
    console.error('maestro CLI not found on PATH. See test/e2e/device/README.md.');
    process.exit(2);
  }

  const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const email = `e2e-${stamp}@example.com`;
  const newEmail = `e2e-new-${stamp}@example.com`;

  try {
    await register(email, 'E2E suite');
    await seedOffer(email);
  } catch (error) {
    console.error(`SETUP FAIL: ${error.message}`);
    process.exit(1);
  }

  // The feed filters by radius; pin the emulator to the seeded offers' area.
  spawnSync(adbPath, ['-s', DEVICE_SERIAL, 'shell', 'geo', 'fix', '-74.006', '40.7128'], { stdio: 'ignore' });

  // One Maestro session for the whole suite: each flow resets its own app state
  // with `launchApp: clearState: true`, so no driver restart between flows.
  const result = spawnSync(
    'maestro',
    [
      'test',
      '-e',
      `EMAIL=${email}`,
      '-e',
      `NEW_EMAIL=${newEmail}`,
      ...flows.map((flow) => path.join(flowsDir, flow)),
    ],
    { stdio: 'inherit', shell: process.platform === 'win32' }
  );

  console.log(`\nDevice E2E: ${result.status === 0 ? 'PASS' : 'FAIL'} (${flows.length} flows, single session).`);
  process.exit(result.status === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
