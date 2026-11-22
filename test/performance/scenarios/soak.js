// Extended run for §6 soak checks: memory growth, cache hit rate, logs growth
// and janitor effectiveness. k6 supplies steady traffic; scrape /metrics and
// watch the API process while it runs.
import http from 'k6/http';
import { check } from 'k6';
import {
  API_URL,
  DURATION,
  SOAK_RPS,
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
    soak: {
      executor: 'constant-arrival-rate',
      rate: SOAK_RPS,
      timeUnit: '1s',
      duration: DURATION,
      preAllocatedVUs: 2,
      maxVUs: 10,
    },
  },
  thresholds: {
    'http_req_failed': [`rate<${SLO.maxErrorRate}`],
  },
};

export function setup() {
  acceptKnownStatuses();
  return registerAndLogin('perf-soak');
}

export default function (data) {
  const headers = authHeaders(data.token);

  const search = record(
    http.post(`${API_URL}/api/offers/search`, searchPayload(), {
      headers,
      tags: { endpoint: 'soak_search' },
    }),
    'soak_search',
    [200]
  );
  check(search, { 'search returns 200 (or 429)': (r) => isExpected(r, 200) });

  const me = record(
    http.get(`${API_URL}/api/account/me`, { headers, tags: { endpoint: 'soak_account_me' } }),
    'soak_account_me',
    [200]
  );
  check(me, { 'account/me returns 200 (or 429)': (r) => isExpected(r, 200) });
}
