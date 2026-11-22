// CPU-heavy baseline: repeated POST /api/auth/login for a pool of users.
// No published latency SLO exists for login; a guardrail trips obvious
// regressions and the summary reports the actual p50/p95/p99.
import http from 'k6/http';
import { check, group } from 'k6';
import {
  API_URL,
  AUTH_RPS,
  AUTH_USERS,
  DURATION,
  PASSWORD,
  SLO,
} from '../config.js';
import {
  acceptKnownStatuses,
  authHeaders,
  isExpected,
  record,
  registerAndLogin,
} from '../common.js';

export const options = {
  scenarios: {
    auth: {
      executor: 'constant-arrival-rate',
      rate: AUTH_RPS,
      timeUnit: '1s',
      duration: DURATION,
      preAllocatedVUs: 2,
      maxVUs: 20,
    },
  },
  thresholds: {
    'http_req_duration{endpoint:auth_login}': [`p(95)<${SLO.guardrailP95}`],
    'http_req_failed': [`rate<${SLO.maxErrorRate}`],
  },
};

export function setup() {
  acceptKnownStatuses();
  const users = [];
  for (let i = 0; i < AUTH_USERS; i += 1) {
    users.push(registerAndLogin('perf-auth', `-${i}`));
  }
  return { users };
}

export default function (data) {
  const user = data.users[__VU % data.users.length];

  group('POST /api/auth/login', () => {
    const response = record(
      http.post(`${API_URL}/api/auth/login`, JSON.stringify({ email: user.email, password: PASSWORD }), {
        headers: authHeaders(),
        tags: { endpoint: 'auth_login' },
      }),
      'auth_login',
      [200]
    );
    check(response, { 'login returns 200 (or 429)': (r) => isExpected(r, 200) });
  });
}
