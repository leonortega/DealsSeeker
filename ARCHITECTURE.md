# DealsSeeker — Architecture Improvement Proposal

**Status:** Draft (proposal — no code changes applied)
**Scope:** `DealsSeeker.Api` (ASP.NET Core 10 Minimal API), `DealsSeeker.Shared`, `DealsSeeker.ReactNative`
**Author:** Architecture review, Nov 2026
**Driving requirement:** support a large volume of calls (read-heavy search + auth-heavy traffic, plus write bursts for votes/favorites/comments).

---

## 1. Context

### 1.1 Current topology

```
React Native client
      │  fetch() per interaction (no debounce, no cancellation)
      ▼
ASP.NET Core 10 Minimal API (Program.cs, 453 lines, ~20 lambda endpoints)
      │
      ├── IAuthService          (DapperAuthService)   → session/profile resolution
      ├── IOfferService         (DapperOfferService)  → search, CRUD, votes, favorites, reports
      ├── ICommentService       (DapperCommentService)
      ├── IFeedbackService      (DapperFeedbackService)
      ├── ILocationLookupService(PhotonLocationLookupService)
      │        └── Photon HTTP geocoder
      │
      ▼
SQLite (single file: Data/dealseeker.db)  via Dapper + Microsoft.Data.Sqlite
      ▲
      └── Serilog → Console + File (Logs/dealseeker-.log) + SqliteLogEventSink (same DB file!)
```

### 1.2 What is already good

These should be preserved; most proposals build on them rather than replacing them.

- **Clean persistence boundary.** `IDbConnectionFactory` (`Persistence/IDbConnectionFactory.cs`) isolates the storage engine, so the SQLite → PostgreSQL migration path (#20) is viable without touching services.
- **Service boundaries per bounded context.** `IOfferService`, `IAuthService`, `ICommentService`, `IFeedbackService`, `ILocationLookupService` map cleanly onto the spec's bounded contexts.
- **DI lifetimes are correct.** `IDbConnectionFactory` is a singleton; services are scoped; `AddHttpClient<T>` is used for the external map providers.
- **Migrations are versioned and tracked** (`schema_migrations` table, `Persistence/Migrations/*.sql`), so schema changes are safe to apply incrementally.
- **Specs exist and are behavioural.** `specs/` follows a spec-first flow, which is exactly what changes #4, #11, #13 and #18 need.

### 1.3 Root causes of the current scaling ceiling

Every problem below reduces to one of four root causes:

| # | Root cause | Symptom |
|---|-----------|----------|
| R1 | **Blocking, uncached, on-thread I/O** | Latency scales linearly with request volume; thread pool exhaustion |
| R2 | **SQLite configured for single-user desktop use** | `SQLITE_BUSY` failures under any concurrency |
| R3 | **Work is proportional to the whole corpus, not the request** | Per-request cost grows with data volume, not with page size |
| R4 | **No caching, no limits, no protection layer** | Nothing absorbs spikes; nothing bounds a single caller |

---

## 2. Goals and non-goals

### Goals

1. **Bounded per-request cost** — a search for 20 results must cost roughly the same as a search for 200.
2. **No per-request blocking I/O on the request thread** — all persistence and log writes off the hot path.
3. **Graceful degradation** — external geocoding (Photon) fails without taking the API down.
4. **Defensible under abuse** — rate limits, payload caps, timeouts, circuit breakers.
5. **Observable** — p50/p95/p99 per endpoint, DB timings, queue depths, cache hit rates.
6. **Store-portable** — a documented path to PostgreSQL if write throughput outgrows SQLite.

### Non-goals

- Rewriting the domain model or the spec set.
- Changing user-visible behaviour without a spec change first (per `AGENTS.md`).
- Introducing a message broker, service mesh or microservices split. The current single-process topology is correct for this scale.

---

## 3. The 21 improvements

Each item states the problem with evidence, the impact, the concrete proposal, and the spec/contract impact.

---

### ⭐ 1. The SQLite log sink writes on the request thread, per log event — **highest priority**

**Problem.** `src/DealsSeeker.Api/Logging/SqliteLogEventSink.cs:20-70`. `Emit()` is a synchronous `ILogEventSink` implementation. For **every** log event it:

1. constructs a `new SqliteConnection(_connectionString)` and opens it (file handle + pragmas),
2. executes a single `INSERT INTO logs (...)`,
3. closes it.

It writes into the **same `Data/dealseeker.db`** that the application reads and writes. The sink is **enabled by default** (`src/DealsSeeker.Api/appsettings.json:44-47`):

```json
"LoggingPersistence": { "EnableDatabaseSink": true, "MinimumLevel": "Information" }
```

**Impact.**

- Every request pays several synchronous file opens + writes on the request thread.
- Log writes contend with business writes on the same SQLite file → this is a primary source of `SQLITE_BUSY` / `database is locked` 500s under load (see #2).
- The `logs` table grows unbounded; there is no pruning and no retention policy. `002_logging_table.sql` creates indexes on `timestamp_utc` and `level`, so the table also grows the file and slows every insert as it does.
- A failure inside `Emit` is swallowed (`catch { }`, line 66-69), so log volume problems are invisible until the DB is unhealthy.

**Proposal.**

1. **Move logs to a separate database file.** `LoggingPersistence:ConnectionString` → `Data Source=Data/dealseeker-logs.db`. Business data and log data must never share a file. This alone removes the contention class entirely.
2. **Replace the hand-written sink with a buffered, batched writer.**
   - Keep `SqliteLogEventSink` as the *writer*, but drive it from a `System.Threading.Channels.Channel<LogEvent>` (unbounded or bounded with `BoundedChannelFullMode.DropOldest`).
   - A single background task drains the channel in batches (e.g. up to 500 events or 200ms, whichever comes first) and writes them with **one multi-row `INSERT`** inside a single transaction.
   - Serilog's own `Serilog.Sinks.Async` package is the lower-effort alternative: wrap the sink with `.WriteTo.Async(a => a.Sink(sink))`. It provides exactly the buffering + background batching needed. **Prefer `Serilog.Sinks.Async`**; use the custom `Channel` only if batch-level control is required.
3. **Never open a connection per event.** The background writer owns one long-lived connection, opened lazily and re-opened on failure.
4. **Add a retention job.** A daily timer deletes rows older than N days (configurable, default 14) and `VACUUM`s periodically (or uses `PRAGMA auto_vacuum = INCREMENTAL` + `incremental_vacuum`).
5. **Change the default.** `EnableDatabaseSink` should default to `false` in Production and `true` only in Development. Log to stdout/file and let the platform collect it.
6. **Make failures observable.** Replace the empty `catch` with a counter (`logs_dropped_total`) and a rate-limited warning, so a broken sink is visible rather than silent.

**Spec impact:** none (internal, no observable product behaviour). Add an `APP.LOGGING.*` requirement for bounded log retention if the retention window becomes user-visible via an admin view.

**Effort:** M. **Risk:** low — behaviour preserved, only buffering changes.

---

### 2. SQLite is not configured for concurrency

**Problem.** `src/DealsSeeker.Api/Persistence/SqliteConnectionFactory.cs:14-21` sets exactly one pragma:

```csharp
await connection.ExecuteAsync("PRAGMA foreign_keys = ON;");
```

Missing pragmas, with their defaults:

| Pragma | Default | Consequence |
|---|---|---|
| `journal_mode` | `DELETE` | A reader and a writer block each other for the whole transaction. |
| `busy_timeout` | `0` | A lock collision fails **immediately** instead of waiting. |
| `synchronous` | `FULL` | fsync on every commit → ~1-10ms per write, and writes serialise. |
| `cache_size` | `-2000` (2MB) | Small page cache; repeated re-reads. |
| `temp_store` | `DEFAULT` | Temp tables/sort spill to disk. |
| `mmap_size` | `0` | No memory-mapped I/O. |

**Impact.** Under concurrent requests this produces intermittent `SqliteException: database is locked` (error code 5), surfacing as HTTP 500. Combined with #1 (log writes on the same file) the failure rate compounds. `busy_timeout = 0` means a transient lock is fatal rather than retried.

**Proposal.** Configure the connection once, on creation, in a single batched statement:

```sql
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;      -- 64 MB page cache
PRAGMA temp_store = MEMORY;
PRAGMA foreign_keys = ON;
PRAGMA mmap_size = 268435456;    -- 256 MB
```

- `journal_mode=WAL` is the single most important change: readers no longer block the writer.
- `busy_timeout=5000` converts transient contention into a 5s wait instead of an immediate failure.
- `synchronous=NORMAL` is durable under WAL except on OS/power loss — acceptable for this data set; document the trade-off.
- Execute all pragmas in **one** `ExecuteAsync` call with a multi-statement script rather than one round trip each (see #3).

**Spec impact:** none (internal).

**Effort:** S. **Risk:** low — `WAL` requires the DB file to be on a filesystem that supports shared memory (not a network share); this must be checked before deploying.

---

### 3. No connection pooling

**Problem.** `Persistence/SqliteConnectionFactory.cs:16-20` — a **new** `SqliteConnection` is constructed and opened for every logical operation. A single authenticated request opens **at least two**:

- one in `GetProfileByTokenAsync` (`Services/Auth/DapperAuthService.cs:128`),
- one in the service method (`Services/Offers/DapperOfferService.cs:21`).

Each open costs a file handle, a header read, and (currently) a pragma round trip.

**Impact.** File-handle churn and syscall overhead dominate the cost of small queries. Under load this also amplifies the `SQLITE_BUSY` window from #2, because more connections means more lock attempts.

**Proposal.**

- **Use `SqliteDataSource`** (available since `Microsoft.Data.Sqlite` 8.0; this project is on 10.0.5). It manages a connection pool internally and applies connection-level configuration once per pooled connection instead of once per request:

  ```csharp
  var dataSource = new SqliteDataSource(connectionString);
  var connection = await dataSource.OpenConnectionAsync(ct);   // pooled
  ```

  `SqliteDataSource` exposes `SqliteConnectionOptions`/`SqliteDataSourceBuilder` for the pragmas from #2, so they are applied at pool-construction time.

- Register the data source as a **singleton** and have `IDbConnectionFactory` delegate to it — this preserves the existing abstraction and keeps `IDbConnectionFactory` as the single seam for #20.
- Keep the per-connection `PRAGMA foreign_keys = ON` semantics: SQLite `foreign_keys` is per-connection, so it must be set on every connection *including pooled ones* (the data source builder can carry it, or set it in `OpenAsync` — one statement, negligible).
- Long-lived pooled connections must survive `Data Source` file moves; log the resolved path at startup (already done, `Program.cs:92-98`).

**Spec impact:** none (internal).

**Effort:** S. **Risk:** low.

---

### 4. `SearchAsync` loads the entire offers table on every request

**Problem.** `Services/Offers/DapperOfferService.cs:19-210`. The search path is:

1. `SELECT ... FROM offers WHERE is_active = 1;` (lines 23-38) — **no LIMIT, no pagination, no server-side radius filter**.
2. `SELECT ... FROM offer_tags WHERE offer_id IN @OfferIds` (lines 47-53).
3. `SELECT ... FROM offer_images WHERE offer_id IN @OfferIds` (lines 55-64).
4. `SELECT offer_id FROM offer_availability_votes WHERE user_id = @UserId AND offer_id IN @OfferIds` (lines 70-77).
5. `SELECT offer_id FROM offer_favorites WHERE user_id = @UserId AND offer_id IN @OfferIds` (lines 79-86).
6. `SELECT ... FROM promoted_offers WHERE offer_id IN @OfferIds` (lines 89-101).
7. In-memory Haversine + fuzzy matching over **every** row (lines 126-163), then full in-memory sort (lines 165-193).

`SearchOffersRequest` (`src/DealsSeeker.Shared/Contracts/Offers/SearchOffersRequest.cs`) has `RadiusMeters = 1000` and **no page size, no maximum radius, no query length cap**.

**Impact.** This is the single largest scaling cliff:

- Per-request cost is `O(corpus)`, not `O(page)`.
- `IN @OfferIds` with an unbounded id list will exceed `SQLITE_MAX_VARIABLE_NUMBER` (default 32766 in current SQLite builds, 999 in older ones) → hard failure as the corpus grows. It also produces multi-megabyte SQL text that must be parsed per request.
- The response payload is unbounded — one request can return the entire database.

**Proposal.**

1. **Paginate.** Add `Page` (1-based) and `PageSize` (default 20, **hard cap 50**) to `SearchOffersRequest`, plus a `HasMore` / `TotalCount` hint on `SearchOffersResponse`. Apply `LIMIT/OFFSET` **before** the in-memory ranking — but see (2): ranking must happen server-side for correctness.
2. **Push the radius filter into SQL.** Add a bounding-box prefilter so the candidate set is small before exact Haversine:
   ```sql
   WHERE is_active = 1
     AND lat BETWEEN @MinLat AND @MaxLat
     AND lng BETWEEN @MinLng AND @MaxLng
   ```
   computed from `RadiusMeters`. Keep the exact Haversine in memory for the survivors (bounding box over-selects at the corners; that is acceptable).
3. **Use an R*Tree virtual table for geo.** SQLite's `rtree` module is the correct tool for "offers within R metres". Create `offer_geo` as an R*Tree over `(offer_id, min_lat, max_lat, min_lng, max_lng)` with a trigger keeping it in sync with `offers`, then join. This turns the geo filter into an index lookup instead of a scan.
4. **Move ranking into SQL.** The current ordering (reported demotion → promoted → relevance → distance) is expressible as `ORDER BY` with a relevance expression, so `LIMIT` can be applied by the database. If a true relevance score is needed, materialise it in a column (see #9) rather than recomputing per request.
5. **Replace the `IN` fan-out with joins.** Tags and images can be fetched with a single `LEFT JOIN` + aggregation, or via a second query keyed on the *page* of offer ids rather than the whole candidate set.
6. **Chunk any remaining `IN` lists** into batches of ≤ 500 parameters as a defensive measure.
7. **Cap `RadiusMeters`** (e.g. 50 000) and `Query.Length` (e.g. 200) at the contract boundary.

**Spec impact:** **behavioural** — `specs/features/offers-view/OFFERS.SEARCH.001.md` and `OFFERS.SEARCH.SMART.001.md` must be updated to define pagination semantics, maximum radius and the response shape; `specs/contracts/json-schema/offer-search-request.schema.json` and `offer-search-response.schema.json` must change; a new BDD scenario in `specs/bdd/` is required. **This item cannot be implemented before the spec is Approved** (per `AGENTS.md`).

**Effort:** L. **Risk:** medium — the ranking order must be preserved exactly to avoid a behavioural regression.

---

### 5. Fuzzy matching is quadratic and allocates on every comparison

**Problem.** `Services/Offers/DapperOfferService.cs:813-935`.

- `EvaluateMatch` loops over every query token and, for each token, loops over **every term** of the offer (`:852-860`).
- Each comparison calls `SimilarityRatio` → `LevenshteinDistance`, which allocates a **full `int[,]` matrix** of size `(sourceLength+1) × (targetLength+1)` **per pair** (`:917-935`).
- The fuzzy loop is **unconditional**: it runs even when the token already matched exactly and `tokenScore` is already `1.0` (the maximum possible). The `if (fuzzyScore > tokenScore)` guard at `:865` is inside the loop, not before it.
- `BuildSearchTerms` (`:789-811`) re-tokenises every offer's description with `Regex.Matches` on **every request**.

**Impact.** Per request: `O(offers × tokens × terms × len²)` with one heap allocation per comparison. At 10 000 offers this dominates request latency and generates GC pressure that affects *all* requests, not just searches.

**Proposal.**

1. **Early exit.** Skip the fuzzy loop when `tokenScore >= 1.0` (exact match, the maximum score). Cheapest possible fix; immediately removes most of the work.
2. **Length-based pre-filter.** If `1 - |len(a) - len(b)| / max(len(a), len(b)) < FuzzySimilarityThreshold` (0.72), the edit distance can never be small enough — skip the comparison entirely. This eliminates the vast majority of pairs.
3. **Replace the matrix with a rolling two-row buffer** (`int[]` of length `targetLength + 1`), reused per call. Allocation drops from `O(len²)` per pair to `O(len)` per pair, and to zero amortised with a pooled buffer.
4. **Cap inputs.** Truncate query tokens and offer terms to a maximum length (e.g. 32 chars) before matching; cap the number of tokens per query (e.g. 10).
5. **Cache the per-offer search document.** The normalised term set for an offer is derived from its description + tags and changes only when the offer changes. Compute once, cache, invalidate on write (see #9). This also removes the per-request `Regex.Matches`.
6. **Replace regex tokenisation with a compiled, span-based splitter** (`RegexOptions.Compiled` + `GeneratedRegex` in .NET 10), or a simple manual scanner over `Rune`s.
7. **Longer term: move to FTS5.** See #4 — a SQLite FTS5 virtual table over description + tags gives exact/prefix matching for free and removes the in-memory fuzzy path entirely for the common case. FTS5's availability in the bundled `e_sqlite3` build should be verified; if absent, it can be enabled at build time.

**Spec impact:** none observable (ranking results must remain equivalent — this is a pure-performance refactor, but the ranking *must* be regression-tested against the existing behaviour, see §6).

**Effort:** M. **Risk:** low for 1-3, medium for 7 (ranking semantics).

---

### 6. Two database round trips for authentication on every request

**Problem.** `src/DealsSeeker.Api/Program.cs:111-430`. Roughly 15 endpoints repeat the same block:

```csharp
if (!TryGetAccessToken(httpContext, out var accessToken)) return Results.Unauthorized();
var profile = await auth.GetProfileByTokenAsync(accessToken, cancellationToken);
if (profile is null) return Results.Unauthorized();
```

`GetProfileByTokenAsync` (`Services/Auth/DapperAuthService.cs:121-166`) opens a connection, joins `auth_sessions` + `users`, and then **string-parses** the expiry with `DateTimeOffset.TryParse` (`:156`). On an expired session it performs a **second write** (revoking the session) on the same connection — a mutation inside what callers believe is a read.

**Impact.** One extra connection open + one extra query + one date parse per authenticated request, on top of the service's own connection. At volume this is a meaningful fraction of total DB work, and it doubles the connection count (amplifying #2 and #3).

**Proposal.**

1. **One authentication handler.** Implement `AuthenticationHandler<AuthenticationSchemeOptions>` (or a simple `IEndpointFilter` + `ICurrentUser` abstraction) that resolves the bearer token once per request and populates `HttpContext.User`. Replace the repeated block with `.RequireAuthorization()` and inject `ICurrentUser` into handlers.
2. **Cache session validity.** `IMemoryCache` keyed by the access token, TTL 30-60s, storing the resolved `UserProfileDto`. Logout writes a "revoked" marker into the same cache, so revocation is immediate rather than TTL-bounded. This removes the DB hit entirely for the vast majority of requests.
3. **Store expiry as epoch millis `INTEGER`** (see #15) so the comparison is `long` vs `long` — no parsing, no culture/round-trip ambiguity.
4. **Do not mutate on read.** Move the "revoke expired session" write to a background janitor task (see #16) rather than doing it inline on a request that should be a read.
5. **Avoid the double write in `UpdateAvatarAsync`/etc.** — not applicable, but keep the principle: reads stay reads.

**Spec impact:** none observable (authentication *behaviour* is unchanged; only the mechanism changes). `ACCOUNT.AUTH.LOGIN.001.md` / `ACCOUNT.PROFILE.001.md` remain valid. If the session TTL or revocation semantics change (e.g. a 60s revocation lag becomes user-visible), those specs must be amended.

**Effort:** M. **Risk:** medium — revocation semantics must stay correct.

---

### 7. No rate limiting

**Problem.** Nothing in `Program.cs` limits request volume. Every endpoint is open, including the expensive ones (`POST /api/offers/search`) and the ones that consume third-party quota (`GET /api/locations/search`, `GET /api/locations/reverse`).

**Impact.** A single misbehaving client (or a retry storm from the React Native app) can saturate the DB, exhaust the thread pool, and exhaust the map provider quota — taking the service down for everyone.

**Proposal.** Use the built-in ASP.NET Core rate limiter (no new dependency):

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 300,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
    options.OnRejected = async (ctx, ct) => { /* 429 + Retry-After */ };
});
```

- **Per-IP global limiter** as a baseline.
- **Per-user-token limiter** on the authenticated group (partition by the resolved user id) so one account cannot monopolise.
- **Tighter, dedicated policies** for the costly endpoints: `/api/locations/search` (protects provider quota), `/api/offers/search`.
- **Endpoint metadata** (`.RequireRateLimiting("search")`) rather than one global number, so tuning is per-endpoint.
- Return `429` with `Retry-After` and a `ProblemDetails` body.
- Emit a `rate_limited_total` metric per policy.

**Spec impact:** **behavioural** — a new rate-limit response is a new observable outcome. Add an `APP.RATE_LIMIT.*` spec (or extend `APP.SHELL.001.md`) defining the limits, the 429 shape and the headers. The client (see #11) must handle 429 with backoff.

**Effort:** S. **Risk:** low.

---

### 8. No response compression, no output caching

**Problem.** `Program.cs` registers neither. Every JSON response is sent uncompressed, and no response is ever reused.

**Impact.** Bandwidth cost scales linearly with response size — and the search response (#4) is currently the largest response the API produces. Over mobile networks this is the dominant client-visible latency.

**Proposal.**

1. **Response compression.** `builder.Services.AddResponseCompression(o => o.EnableForHttps = true)` with Brotli preferred, Gzip fallback, plus `app.UseResponseCompression()` placed **before** the endpoints. Exclude already-compressed content types (images).
2. **Output caching.** `builder.Services.AddOutputCache()` and apply selectively:
   - `GET /api/account/me` — short TTL (30s), varies by `Authorization` header.
   - `GET /api/offers/{offerId}/comments` — short TTL (15s).
   - `GET /api/locations/search` — TTL 5 minutes (see #9).
   - `POST /api/offers/search` — **not** cacheable at the HTTP layer (varies by body); cache it at the service layer instead (#9).
3. **ETag / 304.** The output cache middleware emits `ETag` and handles `If-None-Match` automatically for the cached GETs, so repeat calls cost almost nothing.
4. **Do not cache** anything personalised without varying on `Authorization`.

**Spec impact:** the 304 / ETag behaviour is observable. If implemented, extend the relevant specs (`OFFERS.COMMENTS.001.md`) to state that a conditional request may return 304. Minor.

**Effort:** S. **Risk:** low — **care needed**: never cache a response that varies by user without the correct `Vary`/`SetVaryByHeader` configuration.

---

### 9. No caching layer at all

**Problem.** Nothing in the codebase caches anything. Every request re-derives everything:

- **Promoted offers** are fetched for the whole candidate set and then filtered **in C#** (`DapperOfferService.cs:89-101`, `IsPromotionActive` at `:937-951`).
- **The offer search document** (normalised description tokens + tags) is rebuilt per request (`BuildSearchTerms`, `:789-811`).
- **Tag lexicon synonym expansion** runs per request (`ExpandQueryWithSynonyms`, `:784-787`, backed by `Shared/Tags/TagLexicon.cs`).
- **Geocoding results must be reused** — the public Photon instance is fair-use only, so identical lookups must not become repeated external calls.
- **`avatar_id` normalisation** (`AvatarCatalog.Normalize`) runs per comment row.

**Impact.** Redundant CPU and network work on every request, and no protection against a burst of identical requests.

**Proposal.**

1. **Promoted offers** — filter in SQL and cache:
   ```sql
   SELECT offer_id, priority FROM promoted_offers
   WHERE offer_id IN @OfferIds
     AND (starts_at_utc IS NULL OR starts_at_utc <= @Now)
     AND (ends_at_utc   IS NULL OR ends_at_utc   >= @Now)
   ```
   Cache the full active-promotions map for 30s in `IMemoryCache` (it is a small, hot, rarely-changing set) and apply it to the page's ids only.
2. **Search documents** — cache per offer: `ConcurrentDictionary<string, SearchDocument>` or `IMemoryCache` with the offer id as key, storing the normalised term set. Invalidate on offer write (`AddAsync`, `UpdateAsync`, `DeleteAsync` in `DapperOfferService`). Bound the cache size and evict LRU.
3. **Tag lexicon expansion** — cache by `(locale, normalisedQuery)`. The lexicon is static (`TagLexicon.cs`), so the expansion is a pure function and highly cacheable.
4. **Geocoding** — cache in two layers:
   - **In-process** cache, key = `normalisedQuery` (or rounded coordinate for reverse), TTL 24h for positive results and 5 min for negative results to avoid hammering Photon.
   - **HTTP-level** — set `Cache-Control` on `/api/locations/search` responses so intermediaries can also cache.
5. **General pattern.** Introduce a thin `ICacheService` abstraction over `IMemoryCache` (or use `HybridCache` in .NET 10) so cache keys and TTLs are centralised and metrics (`cache_hit_total` / `cache_miss_total` per key prefix) are consistent. Keep it in `DealsSeeker.Api/Caching/`.
6. **Do not cache** per-user state (favourites/votes) beyond the request — it must stay correct. Only cache the *user-independent* parts (offers, tags, images, promotions, promotions map).

**Spec impact:** none, provided cached results are indistinguishable from fresh ones. **Exception**: if the geocoding cache is allowed to return a slightly stale address label, that is observable — check `ADD.OFFER.LOCATION.001.md` and note the cache TTL there if the spec is strict.

**Effort:** M. **Risk:** medium — cache invalidation on offer write is the main correctness risk; the mutation points are few and well-known.

---

### 10. Geocoding resilience and Photon fair use

**Resolved.** A single `PhotonLocationLookupService` serves both search and reverse lookups. The old Google Maps geocoder, the alternate OpenLayers/Nominatim endpoints, and the provider-selection/fallback layer were removed (`APP.MAP.STACK.001`). Search input is debounced and identical lookups are cached on device and at the API; reverse geocoding happens only on gesture completion (`APP.LOCATION.QUERY.001`).

**Design in place.**

1. **Per-provider timeout.** Configure via `AddHttpClient<T>(c => c.Timeout = TimeSpan.FromSeconds(3))`. For geocoding, 3s is generous.
2. **Resilience pipeline.** Use `Microsoft.Extensions.Http.Resilience` (the supported successor to the standalone Polly packages) to add:
   - **Retry**: 2 attempts, exponential backoff (~200ms, ~1s) — only for transient failures (5xx, 408, network errors) and only for **idempotent GETs**.
   - **Circuit breaker**: failure ratio threshold 50%, 30s break duration, 10s sampling duration.
   - **Timeout**: total-request timeout per attempt, above the client timeout.
3. **Rate limit outbound calls** with `Microsoft.Extensions.Http.Resilience`'s rate limiter, keyed per provider, sized to the provider's quota (and to the API's inbound limit from #7).
4. **Cache aggressively** (see #9) — this reduces outbound volume far more than any retry policy.
5. **Bulkhead / partition per provider** so a failing provider cannot consume the connections of the other.
6. **Propagate the failure reason to the caller** with a distinct response (e.g. `503` with `ProblemDetails`) instead of silently returning `[]`, so the client can distinguish "no results" from "provider down".
7. **Make the API key optional at startup** — currently a missing key throws `InvalidOperationException` on *every* call (`:25-29`), which then triggers the fallback. Validate once at startup and log a clear configuration error.

**Spec impact:** the failure mode of `/api/locations/search` is observable. `ADD.OFFER.LOCATION.001.md` should state the behaviour when all providers fail (currently: empty list). If a distinct `503` is introduced, that is a contract change.

**Effort:** M. **Risk:** medium — the fallback semantics must remain intact.

---

### 11. Client fires a request per keystroke, with no debounce and no cancellation

**Problem.** `src/DealsSeeker.ReactNative/src/api/client.ts`.

- `searchLocations(query)` (`:364`) and `searchOffers(request)` (`:265`) fire immediately on every call. There is **no debounce** and **no `AbortController`**, so a fast typist in the location search box triggers one external geocoding call per character — directly amplified by #9 and #10.
- `AppContext.tsx:137` wraps every call in `runBlocking(...)`, which shows a **global loading overlay**. Concurrent calls therefore serialise the UI as well as the network.
- `getMyProfile` (`:196`) is re-fetched on every navigation and after every 401.
- No retry, no ETag reuse, no client-side cache.

**Impact.** The client is the primary amplifier of request volume. The global overlay also means the user cannot do anything while a request is in flight, which encourages reloads.

**Proposal.**

1. **Debounce inputs.** 300ms for the location search box, 250ms for the offer search / tag filter. Implement in the component (`ImmersiveSearchOverlay.tsx`, `AddOfferScreen.tsx`, `OffersScreen.tsx`) or in the API client as a debounced wrapper.
2. **Cancel superseded requests.** Every API method accepts an optional `AbortSignal`; the client aborts the previous in-flight request for the same logical query. This removes the wasted work server-side *and* the stale-response race.
3. **Replace the global overlay with per-operation loading state.** `runBlocking` should become a per-screen/per-query flag. The global overlay should be reserved for app bootstrap only.
4. **Client-side cache** for the session/profile (in-memory + persisted via `utils/storage.ts`) so `getMyProfile` is not re-fetched on navigation.
5. **Retry with backoff on transient failures** (network error, 502/503/504) — max 2 retries with jittered backoff. **Never** retry 4xx.
6. **Honour `Retry-After`** on 429 (from #7) and surface a user-visible "too many requests" state rather than an infinite spinner.
7. **Coalesce identical in-flight requests** (a simple promise map keyed by URL) so duplicate calls share one network round trip.
8. **Batch/parallelise independent calls** where the UI currently issues them serially (e.g. profile + owned offers on the Account screen).

**Spec impact:** **behavioural** — debounce, cancellation, and the loading-overlay change are observable in the UI. `OFFERS.SEARCH.001.md` and `ADD.OFFER.LOCATION.001.md` should describe the debounce/cancellation behaviour. The 429 handling must be added to the relevant specs.

**Effort:** M. **Risk:** low — mostly client-internal, but cancellation can introduce race conditions if not handled carefully (use a request-sequence counter, not just abort).

---

### 12. Write hot spots on counters

**Problem.**

- `DapperOfferService.cs:424-433` — `VoteAvailabilityAsync` does `UPDATE offers SET positive_availability_count = positive_availability_count + 1 WHERE offer_id = @OfferId`. Every vote on a popular offer serialises on **the same row**.
- `DapperOfferService.cs:451-458` — `ReportAsync` does `UPDATE offers SET report_count = report_count + 1` for the same reason.
- `DapperOfferService.cs:498-500` — `SetFavoriteAsync` issues an extra `SELECT COUNT(1) FROM offers WHERE offer_id = @OfferId` **before** the insert, purely as an existence check, adding a round trip per call.
- `DapperCommentService.cs:55-61` — `AddAsync` does the same `SELECT COUNT(1)` existence probe before inserting.
- SQLite has exactly **one writer**, so all of the above are globally serialised regardless of row.

**Impact.** A burst of votes/favorites/comments on a handful of popular offers becomes a queue; combined with the log sink (#1) writing to the same file, this is where `SQLITE_BUSY` originates.

**Proposal.**

1. **Remove the redundant existence probes.** Fold the check into the statement and rely on the foreign key:
   ```sql
   INSERT OR IGNORE INTO offer_favorites (user_id, offer_id, created_at_utc)
   SELECT @UserId, @OfferId, @CreatedAtUtc
   WHERE EXISTS (SELECT 1 FROM offers WHERE offer_id = @OfferId);
   ```
   or let the FK violation drive the error mapping (catch `SqliteErrorCode == 19` as the code already does elsewhere).
2. **Keep the counters as increments** (they are already atomic in SQL — do not read-modify-write in C#, which would be a race). If a specific offer becomes a hot spot, move the counters to a dedicated `offer_counters` table — that does not fix SQLite's single-writer limit but avoids page contention on the wide `offers` row.
3. **Aggregate counters in memory for extreme hot spots.** Maintain an in-process `ConcurrentDictionary<(offerId, kind), delta>` and flush periodically. Only worth doing if measurement shows a specific hot row; measure first (see #17).
4. **Batch the vote/comment writes.** Where the UI submits a burst (e.g. offline-queued votes), accept a batch endpoint and write in one transaction.
5. **Shorten write transactions.** `VoteAvailabilityAsync` currently holds a transaction across three statements (`SELECT COUNT`, `INSERT`, `UPDATE`). Reducing to two statements shortens the write lock window.
6. **Consider `WITHOUT ROWID`** for the hot join tables (`offer_favorites`, `offer_availability_votes`, `offer_tags`) — they are pure key→value mappings and benefit from the clustered layout.

**Spec impact:** none — the observable vote/report/favourite behaviour is unchanged.

**Effort:** S–M. **Risk:** medium — the error mapping for "offer not found" must remain correct when the existence check is removed (currently `VoteAvailabilityAsync` returns `"Offer not found."` vs `"Availability feedback already submitted."`).

---

### 13. Unbounded comment list

**Problem.** `Services/Comments/DapperCommentService.cs:12-33` — `GetForOfferAsync` returns **every** comment for an offer:

```sql
SELECT ... FROM offer_comments c INNER JOIN users u ON u.user_id = c.user_id
WHERE c.offer_id = @OfferId ORDER BY c.created_at_utc ASC, c.comment_id ASC;
```

There is no `LIMIT`, no paging, and no cap. `GET /api/offers/{offerId}/comments` therefore returns an arbitrarily large array, and the client renders it all.

**Impact.** An offer with thousands of comments produces a multi-megabyte response, a large in-memory DTO list, and a slow mobile render. It is also an easy memory-amplification vector.

**Proposal.**

1. **Paginate** the comments endpoint with a cursor: `?limit=20&after=<createdAtUtc>,<commentId>`. The index `idx_offer_comments_offer_id_created_at (offer_id, created_at_utc)` already supports keyset pagination.
2. **Cap `limit`** (default 20, max 100).
3. **Return a `hasMore` / `nextCursor`** marker in `OfferCommentsResponseDto` (`Shared/Contracts/Comments/OfferCommentsResponseDto.cs`).
4. **Enforce the cap server-side even if the client omits it.**
5. **Consider a count summary** (`totalCount`) computed with a separate cheap `COUNT(*)` rather than by materialising the whole set.

**Spec impact:** **behavioural** — `specs/features/offers-view/OFFERS.COMMENTS.001.md` must define the pagination contract; `specs/contracts/json-schema/offer-comments-response.schema.json` changes; a BDD scenario is required.

**Effort:** S. **Risk:** low.

---

### 14. Missing indexes for the actual access patterns

**Problem.** The schema has these indexes (from the migration files):

| Index | Table |
|---|---|
| `idx_auth_sessions_user_id` | `auth_sessions(user_id)` |
| `idx_auth_sessions_expires_at_utc` | `auth_sessions(expires_at_utc)` |
| `idx_offer_tags_tag` | `offer_tags(tag)` |
| `idx_offer_images_offer_id_sort_order` | `offer_images(offer_id, sort_order)` |
| `idx_offer_favorites_offer_id` | `offer_favorites(offer_id)` |
| `idx_offers_created_by_user_id` | `offers(created_by_user_id)` |
| `idx_offer_comments_offer_id_created_at` | `offer_comments(offer_id, created_at_utc)` |
| `idx_logs_timestamp_utc`, `idx_logs_level` | `logs` |

**Missing**, for patterns the code actually uses:

- `offers(is_active)` — every search scans the table (`DapperOfferService.cs:37`).
- `offers(lat, lng)` — needed for the bounding-box prefilter in #4. A composite index helps modestly; the **R*Tree** in #4 is the real answer.
- `promoted_offers(starts_at_utc, ends_at_utc)` — the promotion window filter is done in C# (#9).
- `offer_availability_votes(user_id)` — the search query filters by `user_id` **and** `offer_id` (`:74`); the PK is `(offer_id, user_id)`, so the leading column does not match the filter.
- `offer_favorites(user_id, offer_id)` — the PK *is* `(user_id, offer_id)`, so this is already covered; the extra `idx_offer_favorites_offer_id` is for the reverse direction. ✅
- `offer_reports(offer_id)` — no index; the FK on `offer_reports` is unenforced for reads.
- `users(email)` — covered by the `UNIQUE` constraint. ✅
- `auth_sessions(access_token)` — covered by the PK. ✅

**Impact.** Full table scans on the hottest query, and index misses on the per-user state queries that run on every search.

**Proposal.**

Add a new migration `008_scaling_indexes.sql`:

```sql
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON offers (is_active);
CREATE INDEX IF NOT EXISTS idx_offers_lat_lng ON offers (lat, lng);
CREATE INDEX IF NOT EXISTS idx_offer_availability_votes_user_id
    ON offer_availability_votes (user_id);
CREATE INDEX IF NOT EXISTS idx_promoted_offers_window
    ON promoted_offers (starts_at_utc, ends_at_utc);
CREATE INDEX IF NOT EXISTS idx_offer_reports_offer_id ON offer_reports (offer_id);
```

Plus the R*Tree from #4 (also as a migration, with triggers to keep it in sync).

**Important:** `CREATE INDEX` on a large table is a blocking operation. Run it during a maintenance window, or use `CREATE INDEX ... ` inside the migration runner's transaction (already transactional — `SqliteMigrationRunner.cs:62-72`).

**Also:** add `EXPLAIN QUERY PLAN` assertions to the migration or to a test, so a future schema change that drops an index is caught.

**Spec impact:** none (internal).

**Effort:** S. **Risk:** low.

---

### 15. Timestamps stored as ISO-8601 TEXT with 7-digit fractions

**Problem.** Every write formats the timestamp as a string:

```csharp
CreatedAtUtc = DateTimeOffset.UtcNow.ToString("O")   // 2026-11-13T10:22:33.1234567+00:00
```

Examples: `DapperAuthService.cs:59, 112, 115, 160, 208`; `DapperOfferService.cs:414, 475, 573, 604, 958, 961`.

Every read parses it back: `DateTimeOffset.TryParse(row.ExpiresAtUtc, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, ...)` (`DapperAuthService.cs:156`), `TryParseDateTimeOffset` (`DapperOfferService.cs:953-962`).

**Impact.**

- `+00:00` suffix on every row means **string comparison is not the same as chronological comparison** if any row is written with a non-UTC offset. Today everything is UTC so it happens to work, but it is a latent correctness bug.
- Date filtering in SQL requires `datetime(col)` / `strftime(...)`, which **cannot use an index**.
- Parsing cost on every read (small, but it is on the hot path per #6).
- 28 bytes per timestamp, and the ISO format with 7 fractional digits is more precision than needed.

**Proposal.**

1. **Migrate to epoch milliseconds `INTEGER`.** `DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()`. Ordering and comparison become integer comparisons, indexable, locale- and culture-independent.
2. **Migration strategy** (in `008_*`): add new columns, backfill with `strftime('%s', col) * 1000`, then swap. Since `ALTER TABLE ... DROP COLUMN` is supported in SQLite 3.35+, this is feasible. Alternatively, keep the TEXT columns and add generated/parallel integer columns during the transition.
3. **Keep the API contract as ISO-8601.** The change is internal to persistence — the DTOs (`AuthSessionDto`, `OfferCommentDto`, etc.) must keep emitting ISO-8601 strings so the JSON contracts in `specs/contracts/json-schema/` do not change.
4. **Store UTC consistently** and document that all persisted timestamps are UTC epoch millis.
5. **Adopt `DateTimeOffset.UtcNow` consistently** (already the case) and stop using `DateTime.Now`.

**Spec impact:** none, provided the JSON contract is unchanged. Verify `offer-comments-response.schema.json` and `auth-session.schema.json` still match.

**Effort:** M (migration + code). **Risk:** medium — a migration bug here corrupts ordering silently. Backfill + verification query required.

---

### 16. Migration runner is not safe under multiple instances, and there is no janitor

**Problem.** `Persistence/SqliteMigrationRunner.cs:15-79`. On startup, every instance:

1. creates `schema_migrations` if absent,
2. reads the applied set,
3. applies each pending migration in its own transaction.

There is **no lock** between the check and the apply. Two instances starting simultaneously can both see migration `008` as pending and both apply it.

Additionally, there is **no background maintenance** anywhere in the codebase:
- expired `auth_sessions` are only revoked when a request happens to present them (`DapperAuthService.cs:159-162`),
- `logs` are never pruned (#1),
- the `promoted_offers` window is never cleaned up,
- orphan rows are never vacuumed.

**Impact.** Startup races under horizontal scale; unbounded growth of `auth_sessions` and `logs`; the session table grows forever, slowing the `idx_auth_sessions_expires_at_utc` lookups.

**Proposal.**

1. **Lock the migration run.** Take an exclusive lock before applying: `BEGIN IMMEDIATE` (SQLite's write lock, which is global) around the read-applied + apply sequence. `BEGIN IMMEDIATE` is the simplest correct primitive here — it takes the write lock at the start rather than on first write, preventing the TOCTOU race.
2. **Make migrations idempotent-safe.** All migration SQL already uses `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`; keep that discipline, and where it is not possible (e.g. `ALTER TABLE ADD COLUMN`, `007_offer_comments_and_avatar.sql:1`), guard with a `PRAGMA table_info` check.
3. **Add a background janitor** (`BackgroundService`), running on a timer (e.g. every 15 minutes):
   - delete `auth_sessions` where `expires_at_utc < now` or `revoked_at_utc < now - retention`,
   - delete `logs` older than the retention window (see #1),
   - delete expired `promoted_offers` rows,
   - `PRAGMA wal_checkpoint(TRUNCATE)` and, less often, `PRAGMA incremental_vacuum`.
4. **Guard the janitor against overlapping runs** (a `SemaphoreSlim` or `PeriodicTimer` with a guard flag).
5. **Log janitor outcomes** at Debug level with row counts.

**Spec impact:** none (internal).

**Effort:** M. **Risk:** low.

---

### 17. No health checks, no metrics, no tracing

**Problem.** `Program.cs` registers Serilog and OpenAPI but nothing else. There is:
- no `/health` endpoint (liveness/readiness),
- no metrics (request rate, latency percentiles, DB query duration, cache hit rate, queue depth, log drops),
- no distributed tracing (even though `SqliteLogEventSink` already captures `TraceId`/`SpanId` properties — they are recorded but never used for correlation because nothing produces them).

**Impact.** "Big volume" cannot be tuned or debugged safely without them. When latency degrades, there is no way to attribute it to the DB, the log sink, the fuzzy matcher or the geocoding provider.

**Proposal.**

1. **Health checks.** `builder.Services.AddHealthChecks().AddDbContextCheck`-equivalent (a custom `IHealthCheck` that runs `SELECT 1` and checks the WAL state). Expose `/health/live` and `/health/ready`; the readiness probe fails if the DB is not writable. Configure `AddHealthChecks().AddCheck<...>("self", tags: ["live"])`.
2. **OpenTelemetry.** Add `OpenTelemetry.Exporter.Prometheus` + `OpenTelemetry.Instrumentation.AspNetCore` + `OpenTelemetry.Instrumentation.Http`. Expose `/metrics`. This gives RED metrics (Rate, Errors, Duration) per route, plus HTTP client spans for the geocoding providers — which also makes the `TraceId` already captured by the log sink useful.
3. **Custom metrics** via `System.Diagnostics.Metrics`:
   - `dealseeker.cache.operations` (hit/miss, tagged by cache prefix),
   - `dealseeker.db.operations` (duration, tagged by operation name),
   - `dealseeker.search.matches` (candidates examined, rows returned),
   - `dealseeker.logs.dropped`,
   - `dealseeker.ratelimit.rejections` (tagged by policy).
4. **Structured request logging** with `TraceId`/`SpanId`/`RequestId` enriched on every request, and `Activity.Current` propagated to the DB and HTTP layers.
5. **A load-test harness** — k6 or NBomber — as the acceptance gate for the phases in §5. Without it, "supports high volume" is an unverified claim.

**Spec impact:** none.

**Effort:** M. **Risk:** low.

---

### 18. No request validation

**Problem.** `Program.cs` binds DTOs directly to the service layer with **no validation**. Examples:

- `SearchOffersRequest.RadiusMeters` — unbounded (`Shared/Contracts/Offers/SearchOffersRequest.cs`).
- `SearchOffersRequest.Query` — unbounded length.
- `SearchOffersRequest.UserLocation` — `double lat/lng` with no range check (`GeoPoint`).
- `AddOfferRequest.Images` — unbounded count; `OfferImageDto.DataUrl` is a **data URL** (base64) whose size is bounded only by the Kestrel request-body limit.
- `CreateCommentRequest.Body` — capped at 2000 chars, but only deep inside `DapperCommentService.cs:44-46`.
- `ReportOfferRequest`, `SuggestionRequest`, `RegisterUserRequest` — email/password rules live in `DapperAuthService.cs:216-223`, in the service, not at the boundary.

**Impact.** Malformed input reaches the database layer, producing wasted work and confusing error messages. In the case of `SearchOffersRequest`, an unbounded radius is a **direct vector for the #4 full-scan problem**.

**Proposal.**

1. **Validate at the boundary.** Add a validation filter (`IEndpointFilter` or a `ValidationEndpointFilter` from `MinimalApis` / `FluentValidation`) that returns `400` with a `ProblemDetails` body listing the failures.
2. **Use data annotations or a dedicated validation library.** `System.ComponentModel.DataAnnotations` is already available in the BCL; `[Required]`, `[StringLength]`, `[Range]` on the shared contracts. For cross-field rules (e.g. password strength, coordinate pair validity), a small `IValidator<T>` implementation keeps it dependency-free.
3. **Add explicit caps** to the shared contracts:
   - `RadiusMeters` — `[Range(1, 50_000)]`,
   - `Query` — `[StringLength(200)]`,
   - `Tags` — max 10 items, each 40 chars,
   - `Images` — max 5 items, and a **total payload size** limit (see (4)),
   - `GeoPoint.Lat` — `[-90, 90]`, `Lng` — `[-180, 180]`.
4. **Cap the request body size.** `KestrelServerOptions.Limits.MaxRequestBodySize` (e.g. 8 MB) and/or `[RequestSizeLimit]` on the endpoints that accept images. This prevents base64 image payloads from becoming a memory-amplification vector.
5. **Move the validation rules out of the services** into the contract layer, keeping the service-level checks as defence in depth.
6. **Add `AddProblemDetails()`** and return RFC 7807 responses for all error paths, so the client has a single error shape to parse (`client.ts:62-84` currently parses several ad-hoc shapes).

**Spec impact:** **behavioural** — new 400 responses with a defined body. The relevant contracts (`specs/contracts/json-schema/`) and specs (`ADD.OFFER.*`, `OFFERS.SEARCH.001`) must state the validation rules and the error shape. `command-result.schema.json` exists for command results; a `problem-details` contract should be added.

**Effort:** M. **Risk:** low — but the caps are user-visible and must be specced and approved first.

---

### 19. `Program.cs` is 453 lines of duplicated lambdas

**Problem.** `Program.cs` contains ~20 endpoint definitions, of which ~15 repeat the identical five-line auth block (see #6). The file also mixes: configuration, DI registration, migration execution, middleware ordering, and all endpoint definitions.

**Impact.** Not a performance problem directly, but it is the reason #6 (single auth resolution) and #7 (per-endpoint rate limits) are awkward to apply — the metadata (`RequireAuthorization`, `RequireRateLimiting`) has to be attached 20 times, by hand, which is exactly the kind of thing that gets forgotten. It is also the main obstacle to adding the OpenAPI security scheme (#19 corollary).

**Proposal.**

1. **Extract endpoint groups.** Move each bounded context's endpoints into an extension method in `src/DealsSeeker.Api/Endpoints/`:
   - `AuthEndpoints.cs`, `AccountEndpoints.cs`, `OfferEndpoints.cs`, `CommentEndpoints.cs`, `LocationEndpoints.cs`, `FeedbackEndpoints.cs`.
   Each exposes `public static IEndpointRouteBuilder MapXxxEndpoints(this IEndpointRouteBuilder app)`.
2. **Replace the auth boilerplate with declarative metadata.** With #6 in place, endpoints become:
   ```csharp
   api.MapGet("/account/me", (ICurrentUser current, IAuthService auth, CancellationToken ct) =>
           Results.Ok(auth.GetProfileAsync(current.UserId, ct)))
       .RequireAuthorization();
   ```
3. **Use endpoint groups with `.RequireAuthorization()` applied once:**
   ```csharp
   var secured = api.MapGroup("/").RequireAuthorization().RequireRateLimiting("user");
   ```
4. **Add the OpenAPI security scheme** so the generated document describes the bearer token, and remove the manual `.WithSummary(...)` spec-ID strings in favour of a single `WithOpenApi` operation filter that derives them — the spec IDs are already in the summaries; make them structured.
5. **Extract the `TryGetAccessToken` helper** (`:441-453`) into the auth handler.
6. **Move `Program.cs` down to ~80 lines**: configuration, DI, middleware, migration, and a single `app.MapDealsSeekerApi();` call.

**Spec impact:** none (internal refactor).

**Effort:** M. **Risk:** low — but keep the route table and operation names **identical** to avoid breaking the generated OpenAPI document and any client codegen.

---

### 20. SQLite is the write ceiling

**Problem.** SQLite supports **exactly one writer** at a time. Reads parallelise (once WAL is enabled, #2), but writes are globally serialised. The write paths in this application are:

| Operation | Path | Frequency |
|---|---|---|
| `POST /api/offers/{id}/availability` | transaction: `SELECT COUNT` + `INSERT` + `UPDATE` | high (every user vote) |
| `POST /api/offers/{id}/favorite` | `SELECT COUNT` + `INSERT`/`DELETE` | high |
| `POST /api/offers/{id}/report` | transaction: `UPDATE` + `INSERT` | medium |
| `POST /api/offers/{id}/comments` | `SELECT COUNT` + `INSERT` + `SELECT author` | medium |
| `POST /api/offers` | transaction: `INSERT` + bulk `INSERT` tags + bulk `INSERT` images | medium |
| `PUT /api/offers/{id}` | transaction: `UPDATE` + `DELETE`+`INSERT` tags + `DELETE`+`INSERT` images | low |
| **log sink** | `INSERT INTO logs` | **per log event — very high** |

The log sink (#1) alone can dominate the write budget.

**Impact.** Sustained write throughput is bounded by `1 / (transaction duration)`. With `synchronous=FULL` and no WAL that can be ~100 writes/second; with WAL + `synchronous=NORMAL` it is in the thousands — but it is still a hard ceiling, and it is shared with the log sink.

**Proposal.**

1. **Mitigate first, migrate only if needed.** Completing #1 (separate log DB), #2 (WAL), #3 (pooling) and #12 (fewer statements per transaction) will raise the practical ceiling by one to two orders of magnitude. Measure with #17 before migrating.
2. **Keep `IDbConnectionFactory` as the migration seam.** It already exists and is the right abstraction. Provide a `PostgresConnectionFactory` behind the same interface.
3. **Postgres migration path** (when justified):
   - `Npgsql` + Dapper (same query style, minimal code churn).
   - Port the pragmas to Postgres settings (`synchronous_commit`, `shared_buffers`, `work_mem`, `max_connections`).
   - Replace the R*Tree (#4) with **PostGIS** (`geography(Point, 4326)` + `GIST` index) — strictly better.
   - Replace the FTS5 idea (#5) with **PostgreSQL full-text search** (`tsvector` + `GIN`).
   - Replace the `SqliteException` handling (`DapperAuthService.cs:62-72`, `DapperOfferService.cs:418-422`, `DapperCommentService`) with `PostgresException` and SQLSTATE codes (`23505` unique violation, `23503` FK violation).
   - The in-memory fuzzy matcher (#5) stays valid as a **tie-breaker** on top of FTS, or is dropped if FTS + trigram similarity (`pg_trgm`) is enough.
   - Migration of data: export/import with `COPY`, then a verification pass on row counts and checksums.
4. **Interim option if SQLite must be kept:** move the *write-heavy* subsystems (logs, reports, suggestions) to a separate SQLite file, or to an append-only file, so the offers database retains the write budget for offers.
5. **Do not migrate speculatively.** SQLite is a perfectly good engine for a large read volume; the constraint is writes, not reads.

**Spec impact:** none (internal). Storage engine choice is explicitly out of scope for the spec set per `AGENTS.md` ("Implementation-agnostic specs; no framework/storage/class details").

**Effort:** L (if required). **Risk:** high — full data migration, query portability, and operational changes.

---

### 21. Security note — unsalted SHA-256 password hashing

**Problem.** `Services/Auth/DapperAuthService.cs:228-235`:

```csharp
private static string HashPassword(string password)
{
    var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
    return Convert.ToBase64String(bytes);
}
```

A **single unsalted SHA-256** digest per password. No salt, no work factor, no key stretching.

**Impact.** Not a performance issue, but it is a **credential-storage** issue that must be fixed before any real traffic, and it interacts with the auth architecture in #6. A leaked `users` table yields passwords that are trivially crackable with commodity hardware (SHA-256 is ~10 billion/s on a GPU; the table stores a base64 digest per user, with no salt to slow rainbow-table reuse).

Additionally, `DapperAuthService.cs:237-243` detects a unique-constraint violation by **string-matching the exception message** (`"UNIQUE constraint failed: users.email"`) — which is brittle across SQLite versions and will not survive the #20 migration to Postgres (which uses SQLSTATE `23505`).

**Proposal.**

1. **Use a password hashing framework.** `Microsoft.AspNetCore.Identity`'s `PasswordHasher<TUser>` (PBKDF2 with HMAC-SHA256, 100 000+ iterations, per-user salt) — or Argon2id via `Konscious.Security.Cryptography.Argon2` / `Isopoh.Cryptography.Argon2`. Do **not** hand-roll.
2. **Store the algorithm, the parameters and the salt** in a self-describing format so the work factor can be raised later without invalidating existing hashes:
   ```
   $pbkdf2-sha256$i=210000$<base64 salt>$<base64 hash>
   ```
   `PasswordHasher<TUser>` already produces exactly this shape (`IdentityV3` format).
3. **Verify with constant-time comparison** — the framework handles this; do not hand-roll `==` on hashes.
4. **Rehash on successful login.** If the stored hash uses weaker parameters than the current policy, re-hash and update it during the next successful login (transparent migration).
5. **Fix the unique-constraint detection.** Catch `SqliteException` and inspect `ex.SqliteErrorCode == 19` (`SQLITE_CONSTRAINT`) plus `ex.SqliteExtendedErrorCode` (2067 = `SQLITE_CONSTRAINT_UNIQUE`) rather than matching the message text. This makes it portable to #20.
6. **Add a rate limit on login** specifically (see #7) to slow credential stuffing.
7. **Plan a forced reset** for existing accounts if the current hashes are considered exposed.

**Spec impact:** **behavioural, but not user-visible** — the login contract does not change (`ACCOUNT.AUTH.LOGIN.001.md` stays valid). Password *policy* changes (minimum strength) **would** be user-visible and require a spec change; the current policy (`IsStrongPassword`, `DapperAuthService.cs:216-219`: ≥8 chars, a letter and a digit) should be moved to the contract layer and specced.

**Effort:** M. **Risk:** medium — a bug in the verification path locks users out; needs a migration test with real hashes.

---

## 4. Cross-cutting principles

These guide the implementation of all 21 items and prevent regressions.

1. **Nothing unbounded reaches the database.** Every list query has a `LIMIT`; every `IN` list is chunked; every request body is capped (#4, #13, #18).
2. **No blocking I/O on the request thread.** Log writes, cache warm-up and external calls are all asynchronous and off the hot path (#1, #9, #10).
3. **Cache only user-independent data.** Anything that varies per user (favourites, votes) is read fresh (#9).
4. **Every external dependency is protected.** Timeout + retry + circuit breaker + rate limit + cache, for both map providers (#10).
5. **Measure before optimising further.** The instrumented baseline (#17) decides whether #20 is ever needed.
6. **Behavioural changes require an Approved spec first** (`AGENTS.md`). Items #4, #7, #8, #10, #11, #13, #18 are behavioural; the rest are internal.
7. **Contract-first.** `specs/contracts/json-schema/` is updated before the DTOs, and the DTOs before the services.

---

## 5. Delivery roadmap

### Phase 0 — Baseline and instrumentation (prerequisite)

| Item | Change | Why first |
|---|---|---|
| 17 | OpenTelemetry + Prometheus + `/health` + `/metrics` | Without a baseline, no later claim is verifiable |
| — | k6 load-test harness (scenarios: search-heavy, auth-heavy, write-burst) | Defines "big volume" as a number |

**Exit criterion:** a documented baseline — p50/p95/p99 per endpoint, DB query count per request, and the failure rate at the target RPS.

### Phase 1 — Remove the blocking floor *(highest impact, lowest risk)*

| Item | Change |
|---|---|
| **1** | Log sink → separate DB, `Serilog.Sinks.Async`, batched inserts, retention, off by default in Production |
| 2 | `WAL`, `busy_timeout=5000`, `synchronous=NORMAL`, `cache_size`, `temp_store`, `mmap_size` |
| 3 | `SqliteDataSource` pooling behind `IDbConnectionFactory` |
| 6 | Single auth resolution per request + `IMemoryCache` session cache |
| 16 | `BEGIN IMMEDIATE` migration lock + background janitor |

**Exit criterion:** zero `SQLITE_BUSY` errors under the Phase 0 load test; p99 search latency no longer dominated by connection setup; `logs` no longer written on the request thread.

### Phase 2 — Bound the per-request work

| Item | Change |
|---|---|
| **4** | Pagination, SQL radius filter, R*Tree, ranking in SQL, capped `IN` lists *(spec-first)* |
| 5 | Fuzzy early-exit, length pre-filter, rolling-buffer Levenshtein, cached search documents, optional FTS5 |
| 12 | Remove redundant existence probes; shorten write transactions |
| 13 | Keyset-paginated comments *(spec-first)* |
| 14 | Missing indexes (migration `008_scaling_indexes.sql`) |
| 15 | Epoch-millisecond timestamps *(spec-first: `OFFERS.COMMENTS.001` etc. keep ISO-8601 on the wire)* |

**Exit criterion:** search latency is flat with respect to corpus size (verify by seeding 10k / 100k / 1M offers); no request produces a SQL statement above ~50 KB.

### Phase 3 — Absorb the call volume

| Item | Change |
|---|---|
| 7 | Rate limiting (global per-IP, per-user, per-endpoint policies) *(spec-first)* |
| 8 | Response compression + output caching + ETag |
| 9 | Cache layer: promotions, search documents, lexicon expansion, geocoding |
| 10 | HTTP timeouts, retry, circuit breaker, outbound rate limit, better failure reporting *(spec-first)* |
| 11 | Client debounce, cancellation, per-operation loading, client cache, retry/backoff *(spec-first)* |
| 18 | Request validation + `ProblemDetails` + body-size limits *(spec-first)* |

**Exit criterion:** a 10× burst is absorbed without error-rate increase; the geocoding provider's outbound volume is proportional to *distinct* queries, not request count.

### Phase 4 — Operate and simplify

| Item | Change |
|---|---|
| 19 | Split `Program.cs` into endpoint group extensions; declarative auth/rate-limit metadata |
| 21 | Password hashing → PBKDF2/Argon2; portable constraint detection |
| 16 | Janitor tuning; `PRAGMA wal_checkpoint` schedule |

**Exit criterion:** new endpoints require one line of registration; auth and rate limiting cannot be forgotten.

### Phase 5 — Conditional: change the store

| Item | Change |
|---|---|
| 20 | Only if the Phase 0/3 measurements show sustained writes exceeding SQLite's budget: introduce `PostgresConnectionFactory`, PostGIS, `tsvector`, SQLSTATE-based error handling, and a verified data migration |

---

## 6. Verification plan

| Level | Tool | What it proves |
|---|---|---|
| Unit | xUnit | Fuzzy-matching **equivalence** — the refactored matcher must return identical rankings to the current one for a corpus of query/offer pairs (golden files, #5) |
| Integration | WebApplicationFactory + real SQLite | Endpoint behaviour, pagination, validation, `ProblemDetails` shapes (#4, #13, #18) |
| Migration | xUnit + temp DB | Every migration applies cleanly from every prior version, and is idempotent under concurrent runners (#16) |
| Load | k6 | p95/p99 and error rate per endpoint at target RPS; DB connection count; `SQLITE_BUSY` count; log-sink queue depth |
| Soak | k6 (extended) | Memory growth, cache hit rate, `logs` growth, janitor effectiveness |
| Failover | manual | Map provider down → circuit opens → fallback engages → client sees a clear error (#10) |

**Target SLOs (to be confirmed with the business owner and baselined in Phase 0):**

- p95 ≤ 150 ms and p99 ≤ 400 ms for `POST /api/offers/search` with 100 000 offers.
- p95 ≤ 80 ms for `GET /api/account/me`.
- Zero 5xx attributable to storage locking at 3× the expected peak RPS.
- Outbound geocoding calls ≤ 1 per distinct query per cache TTL.

---

## 7. Appendices

### 7.1 Proposed package additions

| Package | Purpose | Item |
|---|---|---|
| `Serilog.Sinks.Async` | Buffered, batched log writes | 1 |
| `Microsoft.Extensions.Http.Resilience` | Timeout + retry + circuit breaker + rate limiter for `HttpClient` | 10 |
| `Microsoft.Extensions.Caching.Memory` | `IMemoryCache` (in-box via ASP.NET Core shared framework) | 6, 9 |
| `Microsoft.Extensions.Caching.Hybrid` | .NET 10 hybrid local/distributed cache, if needed | 9 |
| `OpenTelemetry.Extensions.Hosting` + `OpenTelemetry.Exporter.Prometheus` | Metrics and tracing | 17 |
| `OpenTelemetry.Instrumentation.AspNetCore` / `.Http` | Automatic instrumentation | 17 |
| `Microsoft.AspNetCore.Identity` (or `Microsoft.AspNetCore.Cryptography.KeyDerivation`) | PBKDF2 password hashing | 21 |

`Npgsql` is **not** added unless #20 is triggered.

### 7.2 Configuration sketch

```jsonc
{
  "Database": {
    "ConnectionString": "Data Source=Data/dealseeker.db",
    "BusyTimeoutMs": 5000,
    "JournalMode": "WAL",
    "Synchronous": "NORMAL",
    "CacheSizeKb": 64000
  },
  "LoggingPersistence": {
    "EnableDatabaseSink": false,          // true in Development only
    "ConnectionString": "Data Source=Data/dealseeker-logs.db",
    "MinimumLevel": "Information",
    "RetentionDays": 14,
    "BatchSize": 500,
    "FlushIntervalMs": 200
  },
  "Caching": {
    "PromotionsTtlSeconds": 30,
    "OfferSearchDocumentTtlSeconds": 600,
    "TagLexiconTtlSeconds": 3600,
    "GeocodeTtlHours": 24,
    "GeocodeNegativeTtlSeconds": 300
  },
  "RateLimiting": {
    "GlobalPermitLimit": 300,
    "GlobalWindowSeconds": 60,
    "SearchPermitLimit": 60,
    "LocationPermitLimit": 30
  },
  "MapProviderResilience": {
    "TimeoutSeconds": 3,
    "RetryCount": 2,
    "CircuitBreakerSeconds": 30
  }
}
```

### 7.3 Files most affected

| File | Items |
|---|---|
| `src/DealsSeeker.Api/Program.cs` | 1, 2, 6, 7, 8, 10, 17, 18, 19 |
| `src/DealsSeeker.Api/Logging/SqliteLogEventSink.cs` | 1 |
| `src/DealsSeeker.Api/Persistence/SqliteConnectionFactory.cs` | 2, 3 |
| `src/DealsSeeker.Api/Persistence/SqliteMigrationRunner.cs` | 16, 14, 15 |
| `src/DealsSeeker.Api/Persistence/Migrations/008_*.sql` *(new)* | 4, 14, 15, 20 |
| `src/DealsSeeker.Api/Services/Offers/DapperOfferService.cs` | 4, 5, 9, 12, 14 |
| `src/DealsSeeker.Api/Services/Auth/DapperAuthService.cs` | 6, 15, 21 |
| `src/DealsSeeker.Api/Services/Comments/DapperCommentService.cs` | 12, 13 |
| `src/DealsSeeker.Api/Services/Locations/*.cs` | 9, 10 |
| `src/DealsSeeker.Shared/Contracts/Offers/SearchOffersRequest.cs` | 4, 18 |
| `src/DealsSeeker.Shared/Contracts/Comments/OfferCommentsResponseDto.cs` | 13 |
| `src/DealsSeeker.ReactNative/src/api/client.ts` | 11 |
| `src/DealsSeeker.ReactNative/src/context/AppContext.tsx` | 11 |
| `specs/features/offers-view/OFFERS.SEARCH.001.md` *(etc.)* | 4, 7, 10, 11, 13, 18 |

---

## 8. Decision log

| Decision | Rationale | Revisit when |
|---|---|---|
| Keep the single-process topology | Correct for this scale; adds no distributed failure modes | Never, at this scale |
| Keep Dapper | Explicit SQL is exactly what the index/FTS/R*Tree work in #4, #5, #14 needs | Never |
| Keep SQLite for reads | WAL + indexes handle a large read volume well | If write throughput saturates (#20) |
| Separate the log database | Log writes must never contend with business data (#1) | Never |
| Move to a custom auth handler | Removes a DB round trip per request and the duplicated boilerplate (#6, #19) | Never |
| Behavioural items require an Approved spec first | `AGENTS.md` spec-first flow | Never |

---

*End of proposal. No code changes have been applied. Implement in the phase order of §5, starting with Phase 0 instrumentation so that every subsequent phase can be measured.*

---

# Part II — Implementation Status

**Status:** implemented (Phases 1–4 complete). Phase 5 (store change) remains conditional.

## 9. What was applied

| # | Improvement | Where | State |
|---|---|---|---|
| 1 | Log sink writes off the request thread, separate DB, batched, retained | `Logging/SqliteLogEventSink.cs`, `Options/LoggingPersistenceOptions.cs`, `appsettings*.json` | **Done.** Bounded `Channel<LogEvent>` + background writer doing multi-row inserts; log DB defaults to `Data/dealseeker-logs.db`; 14-day retention sweep; disabled by default outside Development. |
| 2 | SQLite configured for concurrency | `Persistence/SqliteConnectionPool.cs`, `Persistence/SqliteConnectionFactory.cs` | **Done.** `WAL`, `busy_timeout=5000`, `synchronous=NORMAL`, `cache_size`, `temp_store=MEMORY`, `mmap_size`; journal mode applied once at startup. |
| 3 | Connection pooling | `Persistence/SqliteConnectionPool.cs`, `SqliteConnectionLease.cs`, `IDbConnectionFactory.cs` | **Done.** Custom pool (`Microsoft.Data.Sqlite` ships none) behind a lease API; pragmas applied once per physical connection. |
| 4 | Bounded, paged search | `Services/Offers/DapperOfferService.cs`, `Shared/Contracts/Offers/SearchOffersRequest.cs` | **Done.** `page`/`pageSize` (max 50), SQL bounding-box radius prefilter, `hasMore`, markers reflect the full filtered set, chunked `IN` lists. See §9.1 for the R\*Tree note. |
| 5 | Fuzzy matching cost | `DapperOfferService.cs` | **Done.** Exact-match early exit, length-based prefilter, rolling two-row Levenshtein (no matrix allocation), capped tokens/terms, cached search documents. |
| 6 | Single auth resolution per request | `Security/*` | **Done.** `BearerTokenAuthenticationHandler` + `MemorySessionCache` (60s TTL, instant revocation tombstone) + `ICurrentUser`. Session lookup is now read-only; expiry is reclaimed by the janitor. |
| 7 | Rate limiting | `Program.cs` | **Done.** Global per-IP, per-user, `search` (60/min) and `location` (30/min) policies; 429 + `Retry-After` + RFC 7807 body. |
| 8 | Compression and conditional responses | `Program.cs`, `Responses/ConditionalResponseService.cs` | **Done.** Brotli/Gzip; ETag + 304 on locations, profile and comments. |
| 9 | Caching layer | `Caching/MemoryCacheService.cs`, `Caching/CacheKeys.cs` | **Done.** Cached search documents (10 min), active promotions (30 s), geocode results (24 h / 5 min negative), per-key-prefix hit/miss metrics. |
| 10 | Geocoding resilience | `Services/Locations/*`, `Options/MapProviderResilienceOptions.cs` | **Done.** 3s timeout, 2 retries with backoff, circuit breaker, outbound rate limit; provider outage is distinguishable from "no results" (503 vs 200). |
| 11 | Client debounce, cancellation, scoped loading | `api/client.ts`, `hooks/useDebouncedCallback.ts`, `hooks/useAbortableRequest.ts`, `context/AppContext.tsx`, `screens/OffersScreen.tsx`, `screens/AddOfferScreen.tsx` | **Done.** 300ms debounce, `AbortController` supersession, stale-result discarding, retry with jittered backoff, `Retry-After` handling, in-flight coalescing, profile cache, scoped non-blocking indicators. |
| 12 | Write hot spots | `DapperOfferService.cs`, `DapperCommentService.cs` | **Done.** Existence probes folded into the writing statement; favourite/vote/comment writes are one round trip. |
| 13 | Paged comments | `Services/Comments/*`, `Shared/Contracts/Comments/OfferCommentsResponseDto.cs` | **Done.** Keyset pagination with an opaque cursor, `hasMore`, `nextCursor`; invalid limit/cursor rejected. |
| 14 | Missing indexes | `Persistence/Migrations/008_scaling_indexes.sql` | **Done.** `offers(is_active)`, `offers(lat,lng)`, `offer_availability_votes(user_id)`, `promoted_offers(starts_at_utc, ends_at_utc)`, `offer_reports(offer_id)`. |
| 15 | Timestamp handling | `Persistence/Timestamp.cs` | **Partially done — see §9.2.** |
| 16 | Migration lock and janitor | `Persistence/SqliteMigrationRunner.cs`, `Maintenance/DatabaseJanitor.cs` | **Done.** Migrations run inside an `IMMEDIATE` transaction with an in-transaction re-check; background sweep removes expired sessions and promotions and checkpoints the WAL. |
| 17 | Health checks, metrics, tracing | `Program.cs` | **Done.** `/health/live` + `/health/ready`, OpenTelemetry (ASP.NET Core + Http instrumentation, Prometheus exporter), custom cache and search meters. |
| 18 | Request validation | `Validation/*`, `Responses/ApiResults.cs` | **Done.** Per-operation limits, RFC 7807 `400` with an `errors` map, 8 MB request-body cap, coordinate and radius bounds. |
| 19 | `Program.cs` decomposition | `Endpoints/*` | **Done.** `Program.cs` reduced to configuration, DI, middleware and startup; endpoints split into six bounded-context groups. |
| 20 | Store portability | `IDbConnectionFactory` | **Deferred by design — see §9.3.** |
| 21 | Password hashing | `Services/Auth/DapperAuthService.cs` | **Done.** PBKDF2-HMAC-SHA256 (210 000 iterations, per-user salt, self-describing format), constant-time comparison, transparent rehash on sign-in, portable constraint detection via `SqliteErrorCode`/`SqliteExtendedErrorCode`. |

## 9.1 Item 4 — R\*Tree deferred

The radius prefilter is a **bounding box** in SQL, backed by the composite index `offers(lat, lng)`, not an R\*Tree virtual table.

**Why:** at the default 1 km radius the bounding box is already highly selective, and the exact Haversine check still runs afterwards, so the result set is identical to the circle. An R\*Tree additionally requires a text→integer id mapping table plus insert/update/delete triggers to stay in sync with `offers`, which adds a substantial correctness surface to the hottest write path.

**When to revisit:** once the corpus passes roughly 1 M offers, or the default radius grows beyond ~5 km, the bounding box starts selecting a large fraction of the corpus and the R\*Tree (or PostGIS, per item 20) becomes the better structure.

## 9.2 Item 15 — deliberate deviation

The proposed change was to store timestamps as epoch milliseconds so that range comparisons are integer comparisons.

**What was applied:** a single canonical timestamp format (`Persistence/Timestamp.cs`) used by every write and read, guaranteeing ISO-8601 in UTC with a fixed `+00:00` offset and constant width. All persisted timestamps therefore sort chronologically as text and remain usable by the existing indexes.

**What was deliberately not applied:** converting the stored columns to integer epoch milliseconds.

**Why:** SQLite applies *type affinity* to the column, so an integer written into a `TEXT`-declared column is converted back to text on storage. A genuine epoch-millisecond representation therefore requires recreating `auth_sessions` and `offer_comments` with `INTEGER` affinity (the same table-rebuild pattern migration `006` uses), with the accompanying risk of a silent data-migration defect. The benefit is marginal here: the only SQL comparisons on these columns are the janitor's expiry sweep (runs every 15 minutes) and the comments `ORDER BY` (already index-backed), and both are correct with a lexicographically sortable format. The change would add write amplification and migration risk for no measurable gain.

**Consequence:** the residual risk of two writes producing text of different shapes — which would silently break a range comparison — is closed by the canonical format helper instead.

## 9.3 Item 20 — deferred by design

PostgreSQL was **not** introduced. Phases 1–4 raise the practical write ceiling by one to two orders of magnitude (separate log database, WAL, pooling, one-statement writes, no per-event log insert). Item 20 should only be triggered if measurement shows sustained writes exceeding SQLite's single-writer budget; `IDbConnectionFactory` remains the seam for it.

## 9.4 Specs

Seven behavioural specs were authored, validated and approved before the corresponding code was written, per the spec-first flow in `AGENTS.md`:

| Spec | Title |
|---|---|
| `OFFERS.SEARCH.PAGINATION.001` | Offers Search Result Paging |
| `OFFERS.COMMENTS.PAGINATION.001` | Offer Comments Paging |
| `APP.VALIDATION.001` | Input Validation and Standard Error Response |
| `APP.RATE.LIMIT.001` | Request Rate Limiting |
| `APP.LOCATION.PROVIDER.RESILIENCE.001` | Map Provider Location Lookup Resilience |
| `APP.RESPONSE.CONDITIONAL.001` | Conditional and Reusable Responses for Read Operations |
| `APP.SEARCH.INTERACTION.001` | Search Interaction Under High Request Volume |

Each has a BDD feature file, contract and example fixtures where data shape is relevant, and a `TRACEABILITY.md` row. `OFFERS.SEARCH.001` (v1.6) and `OFFERS.COMMENTS.001` (v1.1) were amended to reference the new paging behaviour, and the conflicting "blocking loading state" requirement in `OFFERS.SEARCH.001-R11` was reconciled with the non-blocking rule in `APP.SEARCH.INTERACTION.001`.

## 9.5 Verification performed

- `DealsSeeker.Api` and `DealsSeeker.Shared` build with **zero warnings and zero errors**.
- The React Native client type-checks cleanly (`tsc --noEmit`).
- Live end-to-end checks against the running API confirmed: registration, login, session resolution, paged search with stable ordering and no cross-page duplicates, out-of-range pages returning an empty offer list while preserving the full marker set, validation rejections (`400` with the `errors` map), `401` for missing and invalid tokens, immediate session revocation on logout, invalid comment cursors rejected, `429` with `Retry-After`, `304` with a validator on all three conditional read endpoints, `200` with an empty collection for a legitimate "no results" lookup, `/health/live` and `/metrics` serving the custom counters, and WAL confirmed active on both database files with the log database in a separate file from the business database.

## 9.6 Not yet done

- **A test project does not exist.** The repository had no automated tests before this work, and none were added. The verification above is manual. Adding `tests/DealsSeeker.Api.Tests` with the golden-file ranking equivalence check (item 5), migration idempotency checks (item 16) and endpoint contract tests is the recommended next step, together with the k6 harness from §5 Phase 0 that turns "supports high volume" into a measurable claim.
- **The load-test baseline (Phase 0) has not been captured.** The observability needed to produce it is now in place, but the k6 scenarios themselves still need to be written and run against a seeded corpus.
- **The client does not yet send `If-None-Match`.** The server exposes and honours validators, but the React Native client still performs unconditional reads.
- **The .NET MAUI client was removed**; `DealsSeeker.ReactNative` is the only client, in line with the implementation scope in `AGENTS.md`.
