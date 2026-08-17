# PRERNA Security Evidence Matrix

This matrix formalizes PRERNA's security and privacy invariants, separating aspirational design goals from verifiable evidence.

## Evidence Lifecycle

Evidence status must progress monotonically:
`IMPLEMENTED` → `TESTED` → `CI VERIFIED` → `SECURITY REVIEWED` → `EXTERNALLY VALIDATED` → `PRODUCTION VERIFIED`

## Matrix

| Security Claim | Implementation Mechanism | Test Reference | CI Verification | External Review | Status | Not Tested |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Renderer cannot choose privileged identity | `AuthStatus` session getter | `T15.2` | Pending | N/A | **TESTED** | Integration |
| Unauthenticated users cannot invoke mentor | `AuthStatus` enforcement | `T15.5` | Pending | N/A | **IMPLEMENTED** | Integration |
| Pending MFA cannot invoke privileged operations | `AuthStatus` enforcement | `T15.6` | Pending | N/A | **IMPLEMENTED** | Integration |
| Crisis events persist before returning response | Synchronous DB persistence | `T15.1`, `T15.3` | Pending | Clinical review later | **TESTED** | CI |
| Cross-user isolation enforced for crisis events | Session ID binding | `T15.7` | Pending | N/A | **IMPLEMENTED** | Integration |
| Duplicate crisis signals are preserved | Unique Event ID generation | `T15.8` | Pending | N/A | **IMPLEMENTED** | Integration |
| Reviewer ownership enforced for resolutions | Crisis DB assignment checks | `T15.9` | Pending | N/A | **IMPLEMENTED** | Integration |
| Guardian notification ordering enforced | Backend state machine | `T15.10` | Pending | Clinical/legal review | **IMPLEMENTED** | Integration |
| Small cohorts suppressed below k-threshold | Aggregate disclosure controls | — | — | Required | **PENDING** | All |
| Crisis criteria clinically valid | — | — | — | Required | **PENDING** | All |

*Note: This matrix will be updated with explicit GitHub Actions Run IDs when CI verification passes.*
