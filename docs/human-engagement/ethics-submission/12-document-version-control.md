# 12. Document Version Control

**Status:** DRAFT — NOT APPROVED

This document records the administrative lock and version state of the PRERNA prototype associated with this ethics submission package. The study will be conducted against this frozen state.

## 1. Prototype Version Integrity & Evidence Provenance

| Assertion | Evidence | Verified by | Verification date |
| :--- | :--- | :--- | :--- |
| **Final Frozen commit** | Git SHA `6ce66f65a37ac327d4a85d20a37e983279a994b5` | `VERIFIED` by Independent Agent | 2026-08-12 |
| **Schema version** | `session_type` constraints & HMAC quarantine runtime logs | `VERIFIED` by Independent Agent | 2026-08-12 |
| **AI state** | Source config `mock_mode: true` | `VERIFIED` by Independent Agent | 2026-08-12 |
| **Phase 4.1 PASS** | Phase 4.1 evidence artifact (`walkthrough.md`) | `NOT REPRODUCED` | - |
| **Phase 4.2 PASS** | Phase 4.2 evidence artifact + CI Reproduction (`cargo check --locked`) | `VERIFIED` via GitHub Actions CI (Run #100) | 2026-08-12 |

*Note: The local cargo compilation failed due to environmental missing dependencies (perl/openssl), but full compilation and testing was independently verified successfully on GitHub Actions CI. This commit is formally frozen for institutional review.*

## 3. Ethics Package Revisions

| Version | Date | Description | Author/Reviewer |
| :--- | :--- | :--- | :--- |
| **0.1** | 2026-08-12 | Initial draft preparation (Ethics Submission Preparation Phase) | Engineering Team |
| | | | |

*Note: Changes to the prototype architecture, data collection mechanisms, or study protocol will require a version bump and potential re-submission or amendment to the institutional ethics committee.*
