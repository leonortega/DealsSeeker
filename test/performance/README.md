# DealsSeeker performance tests

A [k6](https://k6.io/) load-test harness for the API. It is the acceptance gate
described in `ARCHITECTURE.md` §5 (Phase 0) and §6: it turns "supports high
volume" into measured p50/p95/p99, error and throttling numbers.

This is test infrastructure only. It does not change API behaviour, so
`ARCHITECTURE.md` marks the harness as **spec impact: none** and no feature
spec is required.

## Prerequisites

- .NET 10 SDK (the API)
- Node.js 18+ (the runner)
- Python 3 (only for corpus seeding; uses the standard library)
- k6 — install from <https://k6.io/docs/get-started/installation/>

Check the install with `k6 version`. If k6 lives elsewhere, set `K6_BIN` to its
path.

## Quick start

```powershell
node test/performance/run.cjs search-heavy
```

Or from the React Native client directory: `npm run test:perf -- search-heavy`.

The runner creates a disposable SQLite database, starts the API on
`http://localhost:5006`, runs the scenario, writes a k6 summary to
`test/performance/.artifacts/`, and stops the API when it exits.

Other scenarios:

```powershell
node test/performance/run.cjs auth-heavy
node test/performance/run.cjs write-burst
node test/performance/run.cjs soak
```

## Scenarios

| Scenario | Traffic | What it gates |
|---|---|---|
| `search-heavy` | `POST /api/offers/search`, `GET /api/account/me` | Architecture SLOs: search p95 ≤ 150 ms, p99 ≤ 400 ms; account/me p95 ≤ 80 ms |
| `auth-heavy` | repeated `POST /api/auth/login` across a pool of users | Login latency guardrail; no published SLO yet |
| `write-burst` | offer create → favourite → availability vote | Write-latency guardrail; zero real failures while throttled |
| `soak` | low-rate search + account/me for a long duration | Memory growth, cache hit rate, log growth, janitor effectiveness via `/metrics` |

Three scenarios are mandatory for Phase 0 (`search-heavy`, `auth-heavy`,
`write-burst`); `soak` implements the extended run in §6.

## Configuration

All knobs are environment variables. Defaults keep a single-host run below the
API's built-in rate limits so latency is not distorted by throttling.

| Variable | Default | Purpose |
|---|---|---|
| `API_URL` | `http://localhost:5005` | Target API (the runner overrides this with its own port) |
| `DURATION` | `30s` | Scenario duration; soak should be minutes/hours |
| `SEARCH_RPS` | `1` | Search arrivals/s (search policy allows 60/min) |
| `AUTH_RPS` | `4` | Login arrivals/s (global policy allows 300/min) |
| `WRITE_RPS` | `4` | Write iterations/s |
| `SOAK_RPS` | `2` | Soak arrivals/s |
| `AUTH_USERS` | `5` | Size of the login pool |
| `SEARCH_P95_MS` / `SEARCH_P99_MS` | `150` / `400` | Search SLOs |
| `ACCOUNT_ME_P95_MS` | `80` | account/me SLO |
| `GUARDRAIL_P95_MS` | `500` | Tripwire for endpoints without a published SLO |
| `MAX_ERROR_RATE` | `0.01` | Allowed `http_req_failed` rate |
| `QUERY`, `LAT`, `LNG`, `RADIUS_METERS` | `coffee`, NYC, `1000` | Search request shape |
| `SEED_OFFERS` | `0` | Offers to seed into the disposable DB before the run |
| `K6_BIN` | `k6` | k6 executable |

Example — a 10k-corpus baseline:

```powershell
$env:SEED_OFFERS = "10000"
$env:DURATION = "2m"
node test/performance/run.cjs search-heavy
```

## Seeding a larger corpus

The default seeded DB has three offers, which is too small for the corpus-size
checks in Phase 2. To create a 10k/100k/1M corpus:

1. Start the API once against the target database so migrations are applied.
2. Stop the API.
3. Run `python test/performance/seed.py <db-path> <count>`.
4. Start the API again and run k6 against it.

`run.cjs` automates this when `SEED_OFFERS` is set. The seeder inserts offers
and tags directly with SQLite, so 100k rows take seconds rather than one HTTP
request each.

## Rate limiting and 429s

The API has a global per-IP limiter (300 req/min), plus search (60/min) and
location (30/min) policies. A single-host load test can legitimately be
throttled. `common.js` marks 429 as an expected response so `http_req_failed`
measures *real* failures, accepts 429 in the scenario checks, and publishes
`rate_limited_requests` as a separate metric. Do not raise RPS and then read a
throttled run as a latency regression: check the 429 counter first. A run where
that counter dominates means the limiter was the bottleneck, not the API.

## Capturing the Phase 0 baseline

The Phase 0 exit criterion is a documented baseline: p50/p95/p99 per endpoint,
DB query count per request, and failure rate at target RPS.

1. Run `search-heavy`, `auth-heavy` and `write-burst` with the chosen RPS and a
   representative corpus.
2. Copy the generated `.artifacts/<scenario>-<timestamp>.json` summaries next
   to this README (or into your report) and record the target RPS and corpus
   size alongside them.
3. Query `/metrics` during the run for RED metrics and custom meters
   (`DealsSeeker.Api.Cache`, `DealsSeeker.Api.Search`).
4. For soak, sample process memory and the `logs` table growth before and after
   the run to verify the janitor is effective.

## Soak / observability

While `soak` is running, scrape the API and watch the process:

```powershell
curl http://localhost:5006/metrics
curl http://localhost:5006/health/ready
```
