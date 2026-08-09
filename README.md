# PRERNA

### Personalized Real-time Engagement & Neural Resource Assistant

**PRERNA is a local-first desktop platform for adolescent self-discovery, wellbeing support, career exploration, and transparent AI-assisted guidance.**

PRERNA is designed around a simple principle:

> **Sensitive personal information should remain under the user's control by default.**

Core data processing is designed to remain on the user's device. The application uses an encrypted local database, a locally running AI mentor, explicit disclosure before assessment activities, backend-owned authorization, and human-gated escalation for safety-critical workflows.

PRERNA is **not a diagnostic or clinical device** and is not intended to replace qualified mental-health, educational, or medical professionals.

[Getting Started](#-getting-started) · [Features](#-key-features) · [Architecture](#-system-architecture) · [Security](#-security-architecture) · [Safety & Compliance](#-safety--compliance) · [Roadmap](#-roadmap) · [Documentation](#-documentation)

---

## 🌱 Why PRERNA?

Adolescents often have to navigate academic pressure, career uncertainty, emotional challenges, social relationships, and questions about identity using fragmented tools.

PRERNA brings several of these experiences together while treating privacy and transparency as architectural requirements rather than optional features.

The platform is designed to provide:

* Transparent self-discovery activities
* Career and interest exploration
* Emotional and wellbeing reflection
* A locally running AI mentor
* Teen-visible parental insights
* Privacy-preserving school analytics
* Explicit consent and disclosure flows
* Human-gated safety escalation
* Local encrypted storage
* User-controlled export and deletion

PRERNA does **not** aim to secretly profile teenagers or replace human professionals.

---

# ✨ Key Features

| Feature                            | Status                          | Description                                                                                                                                           |
| ---------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Local-First Data Architecture**  | ✅ Implemented                   | Core application data is designed to remain on the user's device. External integrations, where present, are explicitly separated from the local core. |
| **Encrypted Local Database**       | ✅ Implemented                   | SQLite-based local storage with SQLCipher encryption for data at rest.                                                                                |
| **Transparent Assessments**        | ✅ Implemented                   | Assessment activities disclose their purpose before collecting activity data.                                                                         |
| **Gamified Self-Discovery**        | ✅ Implemented                   | Skill Arena, Life Quests, mood/reflection activities, and profile synthesis provide engaging self-discovery experiences.                              |
| **Local AI Mentor**                | ✅ Implemented                   | Quantized GGUF models can run locally through Rust/`llama-cpp-2` integration.                                                                         |
| **Backend-Owned Authentication**   | ✅ Hardened                      | Privileged commands derive identity from the Rust session rather than trusting renderer-supplied user IDs.                                            |
| **MFA State Machine**              | ✅ Hardened                      | Authentication uses explicit `None → PendingMFA → Authenticated` states.                                                                              |
| **Parent/Teen Access Control**     | ✅ Implemented                   | Parent views are restricted through backend authorization and active relationship checks.                                                             |
| **Consent Revocation Audit Trail** | ✅ Implemented                   | Revoked relationships are retained for audit purposes while access is immediately denied.                                                             |
| **Human-Gated Crisis Workflow**    | 🚧 Implemented / Review Pending | Safety escalation requires the defined human-review gate; clinical validation remains pending.                                                        |
| **Career Pathways**                | ✅ Phase 3                       | Career classifier and pathway presentation have been integrated.                                                                                      |
| **School Cohort Analytics**        | 🚧 Implemented                  | Aggregate reporting uses a minimum `k ≥ 5` threshold as an anti-identification safeguard.                                                             |
| **Encrypted Export / Deletion**    | ✅ Implemented                   | Users can control export and deletion of locally stored information.                                                                                  |
| **English / Hindi i18n**           | ✅ Implemented                   | Core user-facing disclosure and consent experiences support English and Hindi.                                                                        |
| **Architecture Decision Records**  | ✅ Added                         | Foundational decisions for encryption, offline AI, and crisis handling are documented under `docs/adr/`.                                              |
| **Frontend Type Safety**           | ✅ Verified                      | TypeScript compilation is checked with `tsc --noEmit`.                                                                                                |

---

# 🏛️ System Architecture

PRERNA uses a local-first desktop architecture built around a React frontend and Rust/Tauri backend.

```text
┌─────────────────────────────────────────────────────────────┐
│                     PRERNA DESKTOP APP                     │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 FRONTEND / WEBVIEW                    │  │
│  │                                                       │  │
│  │ React 19 + TypeScript + Vite + Tailwind CSS v4       │  │
│  │                                                       │  │
│  │ ┌────────────┐ ┌────────────┐ ┌────────────────────┐ │  │
│  │ │ Components │ │  Zustand   │ │ Assessment / i18n │ │  │
│  │ │    / UI     │ │   Store    │ │      Engines       │ │  │
│  │ └────────────┘ └────────────┘ └────────────────────┘ │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │ Tauri IPC                         │
│                          ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    RUST BACKEND                       │  │
│  │                                                       │  │
│  │ Rust + Tauri 2                                       │  │
│  │                                                       │  │
│  │ ┌──────────────┐ ┌──────────────┐ ┌────────────────┐ │  │
│  │ │ IPC Commands │ │ Auth / RBAC  │ │ Safety / Crisis│ │  │
│  │ └──────────────┘ └──────────────┘ └────────────────┘ │  │
│  │                                                       │  │
│  │ ┌──────────────┐ ┌──────────────┐ ┌────────────────┐ │  │
│  │ │ Database DAO │ │ Local AI     │ │ School /       │ │  │
│  │ │ + SQLCipher  │ │ llama.cpp    │ │ External APIs  │ │  │
│  │ └──────────────┘ └──────────────┘ └────────────────┘ │  │
│  └───────────────┬─────────────────┬─────────────────────┘  │
│                  │                 │                        │
│                  ▼                 ▼                        │
│        ┌─────────────────┐  ┌──────────────────┐            │
│        │ Encrypted Local │  │ Local GGUF Model │            │
│        │ SQLite Database │  │    / LLM         │            │
│        └─────────────────┘  └──────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Local-first boundary

"Local-first" is an architectural description, not a claim that the application can never communicate externally.

The core design is:

* Sensitive application data is stored locally by default.
* Core AI inference can run locally.
* Core application functionality does not require a central PRERNA cloud database.
* Renderer code is treated as untrusted input.
* Privileged identity decisions are made by the Rust backend.
* External integrations are isolated and should be explicitly documented.
* Network-dependent features must not silently expand the application's data-sharing boundary.

This distinction is important for maintaining technically defensible privacy claims.

---

# 🔐 Security Architecture

PRERNA has undergone P0 security hardening focused on the frontend/backend trust boundary.

## 1. Backend-Owned Authentication

The frontend is **not trusted to identify the current user**.

Privileged Tauri commands obtain identity from the backend-owned `ActiveSession`.

The session state is explicitly represented as:

```rust
pub enum AuthStatus {
    None,
    PendingMFA(String),
    Authenticated(String),
}
```

The important invariant is:

```text
None
  │
  ▼
PendingMFA
  │
  │ successful MFA
  ▼
Authenticated
```

`PendingMFA` is never treated as an authenticated session.

Therefore:

```text
PendingMFA
    │
    └── get_user_id() → DENY
```

while:

```text
Authenticated
    │
    └── get_user_id() → ALLOW
```

This prevents a partially authenticated session from accessing privileged commands.

---

## 2. Renderer Identity Spoofing Protection

Privileged IPC commands should not accept a renderer-supplied `user_id` to establish authorization.

Instead:

```rust
let user_id = session.get_user_id()?;
```

The backend resolves the authenticated identity itself.

This protects against a compromised or manipulated WebView attempting to impersonate another user by changing an IPC parameter.

The same trust-boundary principle applies to caller identity and parent/teen authorization.

---

## 3. MFA Identity Binding

The MFA verification command obtains the pending identity from the backend session:

```rust
let user_id = session.get_pending_mfa_user()?;
```

The frontend therefore cannot select an arbitrary account for MFA verification.

The intended authorization invariant is:

```text
Frontend-provided user ID
        │
        ▼
      DENIED

Backend PendingMFA identity
        │
        ▼
   MFA verification
        │
        ▼
 Authenticated session
```

---

## 4. Session Clearing and Logout

Logout clears the backend authentication state:

```text
Authenticated
      │
      ▼
   logout()
      │
      ├── clear AuthStatus
      ├── evict associated AI conversation memory
      └── return to None
```

This prevents an authenticated identity or associated local AI conversation context from surviving a logout.

---

## 5. Consent Revocation

Parent/teen relationships use an auditable revocation model.

Instead of physically deleting the relationship row:

```text
status = 'revoked'
revoked_at = <timestamp>
```

Authorization checks only accept:

```text
status = 'active'
```

Therefore:

```text
Active relationship
        │
        ▼
   Parent access
        │
        ▼
   revoke_consent()
        │
        ├── retain audit record
        └── status = revoked
                  │
                  ▼
            future access
                  │
                  ▼
                DENY
```

This preserves an audit trail while preventing continued access.

---

## 6. Role and Tenant Isolation

Educator and reviewer workflows are designed around explicit tenant boundaries.

Authorization should fail closed when required tenant information is missing rather than implicitly assuming a shared/default tenant.

This is particularly important for school and institutional deployments.

---

# 🧠 Local AI Mentor

PRERNA supports a locally running AI mentor using quantized GGUF models through Rust bindings around `llama.cpp`.

The intended architecture is:

```text
Teen
 │
 ▼
React Mentor UI
 │
 │ Tauri IPC
 ▼
Rust AI command
 │
 ▼
Local ConversationStore
 │
 ▼
llama.cpp / GGUF model
 │
 ▼
Local response
```

Core conversation processing can therefore occur without sending the conversation to a hosted AI API.

The backend also owns conversation lifecycle management so that logout can evict associated conversation memory.

### Important limitation

Local inference does not automatically make every deployment completely offline.

If an explicitly integrated external service is used elsewhere in the application, that service remains subject to its own data-sharing boundary and documentation.

---

# 🎯 Assessment & Self-Discovery

PRERNA uses transparent, gamified activities rather than hidden psychological profiling.

Current areas include:

* Skill Arena
* Life Quests
* Mood and reflection activities
* Coping-skill exercises
* Career pathway exploration
* Profile synthesis
* Big Five / RIASEC-oriented assessment experiences

Assessment activities should clearly communicate their purpose before collecting relevant activity data.

Raw interaction data is processed according to the application's local-first data model and should not be represented as a clinical diagnosis.

---

# 💼 Career Pathways

Phase 3 introduced the career pathway classification flow.

The system connects assessment and interest signals to career-oriented exploration through:

```text
Assessment / Activities
          │
          ▼
    Trait / Interest Data
          │
          ▼
   Career Classifier
          │
          ▼
 Career Pathway Results
          │
          ▼
 Exploration / Guidance
```

Career results are intended as exploratory guidance rather than deterministic predictions about a teenager's future.

---

# 🛡️ Safety & Crisis Protocol

PRERNA contains a human-gated safety escalation architecture.

The intended flow is:

```text
Potential high-risk signal
          │
          ▼
     Safety detection
          │
          ▼
    Human review gate
          │
     ┌────┴────┐
     │         │
   Reject    Confirm
     │         │
     ▼         ▼
   Stop    Teen informed
               │
               ▼
        Guardian escalation
```

The system is designed so that a detected signal alone is not sufficient to trigger guardian notification.

### Current status

The engineering architecture is implemented, but the clinical criteria used for risk detection require review by appropriately qualified mental-health professionals before production use.

See:

* [`docs/crisis-protocol.md`](docs/crisis-protocol.md)
* [`docs/adr/0003-human-gated-crisis-protocol.md`](docs/adr/0003-human-gated-crisis-protocol.md)

---

# 👪 Parent / Teen Privacy Model

PRERNA distinguishes between:

### Teen-private information

Sensitive information such as:

* Raw conversations
* Detailed psychological information
* Private reflections
* Sensitive assessment responses

should not automatically become visible to parents.

### Parent-visible information

Parent-facing experiences are designed around:

* Conversation starters
* Appropriate trends
* Supportive observations
* Teen-visible shared information

The guiding principle is:

> **Parents should receive useful support signals without automatically receiving a teenager's private inner-life data.**

The exact production policy remains subject to legal, safety, and product review.

---

# 🏫 School Analytics

PRERNA includes a school/institutional analytics architecture intended to provide aggregate insights rather than expose individual student profiles.

The implementation uses a minimum cohort threshold:

```text
k ≥ 5
```

The purpose is to reduce the risk that an aggregate result can be used to infer information about a specific student.

School integrations remain a separate boundary from the local-first core and must be reviewed independently for data minimization, consent, authorization, and deployment requirements.

---

# 🔒 Privacy & Compliance Position

PRERNA uses privacy-by-architecture principles, but the project does **not** claim that the software itself constitutes legal compliance or certification.

### DPDP alignment

The repository contains an architectural mapping to India's Digital Personal Data Protection framework.

However:

* Legal counsel has not yet certified the implementation.
* Production consent workflows require appropriate verification.
* Regulatory obligations depend on the actual deployment, processing activities, parties involved, and applicable law.

See:

[`docs/dpdp-compliance-mapping.md`](docs/dpdp-compliance-mapping.md)

### Clinical safety

Clinical safety criteria are engineering-authored until reviewed by qualified professionals.

See:

[`docs/crisis-protocol.md`](docs/crisis-protocol.md)

### Product classification

PRERNA is a self-discovery and support application.

**It is not a medical device, diagnostic system, or replacement for professional care.**

---

# 🧪 Verification & Testing

The project uses multiple verification layers.

## Frontend

TypeScript compilation:

```bash
npx tsc --noEmit
```

Frontend tests:

```bash
npm test
```

## Rust backend

```bash
cd src-tauri
cargo test
```

## Security-sensitive regression tests

Important security invariants include tests covering:

* Authentication state transitions
* MFA isolation
* Session clearing
* Consent revocation
* Parent/teen authorization
* Crisis escalation gates
* Backend authorization boundaries

### Verification status

The repository distinguishes between:

**Implemented**

The code exists in the repository.

**Structurally verified**

The relevant code paths and invariants have been inspected.

**Automated test verified**

An automated test covers the invariant.

**Externally reviewed**

A qualified external professional has reviewed the relevant safety/legal/clinical requirement.

These categories are intentionally not treated as interchangeable.

---

# 📊 Code Quality & Coverage

PRERNA uses GitHub Actions for automated development checks and maintains Codecov configuration for coverage reporting.

Coverage targets should be interpreted as engineering quality targets rather than proof of security or clinical correctness.

A high code-coverage percentage cannot by itself establish:

* Legal compliance
* Clinical safety
* Security correctness
* Absence of vulnerabilities
* Product suitability for minors

Those require separate forms of review.

---

# 🏗️ Technology Stack

| Layer           | Technology          | Purpose                              |
| --------------- | ------------------- | ------------------------------------ |
| Frontend        | React 19            | Desktop application UI               |
| Language        | TypeScript          | Type-safe frontend development       |
| Build Tool      | Vite                | Fast development/build pipeline      |
| Styling         | Tailwind CSS v4     | UI styling system                    |
| State           | Zustand             | Frontend application state           |
| Desktop Runtime | Tauri 2             | Native desktop shell and IPC         |
| Backend         | Rust                | Security-sensitive application logic |
| Database        | SQLite / `rusqlite` | Local persistence                    |
| Encryption      | SQLCipher           | Encrypted local database             |
| Local AI        | `llama-cpp-2`       | Local GGUF model inference           |
| Testing         | Vitest              | Frontend testing                     |
| Backend Testing | Cargo test          | Rust unit/integration testing        |
| CI/CD           | GitHub Actions      | Automated validation and builds      |
| Coverage        | Codecov             | Coverage reporting                   |
| Localization    | i18n                | English/Hindi support                |

---

# 🚀 Getting Started

## Prerequisites

Install:

* [Rust](https://www.rust-lang.org/tools/install)
* Node.js 20+
* npm
* Tauri prerequisites for your operating system

For Tauri-specific platform requirements, see the official Tauri prerequisites documentation.

## Clone the repository

```bash
git clone https://github.com/HarshkumarG007/PRERNA.git
cd PRERNA
```

## Install dependencies

```bash
npm install
```

## Start development

```bash
npm run tauri dev
```

This launches the React frontend inside the Tauri desktop application with the Rust backend.

---

# 📦 Production Build

Build the desktop application with:

```bash
npm run tauri build
```

The resulting application bundle is generated according to the platform-specific Tauri configuration.

Before distributing a production build, verify:

* Code signing
* Platform installer configuration
* Native dependencies
* Database encryption configuration
* Model packaging/licensing
* Privacy notices
* Consent implementation
* Safety review
* Legal review

---

# 📁 Repository Structure

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
│   ├── dpdp-compliance-mapping.md
│   ├── disclosure-language-review.md
│   ├── prerna-enterprise-review.md
│   ├── prerna-gap-analysis.md
│   ├── prerna-critical-fixes-and-build-guide.md
│   └── prerna-agent-implementation-plan-v2.md
│
├── mlops/
│   └── Safety / evaluation assets
│
├── public/
│   └── Static frontend assets
│
├── src/
│   ├── ai/
│   ├── assessment/
│   ├── backup/
│   ├── components/
│   │   ├── activities/
│   │   ├── consent/
│   │   ├── crisis/
│   │   ├── dashboard/
│   │   ├── parent/
│   │   ├── settings/
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
├── codecov.yml
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── SYSTEM_EVALUATION_METRICS.md
├── project_context_for_claude.md
└── README.md
```

---

# 🧭 Architecture Decision Records

Important architectural decisions are documented separately so future contributors can understand **why** the system is designed this way.

| ADR                                                      | Decision                                |
| -------------------------------------------------------- | --------------------------------------- |
| [ADR-0001](docs/adr/0001-local-first-encryption.md)      | Local-first encrypted data architecture |
| [ADR-0002](docs/adr/0002-offline-llm-mentor.md)          | Offline/local AI mentor architecture    |
| [ADR-0003](docs/adr/0003-human-gated-crisis-protocol.md) | Human-gated crisis escalation           |

These records should be updated when architectural assumptions materially change.

---

# 🗺️ Development Roadmap

## Phase 1 — Foundation

* Local-first application architecture
* Encrypted local storage
* Transparent assessment model
* Initial safety architecture
* Core desktop application

**Status: ✅ Completed**

---

## Phase 2 — Security & Governance Hardening

* Backend-owned authentication
* MFA state machine
* Renderer identity-spoofing protection
* Parent/teen authorization hardening
* Consent revocation auditability
* Session lifecycle hardening
* Safety and compliance documentation

**Status: ✅ Major P0 hardening completed**

---

## Phase 3 — Product & Architecture Completion

* Career classifier
* Career pathway UI
* Assessment persistence hardening
* Frontend identity-boundary cleanup
* AI mentor integration cleanup
* Code coverage infrastructure
* Architecture Decision Records
* TypeScript compilation verification

**Status: ✅ Completed**

---

## Phase 4 — External Validation

* Licensed clinical review
* Qualified legal review
* Production-grade guardian verification
* Independent security review
* Native Rust CI verification across supported platforms

**Status: 🚧 Next major validation stage**

---

## Phase 5 — Structured Beta

* Small consented cohort
* Real parental verification
* Production telemetry/privacy review
* Accessibility testing
* Performance testing
* Safety monitoring

**Status: ⏳ Planned**

---

## Phase 6 — Governance & Production Readiness

* Formal grievance mechanism
* Breach-response procedure
* Production code signing
* Release security review
* Dependency/SBOM governance
* Operational incident response

**Status: ⏳ Planned**

---

# 📚 Documentation Index

| Document                                                                                         | Purpose                                       |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| [`docs/crisis-protocol.md`](docs/crisis-protocol.md)                                             | Crisis detection and human-review protocol    |
| [`docs/dpdp-compliance-mapping.md`](docs/dpdp-compliance-mapping.md)                             | DPDP architectural mapping                    |
| [`docs/disclosure-language-review.md`](docs/disclosure-language-review.md)                       | English/Hindi disclosure and consent language |
| [`docs/adr/0001-local-first-encryption.md`](docs/adr/0001-local-first-encryption.md)             | Local-first encryption decision               |
| [`docs/adr/0002-offline-llm-mentor.md`](docs/adr/0002-offline-llm-mentor.md)                     | Local AI architecture decision                |
| [`docs/adr/0003-human-gated-crisis-protocol.md`](docs/adr/0003-human-gated-crisis-protocol.md)   | Crisis escalation architecture decision       |
| [`SYSTEM_EVALUATION_METRICS.md`](SYSTEM_EVALUATION_METRICS.md)                                   | System evaluation and quality metrics         |
| [`project_context_for_claude.md`](project_context_for_claude.md)                                 | Architectural context for AI coding agents    |
| [`docs/prerna-enterprise-review.md`](docs/prerna-enterprise-review.md)                           | Enterprise architecture review                |
| [`docs/prerna-gap-analysis.md`](docs/prerna-gap-analysis.md)                                     | Security and implementation gap analysis      |
| [`docs/prerna-critical-fixes-and-build-guide.md`](docs/prerna-critical-fixes-and-build-guide.md) | Critical fixes and build guidance             |
| [`docs/prerna-agent-implementation-plan-v2.md`](docs/prerna-agent-implementation-plan-v2.md)     | Implementation roadmap                        |

---

# 🤝 Contributing

Contributions are welcome through issues and pull requests.

Because PRERNA handles sensitive adolescent information, contributions affecting the following areas require additional scrutiny:

* Authentication
* Authorization
* Consent
* Assessment data
* AI conversations
* Crisis handling
* Parent/teen visibility
* School analytics
* Encryption
* External integrations

### Security-sensitive changes

Do not weaken or bypass backend authorization merely to simplify frontend development.

In particular:

> **The renderer must never become the source of truth for authorization identity.**

Changes to security-sensitive paths should include appropriate regression tests and documentation updates.

---

# 🔐 Responsible Disclosure

If you discover a security vulnerability, please avoid publicly exposing exploit details before the issue can be assessed and addressed.

Security-sensitive reports should include:

* A clear description
* Reproduction steps
* Affected component
* Security impact
* Suggested mitigation, if available

---

# 📄 License

PRERNA is released under the MIT License.

See [`LICENSE`](LICENSE) for the complete license text.

---

# 👤 Author

**Harshkumar G.**

GitHub: [@HarshkumarG007](https://github.com/HarshkumarG007)

---

# ⚠️ Project Status

PRERNA is an actively developed project.

The repository contains substantial implemented functionality and security hardening, but it should **not be interpreted as production-certified merely because features are implemented or tests exist**.

The following areas still require external validation before a production deployment involving minors:

* Clinical safety review
* Legal/privacy review
* Production guardian-consent verification
* Independent security assessment
* Cross-platform native CI verification
* Operational incident-response procedures

Implementation maturity and external certification are deliberately treated as separate milestones.

---

## Philosophy

PRERNA is built around a simple idea:

> **Technology should help young people understand themselves without turning their private lives into someone else's dataset.**

Local-first by design.
Transparent by default.
Human oversight where it matters.
Privacy as an architectural constraint.

**Built with care for the people behind the data.**
