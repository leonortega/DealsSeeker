// Shared configuration for the DealsSeeker k6 harness.
// Every value can be overridden with an environment variable, so the same
// scripts serve a local smoke run and the Phase 0 baseline run.

const env = (name, fallback) => (__ENV[name] === undefined ? fallback : __ENV[name]);

export const API_URL = env('API_URL', 'http://localhost:5005').replace(/\/$/, '');
export const DURATION = env('DURATION', '30s');
export const PASSWORD = env('PASSWORD', 'password1');

// The API applies a global per-IP limiter (300 req/min) and a search limiter
// (60 req/min). Defaults stay under those ceilings so latency is not distorted
// by 429s; raise them deliberately for burst/soak runs.
export const SEARCH_RPS = Number(env('SEARCH_RPS', '1'));
export const AUTH_RPS = Number(env('AUTH_RPS', '4'));
export const WRITE_RPS = Number(env('WRITE_RPS', '4'));
export const SOAK_RPS = Number(env('SOAK_RPS', '2'));
export const AUTH_USERS = Number(env('AUTH_USERS', '5'));

// Targets from ARCHITECTURE.md §6. The guardrail is a local tripwire for
// endpoints that have no published SLO yet.
export const SLO = {
  searchP95: Number(env('SEARCH_P95_MS', '150')),
  searchP99: Number(env('SEARCH_P99_MS', '400')),
  accountMeP95: Number(env('ACCOUNT_ME_P95_MS', '80')),
  guardrailP95: Number(env('GUARDRAIL_P95_MS', '500')),
  maxErrorRate: Number(env('MAX_ERROR_RATE', '0.01')),
};

export const QUERY = env('QUERY', 'coffee');
export const LAT = Number(env('LAT', '40.7131'));
export const LNG = Number(env('LNG', '-74.0055'));
export const RADIUS_METERS = Number(env('RADIUS_METERS', '1000'));
