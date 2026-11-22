// Read-heavy baseline: POST /api/offers/search and GET /api/account/me.
// Source of the SLOs: ARCHITECTURE.md §6 (p95/p99 at target RPS).
import http from 'k6/http';
import { check, group } from 'k6';
import {
  API_URL,
  DURATION,
  SEARCH_RPS,
  SLO,
} from '../config.js';
import {
  acceptKnownStatuses,
  authHeaders,
  isExpected,
  record,
  registerAndLogin,
  searchPayload,
} from '../common.js';

export const options = {
  scenarios: {
    search: {
      executor: 'constant-arrival-rate',
      rate: SEARCH_RPS,
      timeUnit: '1s',
      duration: DURATION,
      preAllocatedVUs: 2,
      maxVUs: 20,
    },
  },
  thresholds: {
    'http_req_duration{endpoint:search}': [
      `p(95)<${SLO.searchP95}`,
      `p(99)<${SLO.searchP99}`,
    ],
    'http_req_duration{endpoint:account_me}': [`p(95)<${SLO.accountMeP95}`],
    'http_req_failed': [`rate<${SLO.maxErrorRate}`],
  },
};

export function setup() {
  acceptKnownStatuses();
  return registerAndLogin('perf-search');
}

export default function (data) {
  const headers = authHeaders(data.token);

  group('POST /api/offers/search', () => {
    const response = record(
      http.post(`${API_URL}/api/offers/search`, searchPayload(), {
        headers,
        tags: { endpoint: 'search' },
      }),
      'search',
      [200]
    );
    check(response, { 'search returns 200 (or 429)': (r) => isExpected(r, 200) });
  });

  group('GET /api/account/me', () => {
    const response = record(
      http.get(`${API_URL}/api/account/me`, {
        headers,
        tags: { endpoint: 'account_me' },
      }),
      'account_me',
      [200]
    );
    check(response, { 'account/me returns 200 (or 429)': (r) => isExpected(r, 200) });
  });
}
