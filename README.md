# PRERNA

### Personalized Real-time Engagement & Neural Resource Assistant

**A local-first desktop platform for transparent, privacy-conscious self-discovery and AI-assisted mentoring for teenagers.**

PRERNA combines self-discovery activities, career exploration, wellbeing-oriented reflection, a locally running AI mentor, and privacy-preserving family/school interfaces in a native desktop application.

The project is designed around a simple principle:

> **The person using PRERNA should understand what the system collects, why it collects it, and who can access it.**

PRERNA is designed as a **local-first application**: core user data and processing are intended to remain on the user's device unless an explicitly documented external service is used.

> **Important:** PRERNA is currently an engineering project and is **not certified as a clinical, medical, legal, or production child-safety system**. Clinical and legal review remain external dependencies before a real-user beta.

---

## 📌 Project Status

| Area                        | Status                  | Notes                                                                               |
| --------------------------- | ----------------------- | ----------------------------------------------------------------------------------- |
| Local-first architecture    | ✅ Implemented           | Core application state and sensitive processing are designed around local execution |
| Encrypted local database    | ✅ Implemented           | SQLite/SQLCipher-based encrypted storage                                            |
| Rust/Tauri backend          | ✅ Implemented           | Privileged operations execute through the Rust backend                              |
| AuthStatus security model   | ✅ Implemented           | `None → PendingMFA → Authenticated` state machine                                   |
| Renderer identity isolation | ✅ Implemented           | Privileged IPC resolves identity from backend session state                         |
| Role / tenant isolation     | ✅ Implemented           | Backend authorization boundaries for privileged roles                               |
| AI Mentor                   | ⚠️ Mocked / unavailable in study build | Local LLM architecture designed using GGUF/llama.cpp but mocked for study |
| Assessment disclosure gates | ✅ Implemented           | `DisclosureGate` integrated into remaining Phase 3 activities                       |
| Frontend security hygiene   | ✅ Implemented           | Renderer no longer supplies privileged `user_id` values                             |
| Career pathway classifier   | 🚧 Integrated           | Feature implementation is present; further validation remains                       |
| Crisis protocol             | 🚧 Engineering complete | External clinical review still required                                             |
| Synthetic crisis drill      | 🚧 Documented           | Backend execution must be confirmed in a native Rust environment                    |
| Parental verification       | 🚧 Architecture defined | Production provider and legal approach remain subject to review                     |
| DPDP compliance             | ⏳ Legal review pending  | Architecture mapping exists; this is not a legal certification                      |
| Clinical validation         | ⏳ Pending               | Requires qualified licensed reviewer                                                |
| Production beta             | ⏳ Blocked               | Requires external review and production-grade consent verification                  |

### Current milestone

**Phase 3 — Substantially Complete**

**Phase 4 — In Preparation / External Validation**

The repository is **not being represented as production-certified** until the remaining native backend verification, clinical review, legal review, and production guardian-verification work are completed.

---

## ✨ Core Capabilities

### 🔐 Local-First Privacy

PRERNA is architected so that sensitive user information is processed locally wherever practical.

* Encrypted local database using SQLite/SQLCipher
* Backend-owned sensitive state
* No renderer-controlled privileged identity
* Local AI inference architecture
* Local conversation context management
* Explicit data export and deletion pathways
* External services are treated as explicit architectural boundaries rather than implicit dependencies

Local-first is an **architectural design goal**, not a claim that every future integration will necessarily be offline.

---

### 🧠 Local AI Mentor

PRERNA includes a locally running AI mentor designed around privacy-conscious interaction.

The backend uses Rust bindings around llama.cpp-compatible inference and quantized GGUF models.

Key principles:

* AI inference is intended to occur locally
* Renderer code does not directly own privileged conversation state
* Conversation context is managed by the Rust backend
* Logout clears the authenticated session
* Associated local conversation context is evicted on logout
* The AI mentor is not presented as a therapist, diagnostician, or replacement for professional support

---

### 🎮 Transparent Self-Discovery

PRERNA uses interactive activities rather than presenting psychological profiling as a hidden background process.

Examples include:

* Skill Arena
* Life Quests
* Mood-oriented reflection
* Coping-skill activities
* Career exploration
* Profile synthesis

PRERNA follows the principle: **No profile-data collection before disclosure.** 

Before an activity that collects profile-relevant information can begin, the user must be shown the applicable disclosure and acknowledge it. This boundary is implemented through the frontend `DisclosureGate` architecture (integrated for Skill Arena, Coping Skills, etc.) and corresponding regression tests.

The disclosure mechanism is an engineering control. Its legal sufficiency remains subject to external legal review.

---

### 🚨 Human-Gated Crisis Protocol

PRERNA contains an engineered crisis-escalation pathway designed around human review.

The intended flow is:

```text
Signal Detection
      ↓
Pending Crisis Event
      ↓
Human Reviewer Claim
      ↓
Risk Resolution
      ↓
Teen Notification
      ↓
Guardian Notification
```

The backend is designed to enforce the ordering of privileged actions rather than trusting the frontend to enforce it.

Important constraints include:

* A crisis event must exist before resolution
* Reviewer actions are tied to the reviewer who claimed the event
* Guardian notification is blocked before required review state exists
* Guardian notification is blocked before the teen has been informed
* Backend authorization is authoritative

The crisis criteria themselves are **engineering-authored and provisional** until reviewed by a qualified mental-health professional.

---

### 👨👩👧 Teen-Visible Parent Interface

PRERNA is designed so that parent-facing information is intentionally constrained.

The architecture distinguishes between:

* raw/private user information
* parent-safe information
* conversation starters
* aggregated trends

The teen-visible parent view is intended to make the information boundary explicit rather than silently exposing private psychological information.

---

### 🏫 School / Cohort Analytics

PRERNA includes an architecture for aggregate school-level insights.

The intended model emphasizes:

* aggregation rather than individual profiling
* tenant isolation
* minimum cohort thresholds
* role-based authorization
* backend-enforced access controls

The current architecture uses a hard **`k ≥ 5`** threshold where cohort anonymity is required.

Institutional integrations remain explicit external-service boundaries and are not part of the claim that all PRERNA processing is permanently offline.

---

# 🛡️ Security Architecture

Security is treated as a backend trust-boundary problem rather than a frontend convention.

## AuthStatus State Machine

The application uses an explicit authentication state machine:

```text
None
  │
  ├── login
  ▼
PendingMFA
  │
  ├── successful MFA verification
  ▼
Authenticated
```

Privileged identity resolution is performed by the Rust backend.

### Privileged commands

Authenticated commands use the backend session getter:

```rust
session.get_user_id()?
```

rather than trusting renderer-provided identity values.

This means:

* `None` → denied
* `PendingMFA` → denied for authenticated-only commands
* `Authenticated` → user identity available to the backend

MFA verification uses the corresponding pending-MFA session state.

---

## Renderer Spoofing Protection

The WebView/renderer is treated as an untrusted caller.

Privileged commands should not accept a caller-controlled:

```text
user_id
```

as the authority for authorization.

Instead:

```text
Renderer
   │
   │ invoke(command)
   ▼
Rust IPC Handler
   │
   │ resolve authenticated session
   ▼
Backend Authorization
   │
   ▼
Database / Protected Operation
```

This prevents a renderer from simply changing an ID and attempting to operate on another user's records.

---

## Role and Tenant Isolation

Privileged institutional operations enforce authorization boundaries for:

* role
* tenant
* authenticated identity

Missing tenant information fails closed rather than implicitly granting broad access.

This is particularly important for educator/reviewer workflows where records must not cross organizational boundaries.

---

## Consent Revocation

Parental consent relationships are represented as revocable state rather than being silently deleted.

The intended lifecycle is:

```text
active
  ↓
revoked
```

Once revoked, subsequent parent-view authorization checks must fail.

This preserves an audit trail while preventing continued access.

---

## Logout Security

Logout is treated as a security boundary.

The intended sequence is:

```text
Authenticated
     ↓
logout
     ↓
AuthStatus = None
     ↓
associated local AI conversation context evicted
```

The backend therefore does not rely solely on the frontend to forget sensitive state.

---

# 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                 React + TypeScript + Vite                    │
│                                                              │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ UI Components │  │ Zustand      │  │ Disclosure /     │  │
│  │ & Activities  │  │ State        │  │ Consent Gates    │  │
│  └───────────────┘  └──────────────┘  └──────────────────┘  │
│                         │                                    │
│                         │ Tauri IPC                          │
└─────────────────────────┼────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                         RUST BACKEND                         │
│                         Tauri 2                              │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────────┐ │
│  │ IPC Commands │ │ AuthStatus   │ │ Policy / Safety     │ │
│  │              │ │ Session      │ │ Enforcement         │ │
│  └──────────────┘ └──────────────┘ └─────────────────────┘ │
│          │                 │                    │            │
│          ▼                 ▼                    ▼            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                 Data / Service Layer                   │ │
│  │                                                        │ │
│  │   SQLite / SQLCipher       Local LLM       School API  │ │
│  └───────────────────────────────────────────────────────┘ │
└───────────────┬──────────────────────┬─────────────────────┘
                │                      │
                ▼                      ▼
       ┌─────────────────┐    ┌────────────────────┐
       │ Encrypted Local │    │ Local GGUF Model   │
       │ Database        │    │ / llama.cpp        │
       └─────────────────┘    └────────────────────┘
```

### Why Tauri?

PRERNA uses Tauri because it provides:

* native OS WebView integration
* Rust backend execution
* smaller application footprint than Electron in typical configurations
* a clear frontend/backend trust boundary
* strong suitability for local-first desktop applications

The exact security properties of the deployed application still depend on configuration, platform security, dependencies, signing, and operational controls.

---

# 🧰 Technology Stack

| Layer      | Technology          | Purpose                                    |
| ---------- | ------------------- | ------------------------------------------ |
| Frontend   | React 19            | Desktop application UI                     |
| Language   | TypeScript          | Type-safe frontend development             |
| Build      | Vite                | Frontend development and production builds |
| Styling    | Tailwind CSS v4     | UI styling system                          |
| State      | Zustand             | Application state management               |
| Desktop    | Tauri 2             | Native desktop shell and IPC               |
| Backend    | Rust                | Security-sensitive application logic       |
| Database   | SQLite / `rusqlite` | Local persistence                          |
| Encryption | SQLCipher           | Encrypted database storage                 |
| Local AI   | `llama-cpp-2`       | Local GGUF inference                       |
| Testing    | Vitest              | Frontend tests                             |
| Testing    | Cargo test          | Rust/backend tests                         |
| CI/CD      | GitHub Actions      | Automated validation and builds            |
| Coverage   | Codecov             | Coverage reporting/enforcement             |

---

# 📂 Repository Structure

```text
PRERNA/
│
├── .github/
│   └── workflows/
│       ├── test.yml
│       └── release.yml
│
├── docs/
│   ├── adr/
│   │   ├── 0001-local-first-encryption.md
│   │   ├── 0002-offline-llm-mentor.md
│   │   └── 0003-human-gated-crisis-protocol.md
│   │
│   ├── crisis-protocol.md
│   ├── crisis-drill-runbook.md
│   ├── synthetic-crisis-drill-runbook.md
│   ├── dpdp-compliance-mapping.md
│   ├── disclosure-language-review.md
│   ├── parental-verification-architecture.md
│   ├── review-briefs/
│   │   ├── clinical-review-brief.md
│   │   └── legal-review-brief.md
│   ├── prerna-enterprise-review.md
│   ├── prerna-gap-analysis.md
│   ├── prerna-critical-fixes-and-build-guide.md
│   └── prerna-agent-implementation-plan-v2.md
│
├── mlops/
│
├── public/
│
├── src/
│   ├── ai/
│   ├── assessment/
│   ├── backup/
│   ├── components/
│   │   ├── activities/
│   │   ├── ai/
│   │   ├── consent/
│   │   ├── crisis/
│   │   ├── dashboard/
│   │   ├── mentor/
│   │   ├── parent/
│   │   ├── skills/
│   │   └── synthesis/
│   ├── db/
│   ├── engine/
│   ├── hooks/
│   ├── parent/
│   ├── store/
│   ├── synthesis/
│   └── tests/
│
├── src-tauri/
│   ├── src/
│   │   ├── ai/
│   │   ├── commands/
│   │   ├── db/
│   │   ├── school_api.rs
│   │   ├── lib.rs
│   │   └── main.rs
│   └── tauri.conf.json
│
├── package.json
├── package-lock.json
├── codecov.yml
├── SYSTEM_EVALUATION_METRICS.md
├── LICENSE
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Install:

* Rust stable toolchain
* Node.js 20+
* npm
* Tauri prerequisites for your operating system

For platform-specific requirements, consult the official Tauri prerequisites documentation.

## Clone

```bash
git clone https://github.com/HarshkumarG007/PRERNA.git
cd PRERNA
```

## Install frontend dependencies

```bash
npm install
```

## Start development

```bash
npm run tauri dev
```

This launches the React frontend together with the Rust/Tauri backend.

---

# 🧪 Verification

## TypeScript

```bash
npx tsc --noEmit
```

The latest Phase 3/4A work has been validated against TypeScript compilation.

## Frontend tests

```bash
npm test
```

The latest reported frontend verification completed with:

```text
24 tests passing
```

## Rust checks

Run from the Tauri directory:

```bash
cd src-tauri

cargo check
cargo test
```

The repository includes backend tests for authorization and crisis-path invariants.

> **Verification note:** Rust compilation/test results should be considered authoritative only when executed successfully in a native environment or CI. A previous development environment did not have `cargo` available, so backend verification must not be claimed merely because the source has been patched.

---

# 🔒 Safety & Compliance

PRERNA deliberately distinguishes between:

1. **Engineering implementation**
2. **Automated verification**
3. **External professional validation**
4. **Production certification**

These are not interchangeable.

## Clinical review

The crisis-detection criteria and escalation policy are engineering-authored proposals.

They require review by a qualified licensed mental-health professional before being treated as clinically validated.

See:

`docs/crisis-protocol.md`

and:

`docs/review-briefs/clinical-review-brief.md`

---

## Legal / DPDP review

The project contains an architecture-to-DPDP mapping, but this does **not** constitute legal advice or certification.

See:

`docs/dpdp-compliance-mapping.md`

and:

`docs/review-briefs/legal-review-brief.md`

Qualified legal counsel must review the actual production data flows, consent mechanisms, retention policies, processor relationships, notices, and operational procedures.

---

## Guardian Verification

The current project distinguishes development simulation from production verification.

A provider-independent production architecture has been documented in:

`docs/parental-verification-architecture.md`

The final provider and verification mechanism remain subject to legal, security, operational, and product review.

The architecture intentionally does not claim that a particular identity provider, Aadhaar/DigiLocker flow, payment-card method, or other mechanism is automatically legally sufficient.

---

## Crisis Drill

A synthetic end-to-end crisis drill has been documented (`docs/synthetic-crisis-drill-runbook.md`) to validate the intended workflow and its invariant constraints without using real vulnerable-person data. Native Rust execution remains part of the final verification evidence.

---

# 📜 Important Safety Disclaimer

PRERNA is **not**:

* a medical device
* a diagnostic system
* a therapist
* a replacement for a licensed mental-health professional
* a substitute for emergency services
* a guarantee of legal or regulatory compliance

Any wellbeing or psychological information produced by PRERNA should be treated as supportive self-discovery information rather than a clinical diagnosis.

Where a user may be at immediate risk, real-world professional and emergency support should take precedence over software output.

---

# 🗺️ Roadmap

## Phase 1 — Foundation

**Status: ✅ Substantially implemented**

* Local-first architecture
* Encrypted local storage
* Rust/Tauri backend
* Local AI architecture
* Disclosure-oriented assessment design
* Human-gated crisis architecture

---

## Phase 2 — Security & Governance Foundations

**Status: ✅ Substantially implemented**

* AuthStatus state machine
* Backend-owned identity resolution
* Renderer identity spoofing protections
* Role/tenant authorization boundaries
* Consent revocation enforcement
* Backend-owned AI conversation state
* Logout memory eviction
* Security-focused documentation

---

## Phase 3 — Feature Completion

**Status: 🚧 Substantially complete**

Implemented/integrated work includes:

* Career pathway classification
* Assessment activity integration
* Disclosure gates
* Skill Arena disclosure enforcement
* Coping Skills disclosure enforcement
* Frontend `user_id` hygiene
* Code coverage configuration
* Foundational ADRs
* TypeScript compilation
* Frontend regression tests

Remaining work is primarily validation, integration hardening, and evidence collection rather than representing the phase as completely certified.

---

## Phase 4 — External Validation

**Phase 4 technical foundation: implemented. Native verification and external professional validation pending.**

* **P4-1 — Production Guardian Verification:** Provider-independent interface proposed; production implementation and legal review pending.
* **P4-2 — Clinical Review:** Requires a licensed clinical reviewer for detection criteria, escalation rules, and disclosures.
* **P4-3 — Crisis Drill:** Requires native backend execution, SLA measurement, and invariant verification.
* **P4-4 — Legal Review:** Requires DPDP architecture review, consent review, retention/deletion review, and operational compliance review.

*(See [Safety & Compliance](#-safety--compliance) for detailed validation requirements.)*

---

## Phase 5 — Structured Beta

**Status: ⏳ Blocked pending external validation**

Beta should begin only after:

* clinical review
* legal review
* production guardian verification
* native backend test verification
* crisis drill evidence
* security review
* operational incident procedures

are complete and accepted by the responsible project stakeholders.

---

# 📚 Documentation

| Document                                        | Purpose                                                |
| ----------------------------------------------- | ------------------------------------------------------ |
| `docs/crisis-protocol.md`                       | Crisis detection and human-review protocol             |
| `docs/synthetic-crisis-drill-runbook.md`        | Synthetic end-to-end crisis validation                 |
| `docs/dpdp-compliance-mapping.md`               | Engineering mapping to DPDP requirements               |
| `docs/parental-verification-architecture.md`    | Proposed production guardian-verification architecture |
| `docs/disclosure-language-review.md`            | English/Hindi disclosure and consent language          |
| `docs/review-briefs/clinical-review-brief.md`   | Clinical reviewer package                              |
| `docs/review-briefs/legal-review-brief.md`      | Legal reviewer package                                 |
| `docs/adr/0001-local-first-encryption.md`       | Local-first encryption decision                        |
| `docs/adr/0002-offline-llm-mentor.md`           | Local AI architecture decision                         |
| `docs/adr/0003-human-gated-crisis-protocol.md`  | Crisis governance architecture decision                |
| `SYSTEM_EVALUATION_METRICS.md`                  | System performance and evaluation metrics              |
| `docs/prerna-enterprise-review.md`              | Foundational enterprise review                         |
| `docs/prerna-gap-analysis.md`                   | Architectural gap analysis                             |
| `docs/prerna-critical-fixes-and-build-guide.md` | Critical fixes and build guidance                      |
| `docs/prerna-agent-implementation-plan-v2.md`   | Detailed implementation roadmap                        |
| `project_context_for_claude.md`                 | AI-agent architectural onboarding                      |

---

# 🤝 Contributing

Contributions are welcome, but PRERNA handles unusually sensitive information.

Changes involving any of the following require additional scrutiny:

* authentication
* authorization
* consent
* disclosure
* assessment telemetry
* psychological profiles
* AI conversation history
* crisis detection
* guardian notification
* school analytics
* data export/deletion
* external data processors

Contributors should preserve the backend trust boundaries and documented architectural invariants.

Before submitting a security-sensitive change, review the relevant ADR and documentation under `docs/`.

---

# 🔐 Security Reporting

Please do not publicly disclose a serious security vulnerability before the project has had an opportunity to investigate it.

Security-sensitive reports should include:

* affected component
* reproducible steps
* expected behavior
* actual behavior
* security impact
* whether sensitive data can be accessed or modified

For production deployments, a dedicated security-reporting process should be established before handling real adolescent data.

---

# 📄 License

PRERNA is released under the MIT License.

See:

`LICENSE`

---

# 👤 Author

**Harshkumar G.**

GitHub: `@HarshkumarG007`

Repository:

`https://github.com/HarshkumarG007/PRERNA`

---

## Project Philosophy

PRERNA is built around a simple idea:

> **Privacy should be an architectural property, transparency should be visible to the user, and safety decisions should not be hidden behind software automation.**

The goal is not to make software that knows everything about a teenager.

The goal is to build software that helps a teenager understand themselves **without unnecessarily taking ownership of their inner life away from them.**

---

**Built local-first, on purpose.**
