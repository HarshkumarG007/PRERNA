# 12. Document Version Control

**Status:** DRAFT — NOT APPROVED

This document records the administrative lock and version state of the PRERNA prototype associated with this ethics submission package. The study will be conducted against this frozen state.

## 1. Prototype Version Integrity & Evidence Provenance

| Assertion | Evidence | Verified by | Verification date |
| :--- | :--- | :--- | :--- |
| **Candidate Frozen commit** | Git SHA `6ce66f65a37ac327d4a85d20a37e983279a994b5` | `CI CANDIDATE` | 2026-08-12 |
| **Schema version** | `session_type` constraints & HMAC quarantine runtime logs | `VERIFIED` by Independent Agent | 2026-08-12 |
| **AI state** | Source config `mock_mode: true` | `VERIFIED` by Independent Agent | 2026-08-12 |
| **Phase 4.1 PASS** | Phase 4.1 evidence artifact (`walkthrough.md`) | `NOT REPRODUCED` | - |
| **Phase 4.2 PASS** | Previous premature `VERIFIED` assertion (Commit `6b84e91`) based on partial CI run | **RETRACTED** | 2026-08-12 |
| **Overall Phase 4.2 Reproduction** | Automated Testing #101 — FAILED, exit code 101; Rust backend compilation/test target reported multiple Clippy diagnostics and compilation errors. | **NOT VERIFIED** | - |

*Note: The documentation commit `6b84e91` prematurely declared the candidate commit `6ce66f65...` verified. The full `Automated Testing #101` CI job reached a terminal `FAILED` state (exit code 101). The verification claim is therefore formally retracted, and Phase 4.2 status reverts to NOT VERIFIED pending defect fixes and a clean CI reproduction.*

## 3. Ethics Package Revisions

| Version | Date | Description | Author/Reviewer |
| :--- | :--- | :--- | :--- |
| **0.1** | 2026-08-12 | Initial draft preparation (Ethics Submission Preparation Phase) | Engineering Team |
| | | | |

*Note: Changes to the prototype architecture, data collection mechanisms, or study protocol will require a version bump and potential re-submission or amendment to the institutional ethics committee.*
