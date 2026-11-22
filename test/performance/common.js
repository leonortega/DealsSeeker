import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';
import {
  API_URL,
  PASSWORD,
  QUERY,
  LAT,
  LNG,
  RADIUS_METERS,
} from './config.js';

export const rateLimited = new Counter('rate_limited_requests');
export const unexpectedResponses = new Counter('unexpected_responses');

// The API's per-IP limiter legitimately returns 429 under load. Treat it as an
// expected response so `http_req_failed` measures real failures, then count
// throttling separately as its own metric.
export function acceptKnownStatuses() {
  http.setResponseCallback(http.expectedStatuses(200, 201, 204, 429));
}

acceptKnownStatuses();

export function authHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export function record(response, endpoint, expectedStatuses) {
  if (response.status === 429) {
    rateLimited.add(1, { endpoint });
  } else if (!expectedStatuses.includes(response.status)) {
    unexpectedResponses.add(1, { endpoint });
  }
  return response;
}

// Throttling is a valid outcome when a run exceeds the API's rate limits.
// Checks should not fail on 429; the rate_limited_requests metric records it.
export function isExpected(response, status) {
  return response.status === status || response.status === 429;
}

export function searchPayload() {
  return JSON.stringify({
    query: QUERY,
    userLocation: { lat: LAT, lng: LNG },
    radiusMeters: RADIUS_METERS,
    locale: 'en',
    favoritesOnly: false,
    page: 1,
    pageSize: 20,
  });
}

export function registerAndLogin(prefix, suffix = '') {
  const email = `${prefix}${suffix}-${__VU}-${Date.now()}@example.com`;
  const body = JSON.stringify({ displayName: `${prefix} User`, email, password: PASSWORD });

  const register = http.post(`${API_URL}/api/auth/register`, body, {
    headers: authHeaders(),
    tags: { endpoint: 'setup_register' },
  });
  check(register, { 'setup: register accepted': (r) => r.status === 200 });

  const login = http.post(`${API_URL}/api/auth/login`, JSON.stringify({ email, password: PASSWORD }), {
    headers: authHeaders(),
    tags: { endpoint: 'setup_login' },
  });
  check(login, {
    'setup: login accepted': (r) => r.status === 200 && Boolean(r.json('accessToken')),
  });

  return { email, password: PASSWORD, token: login.json('accessToken') };
}
