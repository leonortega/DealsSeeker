# OWASP Top 10 traceability

Mapping of the OWASP Top 10 (2021) categories to `DealsSeeker.SecurityTests`.
Tests are implementation-agnostic API checks; see `README.md` for run
instructions and the outstanding findings.

| Category | Covered by | Notes |
|---|---|---|
| **A01 Broken Access Control** | `AuthenticationSecurityTests.CrossUserOfferAccess_IsDenied`, `.TokenInQueryString_IsNotAccepted`, `.Logout_RevokesTokenAcrossAllProtectedEndpoints`, `.ProtectedEndpoint_RejectsMalformedOrInvalidAuthorizationHeader` | Ownership is enforced in the service and the token only in the `Authorization` header. |
| **A02 Cryptographic Failures** | `DataExposureSecurityTests.StoredCredentials_AreSaltedPbkdf2Hashes`, `.AuthAndProfileResponses_NeverExposePasswordsOrHashes`, `.FailedLogin_DoesNotReturnTheStoredHash` | PBKDF2-HMAC-SHA256, per-user salt, no credentials on the wire. |
| **A03 Injection** | `InputValidationSecurityTests.InjectionStrings_AreTreatedAsData`, `.XssPayloads_AreStoredAsDataAndDoNotFailRequests`, `DataExposureSecurityTests.ValidationErrors_UseStandardShapeWithoutImplementationDetails` | SQL-injection strings are treated as search text. XSS payloads are stored verbatim and **returned unescaped** — see finding 2 in `README.md`; no output-encoding control is asserted. |
| **A04 Insecure Design** | `RateLimitSecurityTests.*`, `InputValidationSecurityTests.ValidationFailure_PerformsNoWork`, `OversizedImageDataUrl_IsRejected` | Allowances and validation are applied before work; rate-limit state is isolated per test. |
| **A05 Security Misconfiguration** | `OwaspSecurityMisconfigurationTests.CorsPreflight_FromAllowedOrigin_IsPermitted`, `.CorsPreflight_FromUnknownOrigin_IsNotReflected`, `.ValidationError_UsesProblemDetailsContentType` | CORS is allow-list based and error bodies use `application/problem+json`. Two skipped tests record missing security headers and the Development stack-trace leak. No automated configuration drift or patch-level check. |
| **A06 Vulnerable and Outdated Components** | — | Not covered. No dependency/CVE scanning is part of this suite. |
| **A07 Identification and Authentication Failures** | `AuthenticationSecurityTests.PasswordLength_EnforcesDeclaredBoundaries`, `.Password_RequiresLetterAndDigit`, `.EmailNormalization_AllowsCaseInsensitiveLoginAndBlocksDuplicateRegistration`, `.InvalidCredentials_DoNotDistinguishUnknownUserFromWrongPassword` | Password policy, normalization, no user enumeration. No MFA or credential-stuffing simulation. |
| **A08 Software and Data Integrity Failures** | — | Not covered. No CI/CD, deserialization or update-integrity surface in scope. |
| **A09 Security Logging and Monitoring Failures** | `OwaspLoggingAndMonitoringTests.RegistrationEvent_IsLoggedWithoutCredentials`, `.MetricsEndpoint_ExposesRedAndCustomInstruments`, `.HealthEndpoints_ExposeLivenessAndReadiness` | Confirms events reach the log sink without credentials, and that metrics/health probes are exposed. No alerting or log-retention assertion. |
| **A10 Server-Side Request Forgery** | `OwaspSsrfTests.GoogleProvider_EncodesUserInputAndKeepsConfiguredHost`, `.OpenLayersProvider_EncodesUserInputAndKeepsConfiguredHost`, `.LocationSearch_WithSsrfPayload_DoesNotFailOrCallOtherHosts`, `.LocationSearch_OverlongQuery_IsRejectedBeforeCallingProvider` | A recording handler proves user input stays an encoded query value and the host comes only from configuration. |

## Deliberately out of scope

- A06/A08: no supply-chain or integrity tooling is added (would need new dependencies).
- Alert routing, SIEM integration and retention enforcement for A09.
- Live SSRF against real provider infrastructure; all outbound calls are intercepted.
