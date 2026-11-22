// Write-heavy baseline: offer creation, favourite toggle and availability vote.
// This scenario intentionally pushes past the global per-IP limiter when
// WRITE_RPS is raised; 429s are counted separately from real failures.
import http from 'k6/http';
import { check, group } from 'k6';
import {
  API_URL,
  DURATION,
  WRITE_RPS,
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
    writes: {
      executor: 'constant-arrival-rate',
      rate: WRITE_RPS,
      timeUnit: '1s',
      duration: DURATION,
      preAllocatedVUs: 2,
      maxVUs: 20,
    },
  },
  thresholds: {
    'http_req_duration{endpoint:offer_create}': [`p(95)<${SLO.guardrailP95}`],
    'http_req_failed': [`rate<${SLO.maxErrorRate}`],
  },
};

export function setup() {
  acceptKnownStatuses();
  return registerAndLogin('perf-write');
}

export default function (data) {
  const headers = authHeaders(data.token);
  const stamp = `${__VU}-${__ITER}`;

  const created = record(
    http.post(`${API_URL}/api/offers`, JSON.stringify({
      description: `Load test offer ${stamp}`,
      tags: ['coffee', 'deal'],
      images: [],
      location: {
        source: 'manual',
        label: 'Load test',
        position: { lat: 40.7131, lng: -74.0055 },
      },
    }), { headers, tags: { endpoint: 'offer_create' } }),
    'offer_create',
    [201]
  );
  check(created, { 'offer create returns 201 (or 429)': (r) => isExpected(r, 201) });

  const offerId = created.json('offerId');
  if (!offerId) {
    return;
  }

  group('POST /api/offers/{id}/favorite', () => {
    const response = record(
      http.post(`${API_URL}/api/offers/${offerId}/favorite`, JSON.stringify({ isFavorite: true }), {
        headers,
        tags: { endpoint: 'offer_favorite' },
      }),
      'offer_favorite',
      [200]
    );
    check(response, { 'favorite returns 200 (or 429)': (r) => isExpected(r, 200) });
  });

  group('POST /api/offers/{id}/availability', () => {
    const response = record(
      http.post(`${API_URL}/api/offers/${offerId}/availability`, JSON.stringify({ vote: 1 }), {
        headers,
        tags: { endpoint: 'offer_vote' },
      }),
      'offer_vote',
      [200]
    );
    check(response, { 'vote returns 200 (or 429)': (r) => isExpected(r, 200) });
  });
}
