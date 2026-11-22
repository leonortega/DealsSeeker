# DealsSeeker security tests

API-level security tests for the real ASP.NET Core pipeline, using
`WebApplicationFactory` against an isolated SQLite database. They exercise the
approved specs `APP.VALIDATION.001`, `APP.RATE.LIMIT.001`,
`ACCOUNT.AUTH.LOGIN.001`, `ACCOUNT.AUTH.REGISTER.001` and
`ACCOUNT.PROFILE.001`, plus the credential-storage design in
`ARCHITECTURE.md` item 21.

This suite is test-only: it does not change API behaviour, so no spec or BDD
change is required. OWASP Top 10 (2021) coverage is mapped in
[`OWASP-TRACEABILITY.md`](OWASP-TRACEABILITY.md), including the categories that
remain out of scope (A06, A08).

## Running

```powershell
dotnet test test/security/DealsSeeker.SecurityTests/DealsSeeker.SecurityTests.csproj
```

The project reuses `ApiFactory` and `IntegrationTestBase` from
`test/integration`, so each test class gets a fresh database and a fresh rate
limiter. No external services are used.

## Coverage

| Class | Area | Edge cases |
|---|---|---|
| `AuthenticationSecurityTests` | AuthN / AuthZ | malformed and missing `Authorization` headers, lowercase scheme, padded token, token in query string, logout revocation, cross-user offer read/update/delete (IDOR), password length/strength boundaries, case-insensitive email, duplicate registration, user enumeration |
| `InputValidationSecurityTests` | Validation / injection | malformed JSON, wrong content type, search/offer/account boundary values, geographic coordinate range, excessive decimal precision, SQL-injection strings, XSS payloads, oversized image data URL, oversized request body, validation failure performs no work |
| `DataExposureSecurityTests` | Data hygiene | credentials absent from responses, PBKDF2 format and salt uniqueness in storage, standard error shape without stack traces, failed login does not return the hash |
| `RateLimitSecurityTests` | Abuse controls | 429 on the 61st search, positive integer `Retry-After`, ProblemDetails body, cheap endpoints unaffected by search exhaustion, rejected write creates no data |
| `OwaspSecurityMisconfigurationTests` | A05 | Allow-list CORS, ProblemDetails error content type; two skipped tests record missing security headers and the Development stack-trace leak |
| `OwaspLoggingAndMonitoringTests` | A09 | Credential-free log entries, RED + custom metrics, liveness/readiness probes |
| `OwaspSsrfTests` | A10 | Encoding/host pinning for both geocoding providers with a recording HTTP handler; overlong query rejected before any provider call |

## Findings from the edge-case pass

These are observations about the current implementation. No production code was
changed as part of adding this suite; each item would need its own spec-first
change if it is to be fixed.

1. **Malformed JSON / empty body returns a stack trace in Development.**
   `BadHttpRequestException` is rendered by the developer exception page, so the
   400 response body contains framework internals and request headers. In
   Production the framework returns a generic response, but any non-Production
   exposure should be avoided. A production-like error handler for binding
   failures would close this.
2. **Untrusted strings are returned unescaped in JSON.** A profile with
   `displayName = "<script>alert(1)</script>"` is emitted verbatim. The React
   Native client renders text rather than HTML, so this is not directly
   exploitable there, but any future HTML rendering or downstream consumer must
   escape these values. `System.Text.Json` can be configured with a stricter
   encoder.
3. **Oversized bodies are rejected (413) by Kestrel, not by the validator.**
   The 9 MB case is rejected before binding; the 2 MB image data URL case is
   rejected by validation with a field error. Both paths are covered.
4. **No security response headers are emitted.** `X-Content-Type-Options`,
   `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy` and HSTS are
   absent. CORS is correctly allow-list based, so cross-origin reads from
   unknown origins are not permitted. A skipped A05 test documents the desired
   header set.

## Non-goals

- No live penetration testing, fuzzing at scale, or dependency CVE scanning.
- No credential-spraying/brute-force run: the global limiter makes such a test
  slow and it would not add signal beyond the allowance tests.
- Client-side XSS rendering is out of scope; this suite covers the API boundary.
