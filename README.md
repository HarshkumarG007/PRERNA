# PRERNA

### Personalized Real-time Engagement & Neural Resource Assistant

**A local-first desktop application for adolescent self-discovery, reflection, wellbeing support, and guided personal development.**

PRERNA combines transparent assessments, a locally running AI mentor, privacy-preserving data storage, parent/teen consent controls, human-gated crisis workflows, and school-level aggregate analytics.

> **Privacy principle:** PRERNA is designed as a local-first application. Core user data and processing are intended to remain on the user's device unless an explicitly documented external service is used.

---

## Table of Contents

* [Project Status](#-project-status)
* [Why PRERNA](#-why-prerna)
* [Core Capabilities](#-core-capabilities)
* [Security Architecture](#-security-architecture)
* [P0 Security Hardening](#-p0-security-hardening)
* [Authentication & Session Security](#-authentication--session-security)
* [RBAC & Authorization](#-rbac--authorization)
* [Consent & Parent/Tenant Boundaries](#-consent--parenttenant-boundaries)
* [Crisis Safety Architecture](#-crisis-safety-architecture)
* [Cryptographic Data Protection](#-cryptographic-data-protection)
* [System Architecture](#-system-architecture)
* [Technology Stack](#-technology-stack)
* [Getting Started](#-getting-started)
* [Testing & Verification](#-testing--verification)
* [Repository Structure](#-repository-structure)
* [Roadmap](#-roadmap)
* [Documentation](#-documentation)
* [Security Disclosure](#-security-disclosure)
* [Contributing](#-contributing)
* [License](#-license)
* [Author](#-author)

---

# 🚦 Project Status

**Current maturity: Security-hardened development / pre-production**

PRERNA has undergone a focused P0 security-hardening cycle covering:

* authentication and MFA state transitions
* renderer-to-backend identity spoofing
* role-based access control
* object-level crisis authorization
* concurrent reviewer claims
* tenant isolation
* parent/teen authorization
* consent revocation
* conversation-memory lifecycle
* encrypted export/import
* tamper detection
* import atomicity
* account deletion
* audit-trail preservation

The latest security work establishes strong **architectural enforcement and regression tests** for these boundaries.

### Important verification limitation

Some security tests have been authored and structurally reviewed, but production certification requires the complete native Rust test suite to execute successfully in the target CI/build environment.

Therefore:

> **PRERNA should not be represented as independently security-certified, clinically validated, or legally certified solely on the basis of this repository.**

Clinical, legal, and production-operational validation remain separate requirements.

---

# 🎯 Why PRERNA

Adolescents increasingly interact with digital systems that can collect highly sensitive behavioral, emotional, educational, and psychological information.

PRERNA is designed around a different principle:

> **The person using the system should understand what it does, why it does it, and who can access the resulting information.**

The architecture therefore emphasizes:

* local-first processing
* encrypted local storage
* explicit disclosure before sensitive assessments
* backend-enforced authorization
* teen-visible parent information boundaries
* human-gated crisis escalation
* tenant isolation for institutional analytics
* authenticated encrypted exports
* secure deletion
* bilingual English/Hindi experiences

PRERNA is a **self-discovery and support platform**, not a diagnostic or clinical device.

---

# ✨ Core Capabilities

| Capability                           | Status        | Description                                                                                                                  |
| ------------------------------------ | ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Local-first data architecture        | ✅ Implemented | Core application state and processing are designed to remain local unless an explicitly documented external service is used. |
| Encrypted local database             | ✅ Implemented | SQLite-based local storage with SQLCipher encryption.                                                                        |
| Local AI mentor                      | ✅ Implemented | Quantized GGUF models can run locally through Rust/llama.cpp bindings.                                                       |
| Transparent assessments              | ✅ Implemented | Gamified activities disclose their purpose before collecting assessment information.                                         |
| Teen/parent authorization boundaries | ✅ Implemented | Backend authorization controls what parent-facing functionality can access.                                                  |
| MFA state machine                    | ✅ Implemented | Authentication distinguishes `None`, `PendingMFA`, and `Authenticated`.                                                      |
| RBAC                                 | ✅ Implemented | Privileged operations enforce backend-derived roles and permissions.                                                         |
| Crisis reviewer ownership            | ✅ Implemented | Crisis events are protected against unauthorized or concurrent resolution.                                                   |
| Tenant isolation                     | ✅ Implemented | School analytics enforce tenant boundaries and fail closed when tenant context is unavailable.                               |
| Consent revocation                   | ✅ Implemented | Revoked relationships remain auditable while access is denied.                                                               |
| Encrypted export/import              | ✅ Implemented | Password-protected exports use authenticated encryption and reject tampering.                                                |
| Account deletion                     | ✅ Implemented | User-associated database and in-memory state is purged.                                                                      |
| English/Hindi i18n                   | ✅ Implemented | Core interface and disclosure/consent flows support English and Hindi.                                                       |
| Clinical validation                  | ⏳ Pending     | Crisis criteria require qualified clinical review.                                                                           |
| Legal review                         | ⏳ Pending     | DPDP/legal mapping requires qualified legal review.                                                                          |
| Production parental verification     | ⏳ Pending     | Development consent/verification flows must be replaced or validated for real-world production use.                          |

---

# 🛡️ Security Architecture

PRERNA treats the frontend renderer as **untrusted input**.

The security boundary is enforced in the Rust backend rather than relying on frontend state.

```text
┌─────────────────────────────────────────────┐
│              React / WebView                │
│                                             │
│  UI state • forms • navigation • requests   │
│                                             │
│          UNTRUSTED SECURITY BOUNDARY        │
└──────────────────────┬──────────────────────┘
                       │
                 Tauri IPC
                       │
                       ▼
┌─────────────────────────────────────────────┐
│               Rust Backend                  │
│                                             │
│  Authentication / AuthStatus                │
│  RBAC / Object Authorization                │
│  Tenant Isolation                           │
│  Consent Enforcement                        │
│  Crisis Authorization                       │
│  Data Lifecycle                             │
│  Cryptographic Operations                   │
└──────────────┬──────────────┬───────────────┘
               │              │
               ▼              ▼
       ┌──────────────┐ ┌──────────────┐
       │ SQLCipher DB │ │ Local LLM    │
       │ Encrypted    │ │ GGUF Model   │
       │ Local Data   │ │ + Memory     │
       └──────────────┘ └──────────────┘
```

### Security design principles

1. **Never trust renderer-supplied identity.**
2. **Authenticate before authorizing.**
3. **Authorize every privileged operation.**
4. **Fail closed when security context is missing.**
5. **Bind object-level operations to the authenticated actor.**
6. **Enforce tenant boundaries in the backend.**
7. **Keep sensitive memory lifecycle under backend control.**
8. **Preserve audit evidence when consent is revoked.**
9. **Use authenticated encryption for sensitive exports.**
10. **Treat frontend controls as UX, not security controls.**

---

# 🔐 P0 Security Hardening

The P0 security cycle focused on eliminating trust-boundary weaknesses identified during red-team regression.

## 1. Strict authentication state machine

The backend uses:

```rust
pub enum AuthStatus {
    None,
    PendingMFA(String),
    Authenticated(String),
}
```

This prevents an MFA-pending session from being interpreted as an authenticated session.

### Security invariant

```text
None
  │
  └── authenticate ──► PendingMFA
                           │
                           └── valid MFA ──► Authenticated
                                                │
                                                └── logout ──► None
```

`get_user_id()` is restricted to the `Authenticated` state.

`get_pending_mfa_user()` is restricted to the `PendingMFA` state.

---

# 🔑 Authentication & Session Security

Privileged commands derive identity from the backend session rather than accepting arbitrary renderer-provided user IDs.

Conceptually:

```rust
let user_id = session.get_user_id()?;
```

rather than:

```rust
// Unsafe pattern
fn privileged_operation(user_id: String) { ... }
```

This prevents the frontend from impersonating another account by modifying an IPC payload.

### MFA protection

`verify_login_mfa` obtains the pending identity exclusively from backend session state:

```rust
let user_id = session.get_pending_mfa_user()?;
```

The frontend therefore cannot provide an arbitrary `user_id` to complete MFA for another account.

### Logout

Logout:

1. evicts the user's conversation memory
2. clears the authentication state
3. returns the session to `AuthStatus::None`

This prevents authenticated identity and local AI conversation state from surviving a logout.

---

# 👥 RBAC & Authorization

PRERNA uses backend-enforced role authorization.

Security-sensitive roles include:

* Teen
* Parent
* Educator
* Reviewer

Renderer-supplied role information is not trusted for privilege escalation.

For example, a registration payload attempting to specify:

```json
{
  "role": "reviewer"
}
```

must not create a reviewer account.

The backend assigns the appropriate permitted role.

### Privileged operations

Examples of protected operations include:

* crisis resolution
* school report generation
* parent views
* sensitive account operations
* data deletion
* authenticated imports
* consent operations

Authorization occurs at the Rust command boundary.

---

# 🚨 Object-Level Crisis Authorization

Crisis events use object-level authorization rather than relying solely on role membership.

A reviewer must be authorized to act on the specific event.

The security model prevents:

* unauthorized reviewers resolving events
* reviewers resolving events belonging to another reviewer
* resolving unassigned events
* resolving events after authorization context has changed
* concurrent reviewers both successfully claiming the same event

### Concurrent claim invariant

For two reviewers concurrently attempting to claim one event:

```text
Reviewer A ──┐
             ├──► Event
Reviewer B ──┘

Result:

Exactly one → ALLOW
Exactly one → DENY / AlreadyAssigned
```

This protects event ownership against race conditions.

---

# 🏫 Consent & Parent/Tenant Boundaries

## Parent/teen relationship

Parent relationships are represented with explicit status.

Example:

```text
active
revoked
```

Revoking consent does **not** erase the historical relationship record.

Instead:

```text
status = revoked
revoked_at = timestamp
```

This preserves an audit trail while immediately invalidating authorization.

Subsequent authorization checks require:

```sql
status = 'active'
```

Therefore:

```text
Consent active
      │
      ▼
Parent view → ALLOW

Consent revoked
      │
      ▼
Parent view → DENY
```

## Tenant isolation

School analytics enforce tenant ownership at the backend.

The following rules apply:

* missing `tenant_id` → DENY
* students entirely within educator tenant → ALLOW
* mixed-tenant request → DENY
* cross-tenant scraping → DENY

The system therefore fails closed rather than attempting to infer tenant membership from frontend data.

---

# 🧠 Conversation Memory Lifecycle

The local AI mentor maintains conversation context through backend-controlled state.

Sensitive conversation memory is not treated as ordinary frontend state.

### Logout invariant

```text
Authenticated User
       │
       ├── ConversationStore contains user context
       │
       ▼
     Logout
       │
       ├── Evict ConversationStore context
       └── AuthStatus → None
```

This prevents a subsequent account from inheriting the previous user's conversational memory.

### Account deletion

Account deletion is expected to clear:

* user records
* preferences
* audit-associated user data where applicable
* conversation memory
* other user-owned local state

Deletion should be verified through both database and in-memory lifecycle tests.

---

# 🔐 Cryptographic Data Protection

PRERNA supports encrypted local exports/imports.

The security model includes:

### Fresh cryptographic parameters

Exporting identical plaintext with the same password should produce different ciphertext because fresh cryptographic randomness is used.

```text
Same plaintext
      +
Same password
      │
      ├── Export #1 → Ciphertext A
      └── Export #2 → Ciphertext B

A ≠ B
```

### Password authentication

Incorrect passwords must cause import failure.

### Tamper detection

Changing ciphertext must cause authenticated decryption to fail.

### Truncation / malformed input

Truncated or malformed export blobs must be rejected.

### Atomic import

If validation fails during import:

```text
Import begins
     │
     ├── validation
     ├── schema checks
     ├── cryptographic verification
     │
     └── failure
          │
          ▼
       ROLLBACK
```

The user's existing identity/state must remain unchanged.

---

# 🚨 Crisis Safety Architecture

PRERNA's crisis system is intentionally human-gated.

The intended escalation model is:

```text
Potential high-risk signal
          │
          ▼
     Human review
          │
       ┌──┴──┐
       │     │
      DENY  CONFIRM
       │     │
       ▼     ▼
    No       Teen
 escalation informed
              │
              ▼
       Guardian escalation
```

### Important limitation

The crisis-detection criteria are engineering-authored and require qualified clinical review before they should be treated as clinically validated.

PRERNA is **not** a diagnostic system and does not replace:

* licensed mental-health professionals
* emergency services
* counselors
* parents/guardians
* clinical assessment

See [`docs/crisis-protocol.md`](https://github.com/HarshkumarG007/PRERNA/blob/main/docs/crisis-protocol.md) for the current engineering specification.

---

# 🏛️ System Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                             │
│                                                         │
│ React 19 + TypeScript + Vite + Tailwind CSS             │
│                                                         │
│ Components • Zustand • i18n • Assessment UI             │
└─────────────────────────┬───────────────────────────────┘
                          │
                          │ Tauri IPC
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    RUST BACKEND                          │
│                                                         │
│ Tauri 2                                                 │
│                                                         │
│ ┌────────────┐ ┌────────────┐ ┌──────────────────────┐ │
│ │ Auth / MFA │ │ RBAC       │ │ Crisis Authorization │ │
│ └────────────┘ └────────────┘ └──────────────────────┘ │
│                                                         │
│ ┌────────────┐ ┌────────────┐ ┌──────────────────────┐ │
│ │ Consent    │ │ School     │ │ Analytics  │ │ AI / Conversation    │ │
│ │ Enforcement│ │ Analytics  │ │ AI / Conversation    │ │ Store                │ │
│ └────────────┘ └────────────┘ └──────────────────────┘ │
│                                                         │
│                    Data Access Layer                    │
└───────────────┬─────────────────────────┬───────────────┘
                │                         │
                ▼                         ▼
      ┌──────────────────┐       ┌────────────────────┐
      │ SQLCipher SQLite │       │ Local GGUF Model   │
      │ Encrypted Data   │       │ llama.cpp          │
      └──────────────────┘       └────────────────────┘
```

### Why Tauri?

PRERNA uses Tauri because it provides:

* a native desktop application model
* Rust backend security boundaries
* platform WebViews
* substantially smaller application footprint than Electron in many configurations
* no requirement to ship a full Chromium runtime

---

# 🧰 Technology Stack

| Layer      | Technology                | Purpose                              |
| ---------- | ------------------------- | ------------------------------------ |
| Frontend   | React 19                  | Application UI                       |
| Language   | TypeScript                | Type-safe frontend development       |
| Build      | Vite                      | Development/build tooling            |
| Styling    | Tailwind CSS v4           | UI system                            |
| State      | Zustand                   | Frontend state management            |
| Desktop    | Tauri 2                   | Native application shell and IPC     |
| Backend    | Rust                      | Security-sensitive application logic |
| Database   | SQLite / rusqlite         | Local persistence                    |
| Encryption | SQLCipher                 | Database encryption at rest          |
| Local AI   | llama.cpp / `llama-cpp-2` | GGUF model inference                 |
| Testing    | Vitest                    | Frontend tests                       |
| Testing    | Cargo test                | Rust backend tests                   |
| CI/CD      | GitHub Actions            | Automated verification and builds    |

---

# 🚀 Getting Started

## Prerequisites

Install:

* Rust stable
* Node.js 20+
* npm
* Tauri platform prerequisites

Official Tauri prerequisites:

https://tauri.app/start/prerequisites/

Rust:

https://www.rust-lang.org/tools/install

Node.js:

https://nodejs.org/

## Clone

```bash
git clone https://github.com/HarshkumarG007/PRERNA.git
cd PRERNA
```

## Install dependencies

```bash
npm install
```

## Development

```bash
npm run tauri dev
```

## Production build

```bash
npm run tauri build
```

---

# 🧪 Testing & Verification

## Frontend

```bash
npm test
```

## Rust backend

```bash
cd src-tauri
cargo test
```

## Security regression areas

The P0 regression suite covers the following classes of behavior:

| Area           | Regression                                |
| -------------- | ----------------------------------------- |
| Authentication | MFA state isolation                       |
| Authentication | Logout memory eviction                    |
| Authentication | Account deletion                          |
| RBAC           | Renderer role spoofing                    |
| RBAC           | Teen privileged-operation denial          |
| RBAC           | Parent privileged-operation denial        |
| Crisis         | Concurrent reviewer claims                |
| Crisis         | Object-level ownership                    |
| Crisis         | Unassigned event rejection                |
| Crisis         | Logout/context boundary                   |
| Tenant         | Missing tenant fail-closed                |
| Tenant         | Valid same-tenant request                 |
| Tenant         | Mixed-tenant request                      |
| Export         | Fresh salt/nonce behavior                 |
| Export         | Wrong-password rejection                  |
| Export         | Ciphertext tampering rejection            |
| Export         | Truncation/malformed input rejection      |
| Export         | Atomic rollback                           |
| Export         | Successful authenticated import           |
| Consent        | Revocation audit retention                |
| Consent        | Revoked relationship authorization denial |

### Verification status

The security architecture and regression tests have been reviewed structurally.

**Native execution of the complete Rust test suite remains a required release gate wherever CI evidence is not already available.**

---

# 📂 Repository Structure

```text
PRERNA/
│
├── .github/
│   └── workflows/              # CI/CD, testing and security workflows
│
├── docs/                       # Safety, compliance and architecture docs
│
├── mlops/                      # ML evaluation and safety benchmarking
│
├── public/                     # Static frontend assets
│
├── src/                        # React / TypeScript frontend
│   ├── ai/                     # AI mentor frontend integration
│   ├── assessment/             # Assessment engines and activities
│   ├── backup/                 # Export/import functionality
│   ├── components/             # React UI components
│   ├── consent/                # Consent-related UI/logic
│   ├── crisis/                 # Crisis workflow UI
│   ├── dashboard/              # Main application dashboard
│   ├── engine/                 # Frontend business logic
│   ├── parent/                 # Parent visibility/permission logic
│   ├── store/                  # Zustand state
│   ├── synthesis/              # Profile synthesis
│   └── tests/                  # Frontend tests
│
├── src-tauri/                  # Rust/Tauri backend
│   ├── src/
│   │   ├── ai/                 # Local LLM functionality
│   │   ├── commands/           # Tauri IPC command handlers
│   │   ├── db/                 # Database layer and schema
│   │   ├── school_api.rs       # School/institution integration
│   │   └── lib.rs              # Application state and setup
│   └── tauri.conf.json         # Tauri configuration
│
├── SYSTEM_EVALUATION_METRICS.md
├── project_context_for_claude.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

# 🗺️ Roadmap

## Phase 1 — Security & Architecture Foundation

* [x] Local-first architecture
* [x] Encrypted local storage
* [x] Transparent assessment disclosure
* [x] Backend authorization boundaries
* [x] MFA state isolation
* [x] RBAC enforcement
* [x] Tenant isolation
* [x] Crisis object authorization
* [x] Conversation memory eviction
* [x] Encrypted export/import
* [x] Consent revocation auditability

## Phase 2 — Independent Validation

* [ ] Full native Rust test execution in release CI
* [ ] Independent security review
* [ ] Licensed clinical review of crisis criteria
* [ ] Qualified legal review of DPDP implementation
* [ ] Production-grade parental consent verification
* [ ] Threat-model review

## Phase 3 — Product Completion

* [x] Complete career pathway classifier
* [x] Additional assessment activities
* [x] Centralized policy engine
* [x] Expanded accessibility testing
* [x] Performance optimization

## Phase 4 — Controlled Beta

* [ ] Small consented user cohort
* [ ] Real parental verification
* [ ] Operational monitoring
* [ ] Safety incident procedures
* [ ] User feedback and usability evaluation

## Phase 5 — Production Governance

* [ ] Independent security assessment
* [ ] Formal privacy/legal review
* [ ] Clinical governance process
* [ ] Grievance redressal mechanism
* [ ] Breach-response procedure
* [ ] Code signing and release integrity
* [ ] Production release checklist

---

# 📚 Documentation

| Document                                                                                                                                            | Purpose                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| [`docs/crisis-protocol.md`](https://github.com/HarshkumarG007/PRERNA/blob/main/docs/crisis-protocol.md)                                             | Crisis detection and human-review workflow    |
| [`docs/dpdp-compliance-mapping.md`](https://github.com/HarshkumarG007/PRERNA/blob/main/docs/dpdp-compliance-mapping.md)                             | Engineering mapping to India's DPDP framework |
| [`docs/disclosure-language-review.md`](https://github.com/HarshkumarG007/PRERNA/blob/main/docs/disclosure-language-review.md)                       | English/Hindi disclosure and consent language |
| [`SYSTEM_EVALUATION_METRICS.md`](https://github.com/HarshkumarG007/PRERNA/blob/main/SYSTEM_EVALUATION_METRICS.md)                                   | System performance and safety metrics         |
| [`project_context_for_claude.md`](https://github.com/HarshkumarG007/PRERNA/blob/main/project_context_for_claude.md)                                 | Architectural context for development agents  |
| [`docs/prerna-enterprise-review.md`](https://github.com/HarshkumarG007/PRERNA/blob/main/docs/prerna-enterprise-review.md)                           | Architecture and enterprise review            |
| [`docs/prerna-gap-analysis.md`](https://github.com/HarshkumarG007/PRERNA/blob/main/docs/prerna-gap-analysis.md)                                     | Security and feature gap analysis             |
| [`docs/prerna-critical-fixes-and-build-guide.md`](https://github.com/HarshkumarG007/PRERNA/blob/main/docs/prerna-critical-fixes-and-build-guide.md) | Critical fixes and build guidance             |
| [`docs/prerna-agent-implementation-plan-v2.md`](https://github.com/HarshkumarG007/PRERNA/blob/main/docs/prerna-agent-implementation-plan-v2.md)     | Development roadmap                           |

---

# ⚖️ Safety, Privacy & Compliance Disclaimer

PRERNA handles potentially sensitive adolescent information.

Accordingly:

* The project does **not** claim clinical validation unless explicitly documented.
* The project does **not** claim legal certification merely because engineering controls exist.
* DPDP alignment is an engineering objective and requires qualified legal review.
* Crisis detection is not equivalent to clinical diagnosis.
* Human review is a required architectural component of sensitive escalation.
* Production deployment requires appropriate privacy, security, clinical, legal, and operational governance.

PRERNA should not be used as a substitute for professional medical, psychological, emergency, educational, or legal services.

---

# 🔒 Security Disclosure

If you discover a security vulnerability:

1. Do not publicly disclose exploitable details before remediation.
2. Provide enough information to reproduce the issue.
3. Include the affected component and relevant commit/version.
4. Explain the security impact and expected behavior.

Security-sensitive changes involving:

* authentication
* authorization
* consent
* crisis workflows
* encryption
* account deletion
* tenant isolation
* conversation memory

should receive additional review before merging.

---

# 🤝 Contributing

Contributions are welcome.

Because PRERNA handles sensitive adolescent data, security-sensitive changes require a higher review standard than ordinary UI or feature changes.

Contributors should preserve the following invariants:

* renderer input must not establish identity
* authentication must precede authorization
* privileged commands must fail closed
* tenant boundaries must be enforced server-side/backend-side
* consent revocation must immediately invalidate access
* logout must clear sensitive session state
* sensitive memory must follow the authenticated user's lifecycle
* encrypted imports must be authenticated and atomic
* crisis escalation must remain human-gated

---

# 📄 License

PRERNA is released under the MIT License.

See [`LICENSE`](https://github.com/HarshkumarG007/PRERNA/blob/main/LICENSE).

---

# 👤 Author

**Harshkumar G.**

GitHub: [@HarshkumarG007](https://github.com/HarshkumarG007)

---

## Final Note

PRERNA is built around a simple architectural principle:

> **Sensitive information should remain under the control of the person it belongs to whenever technically and operationally possible.**

The project prioritizes transparent behavior, local-first processing, explicit consent, backend-enforced security, human oversight, and honest disclosure of what has—and has not yet—been independently validated.

**Built local-first, on purpose.**
