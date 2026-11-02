# PRERNA — Comprehensive Testing Strategy & Verification Blueprint

**Version:** 1.2.3  
**Classification:** Enterprise Engineering Quality & Verification Blueprint  
**Coverage Standard:** Invariant-Driven Security Testing & Zero-Regression CI Gates  
**Test Execution Matrix:** 51 Rust Tests + 230 TypeScript/Vitest Tests = **281 Automated Tests (100% Pass)**  

---

## 1. Testing Philosophy & Verification Pyramid

PRERNA enforces an **Invariant-Driven Testing Philosophy**: business logic, safety rules, and privacy invariants are codified as mathematical properties and evaluated against adversarial inputs.

```
                   /\
                  /  \     [ LAYER 4: E2E EMULATOR SMOKE TESTS ]
                 /    \    - Streamed APK Install, Founder Bypass, UI Resumption
                /──────\
               /        \    [ LAYER 3: MULTI-PERSONA INTEGRATION ]
              /          \   - Teen, Parent, Adult, School Role-Switching Matrix
             /────────────\
            /              \   [ LAYER 2: SECURITY INVARIANTS & POLICIES ]
           /                \  - DPDP §9(3) Anti-Tracking, Rule 0.3 / 0.7 Crisis Checks
          /──────────────────\
         /                    \  [ LAYER 1: UNIT & CONTRACT TESTS ]
        /                      \ - IPIP / RIASEC Scoring, UTF-8 CryptoVault, Helplines SLA
       /────────────────────────\
```

---

## 2. Test Architecture Breakdown

### 2.1 Layer 1: Rust Core Invariants & Security Suite (51 Tests)

Executed via `cargo test --manifest-path src-tauri/Cargo.toml`.

| Test Module | Test File | Test Count | Key Verification Objectives |
|---|---|---|---|
| **IPC Security Invariants** | `src-tauri/src/commands/security_tests.rs` | 21 | Block unauthenticated `resume_session`, block role self-assignment to `reviewer`/`educator`, enforce PIN MFA checks, test prompt injection delimiters, verify public user data scrubbing. |
| **Crisis State Machine Matrix** | `src-tauri/tests/t15_crisis_matrix.rs` | 10 | Verify crisis event persistence, identity authority, non-crisis handling, reviewer claim ownership, cross-user isolation, and notification ordering. |
| **Database & Schema Rollback** | `src-tauri/src/db/mod.rs` | 8 | Enforce SQLite foreign keys (`PRAGMA foreign_keys = ON`), verify migration fixtures, test transaction rollback failure recovery, test data retention guarantee. |
| **Policy Engine Invariants** | `src-tauri/src/policy/mod.rs` | 4 | Enforce DPDP §9(3) prohibition on under-18 tracking, enforce disclosure invariants, verify AI cannot resolve crisis. |
| **Cognitive & Safety Filters** | `src-tauri/src/ai/safety.rs` & `cognitive.rs` | 8 | Test safety filter catches human clinical claims, test expired evidence blocks decision, test crisis detector classification. |

---

### 2.2 Layer 2: TypeScript & Vitest Test Suites (230 Tests across 47 Files)

Executed via `npx vitest run`.

| Category | Representative Test Suite | Total Tests | Focus |
|---|---|---|---|
| **Crisis Safety** | `src/tests/crisis/patternDetection.test.ts` | 11 | Evaluate severe distress before slang; test Hindi and Hinglish compound phrases. |
| **Helplines SLA** | `src/tests/crisis/helplinesData.test.ts` | 4 | Enforce 180-day staleness gate on government helpline directory. |
| **Auth & Lifecycle** | `src/tests/auth/AuthModalFlow.test.tsx` | 2 | Verify signup completion without dropping back to welcome screen. |
| **Parent Firewall** | `src/tests/integration/ConsentFlow.test.tsx` | 2 | Confirm under-18 users route to parental verification; default-deny sharing. |
| **Psychometrics** | `src/engine/assessment/fusionEngine.test.ts` | 3 | Verify dynamic confidence score scales monotonically with measured items. |
| **Cryptographic Vault** | `src/tests/security/cryptoVault.test.ts` | 5 | Verify standard FIPS 180-4 SHA-256 UTF-8 encoding and stored hash non-acceptance. |
| **School k-Anonymity** | `src/tests/school/InstitutionalAdminPortal.test.tsx` | 4 | Verify batch token generation without student PII; enforce $k \ge 5$ threshold. |
| **Private Beta Gate** | `src/tests/gate/PrivateBetaGate.test.tsx` | 5 | Verify founder sovereign token verification, keyboard space trimming, dash normalization. |
| **Multi-Persona** | `src/tests/integration/MultiPersonaJourney.test.tsx` | 5 | Enforce secure PIN authorization for role switches; verify UPI payment flow. |

---

## 3. Continuous Integration (CI/CD) Quality Pipeline

Every pull request and push to `main` must pass all six GitHub Actions pipelines:

```
[ Push / PR Event ]
       │
       ├──► 1. Code Quality & Linting (.github/workflows/lint.yml)
       │       - npx tsc --noEmit (TypeScript 0 errors)
       │       - cargo fmt --all -- --check (Rust formatting)
       │       - cargo clippy --all-targets -- -D warnings (Rust linter)
       │
       ├──► 2. Automated Testing (.github/workflows/test.yml)
       │       - Vitest suite with v8 coverage: npm test -- --coverage
       │       - Cross-platform Rust tests (Ubuntu & Windows runners)
       │
       ├──► 3. Android ARM64 Release (.github/workflows/build-android.yml)
       │       - Clang NDK r28 cross-compilation for aarch64-linux-android
       │       - 16 KB page-size linker flag verification (-Wl,-z,max-page-size=16384)
       │       - Gradle release APK assembly
       │
       ├──► 4. Security Audit (.github/workflows/security.yml)
       │       - npm audit (zero critical vulnerabilities)
       │       - Secret scanning regex pass
       │
       └──► 5. Production Release Packaging (.github/workflows/release.yml)
               - Triggered on tag v*.*.*
               - Attaches signed APK binary to GitHub Release
```

---

## 4. How to Reproduce All Verifications Locally

### Run Frontend Typecheck & Production Build:
```bash
npx tsc --noEmit
npx vite build
```

### Run Vitest Test Suite with Coverage:
```bash
.\node_modules\.bin\vitest.cmd run --coverage
```

### Run Rust Security Invariants & Integration Matrix:
```bash
cargo test --manifest-path src-tauri/Cargo.toml
```

### Run Rust Linter & Formatting Checks:
```bash
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

### Compile Native Android ARM64 Release APK (Android 15):
```powershell
.\scratch\build_apk.ps1
```
*(Produces `PRERNA-v1.2.3-arm64.apk` with 16 KB page-aligned shared libraries).*

