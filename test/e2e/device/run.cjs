// Maestro-based device E2E runner for the mobile-only client.
// One API setup, one driver session. Auth flows keep isolated state; the
// remaining flows share a single login via a generated parent flow.
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
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

const authFlows = ['auth-register.yaml', 'auth-invalid.yaml', 'auth-login-logout.yaml'];
const sharedFlows = [
  'app-shell-modal-back.yaml',
  'offers-search.yaml',
  'offers-favorite.yaml',
  'offers-comment.yaml',
  'offer-vote.yaml',
  'offer-report-prefill.yaml',
  'add-offer-submit.yaml',
  'suggestions-submit.yaml',
  'reports-submit.yaml',
  'account-settings.yaml',
  'ux-mode-switch.yaml',
  'ux-persistence.yaml',
  'ux-query-persistence.yaml',
  'ux-no-results.yaml',
  'ux-landscape.yaml',
  'ux-help.yaml',
  'ux-create-fab.yaml',
];
const allFlows = [...authFlows, ...sharedFlows];
const flows = process.env.E2E_FLOWS ? process.env.E2E_FLOWS.split(',').filter(Boolean) : allFlows;

const PARENT_PREAMBLE = `appId: ${APP_ID}
---
- launchApp:
    clearState: true
- tapOn: { text: "Fetch development servers", optional: true }
- waitForAnimationToEnd
- tapOn: { text: "DealsSeeker", index: 1, optional: true }
- tapOn: { point: "88%,47%", optional: true }
- tapOn:
    text: "Continue"
    optional: true
- extendedWaitUntil:
    visible: "Sign in"
    timeout: 20000
- tapOn: "Email"
- inputText: \${EMAIL}
- tapOn: "Password"
- inputText: "password1"
- hideKeyboard
- waitForAnimationToEnd
- tapOn:
    point: "50%,76%"
- tapOn:
    text: "Got it"
    optional: true
- assertVisible: "Feed"
`;

const FLOW_RESET = `- tapOn: { text: "Keep editing", optional: true }
- tapOn: { text: "Close", optional: true }
- tapOn: { text: "Offers", optional: true }
- tapOn: { text: "Feed", optional: true }
- tapOn: { text: "View all", optional: true }
- setOrientation: PORTRAIT
`;

function buildSharedSession(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dealsseeker-maestro-'));
  const shared = files.filter((file) => sharedFlows.includes(file));
  const standalone = files.filter((file) => !sharedFlows.includes(file));

  for (const file of shared) {
    const content = fs.readFileSync(path.join(flowsDir, file), 'utf8');
    const lines = content.split(/\r?\n/);
    const marker = lines.findIndex((line) => line.trim() === '- assertVisible: "Feed"');
    if (marker === -1) {
      throw new Error(`${file}: missing shared-session marker '- assertVisible: "Feed"'`);
    }
    const body = lines.slice(marker + 1).join('\n');
    fs.writeFileSync(path.join(dir, file), `appId: ${APP_ID}\n---\n${FLOW_RESET}${body}\n`);
  }

  const parentPath = path.join(dir, 'suite.yaml');
  const runFlows = shared.map((file) => `- runFlow: ${file}`).join('\n');
  fs.writeFileSync(parentPath, `${PARENT_PREAMBLE}${runFlows}\n`);

  return { dir, parentPath, standalone, shared };
}

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

  // The emulator and app are expected to be running already. Only pin the
  // location so seeded offers fall inside the default search radius.
  spawnSync(adbPath, ['-s', DEVICE_SERIAL, 'shell', 'geo', 'fix', '-74.006', '40.7128'], { stdio: 'ignore' });

  let generated;
  try {
    generated = buildSharedSession(flows);
  } catch (error) {
    console.error(`FLOW GENERATION FAIL: ${error.message}`);
    process.exit(1);
  }

  const files = [
    ...generated.standalone.map((file) => path.join(flowsDir, file)),
    generated.parentPath,
  ];

  console.log(`Device E2E: ${generated.standalone.length} isolated auth flow(s) + ${generated.shared.length} shared-session flow(s).`);
  const result = spawnSync(
    'maestro',
    ['test', '-e', `EMAIL=${email}`, '-e', `NEW_EMAIL=${newEmail}`, ...files],
    { stdio: 'inherit', shell: process.platform === 'win32' }
  );

  fs.rmSync(generated.dir, { recursive: true, force: true });
  console.log(`\nDevice E2E: ${result.status === 0 ? 'PASS' : 'FAIL'} (${flows.length} flows, one session).`);
  process.exit(result.status === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
