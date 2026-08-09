<div align="center">

# PRERNA
### Personalized Real-time Engagement & Neural Resource Assistant

**A zero-knowledge, offline-first desktop platform helping teenagers understand themselves — through transparent, gamified self-discovery and a locally-running AI mentor. No cloud. No hidden assessment. No data leaves the device.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Lint](https://github.com/HarshkumarG007/PRERNA/actions/workflows/lint.yml/badge.svg)](https://github.com/HarshkumarG007/PRERNA/actions/workflows/lint.yml)
[![Tests](https://github.com/HarshkumarG007/PRERNA/actions/workflows/test.yml/badge.svg)](https://github.com/HarshkumarG007/PRERNA/actions/workflows/test.yml)
[![Cross-Platform Release](https://github.com/HarshkumarG007/PRERNA/actions/workflows/release.yml/badge.svg)](https://github.com/HarshkumarG007/PRERNA/actions/workflows/release.yml)
[![Security Scan](https://github.com/HarshkumarG007/PRERNA/actions/workflows/security.yml/badge.svg)](https://github.com/HarshkumarG007/PRERNA/actions/workflows/security.yml)
[![Code Coverage](https://codecov.io/gh/HarshkumarG007/PRERNA/branch/main/graph/badge.svg)](https://codecov.io/gh/HarshkumarG007/PRERNA)

[Getting Started](#-getting-started) • [Architecture](#-system-architecture) • [Safety & Compliance](#-safety--compliance-status) • [Roadmap](#-roadmap) • [Documentation](#-documentation-index)

</div>

---

## Why PRERNA

India has 250M+ adolescents and a counselor-to-student ratio near 1:1,500. Existing tools force a choice between generic edtech (academics only), expensive human counseling, or mental-health apps stigmatized enough that teens avoid them. None combine holistic self-discovery (career + emotional + social + cognitive) with genuine privacy and honest, age-appropriate transparency.

PRERNA is built around one non-negotiable design principle: **it never hides what it's doing from the person it's helping.** Every assessment activity discloses what it measures before it runs. Every psychological insight stays encrypted on the user's own machine. And if the system ever detects something genuinely concerning, a trained human reviews it — and the teen is always informed — before any guardian is contacted. Nothing about this product works by surveillance.

---

## ✨ Key Features & Implementation

| Feature | Status | Description |
|---|:---:|---|
| **Zero-Knowledge Privacy (Offline-First)** | ✅ Built | SQLCipher (AES-256) encrypted SQLite. No cloud database exists for core functionality. Guarantees DPDP compliance by ensuring psychological profiles cannot be leaked. |
| **Transparent Gamified Assessment** | ✅ Built | Skill Arena mini-games and Life Quests narrative scenarios — preceded by explicit disclosure. Converts raw gameplay telemetry into standardized Big Five and RIASEC profiles. |
| **Offline AI Mentor** | 🚧 Mock Mode | Uses `llama-cpp-2` to run quantized GGUF models directly on the user's CPU/GPU. An empathetic conversational guide that never sends chat logs to external APIs. *(STATUS: Currently runs in offline mock mode generating static placeholder text, pending final LLM integration).* |
| **Human-Gated Crisis Protocol** | ✅ Built, ⏳ pending clinical review | Scans mood logs and AI chat transcripts for high-risk flags. A trained human must confirm risk before any guardian is contacted. *(STATUS: Guardian notification is simulated via secure backend logging).* |
| **Teen-Visible Parent Dashboard** | ✅ Built | Parents see conversation-starters and trends, never raw psychological data. The teen sees exactly what their parent sees. |
| **DPDP-Aligned Consent Architecture** | 🚧 Mock Mode, ⏳ pending legal review | Verifiable guardian consent required before any under-18 account collects data. Behavioral tracking is structurally disabled. *(STATUS: Parent verification flow is currently simulated. Cryptographic handshake required before production).* |
| **School Cohort Analytics (K-Anonymity)** | ✅ Built | Aggregate wellbeing/career-trend reporting for institutional partners, with a hard `k ≥ 5` threshold to prevent de-anonymization. |
| **Encrypted Local Backup/Export** | ✅ Built | Teen-controlled data export and secure deletion, independent of any parent account. |
| **Bilingual (English/Hindi)** | ✅ Built | Full i18n, with disclosure and consent text held to strict human-review standards in both languages. |

---

## 🏛️ System Architecture

PRERNA relies on a secure, two-tier architecture running entirely on the user's local machine. No server, no API calls for core functionality.

```text
┌──────────────────────────────────────────────────────────┐
│                   FRONTEND (Webview)                     │
│  React 19 + TypeScript + Vite + Tailwind CSS v4          │
│                                                          │
│  ┌────────────────┐ ┌────────────────┐ ┌───────────────┐ │
│  │ UI Components  │ │ Zustand Store  │ │ i18n Engine   │ │
│  └────────────────┘ └────────────────┘ └───────────────┘ │
│          │                  │                  │         │
└──────────┼──────────────────┼──────────────────┼─────────┘
           │                  │ (tauri::invoke)  │
           ▼                  ▼                  ▼
┌──────────────────────────────────────────────────────────┐
│                    BACKEND (Core)                        │
│  Rust + Tauri Framework 2.0                              │
│                                                          │
│  ┌────────────────┐ ┌────────────────┐ ┌───────────────┐ │
│  │ Tauri Handlers │ │ Crisis Protocol│ │ School API    │ │
│  └────────────────┘ └────────────────┘ └───────────────┘ │
│          │                  │                  │         │
│          ▼                  ▼                  ▼         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                  Data Access Layer                  │ │
│  │ ┌───────────────┐               ┌─────────────────┐ │ │
│  │ │ rusqlite DAO  │               │ llama_cpp_2 DAO │ │ │
│  │ └───────────────┘               └─────────────────┘ │ │
│  └───────┬──────────────────────────────────┬──────────┘ │
└──────────┼──────────────────────────────────┼────────────┘
           │                                  │
           ▼                                  ▼
┌──────────────────────┐            ┌──────────────────────┐
│  SQLCipher Database  │            │  Local LLaMA Model   │
│  (AES-256 Encrypted) │            │  (Quantized GGUF)    │
└──────────────────────┘            └──────────────────────┘
```

**Why Tauri over Electron:** native OS webview (WebView2/WebKit) instead of a bundled Chromium — roughly a 10MB binary versus Electron's 100MB+, and no shipped browser attack surface to maintain.

**Why local-first is architectural, not just a feature:** every design decision — encryption at rest, no default network calls, disclosure-gated sessions, human-reviewed crisis escalation — exists because the data PRERNA handles (an adolescent's psychological profile) is among the most sensitive a piece of software can touch. Zero-knowledge isn't a marketing term here; there is no server that could be breached, subpoenaed, or sold, because there is no server.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 19, TypeScript, Vite | Type safety across complex psychological state; ultra-fast HMR dev loop. |
| Styling | Tailwind CSS v4 | Utility-first, glassmorphism UI system built via `@tailwindcss/vite`. |
| State | Zustand | Minimal-boilerplate global state manager, bridges IPC ↔ React cleanly. |
| Desktop Shell | Tauri 2.0 (Rust) | Native webview, small binary (~10MB), no Node runtime shipped, highly secure. |
| Database | SQLite via `rusqlite` + SQLCipher | AES-256 encryption at rest, zero-config, fully local C-bindings. |
| Local AI | `llama-cpp-2` (Rust bindings) | Quantized GGUF inference on CPU/GPU, no massive Python/PyTorch stack, no cloud calls. |
| CI/CD | GitHub Actions | Cross-platform (Windows/macOS/Linux) automated builds, test, lint, and security audits. |

---

## 🔒 Safety & Compliance Status

Being direct about what's engineered versus what's independently verified is a core project value, not a formality:

- **Structurally enforced (verified in CI, not just described):** the crisis-notification invariant — no guardian can be notified unless a human reviewer has confirmed risk *and* the teen has already been informed — is enforced at the Rust IPC layer and covered by an automated test (`test_crisis_invariant_guardian_notification_blocked`) that runs on every push.
- **Built, pending external clinical review:** the specific detection criteria in [`docs/crisis-protocol.md`](docs/crisis-protocol.md) are engineering-authored proposals, not yet reviewed and approved by a licensed mental-health professional. They are intentionally documented as provisional until that review happens.
- **Built, pending external legal review:** [`docs/dpdp-compliance-mapping.md`](docs/dpdp-compliance-mapping.md) documents how the architecture maps to India's DPDP Act, but has not yet been reviewed by qualified legal counsel. Parental consent verification currently uses a simulated flow for development and is explicitly not production-ready for real user data until replaced with genuine verification.

**PRERNA is not a diagnostic or clinical device**, and nothing in this repository should be read as offering medical or psychological diagnosis. It's a self-discovery and support tool designed to encourage teens toward real professional and family support when it matters — never to replace it.

---

## 🚀 Getting Started

### Prerequisites
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- [Node.js](https://nodejs.org/) 20+ and npm
- [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS (WebView2 on Windows, Xcode CLT on macOS, `webkit2gtk` on Linux)

### Setup
```bash
git clone https://github.com/HarshkumarG007/PRERNA.git
cd PRERNA

# Install frontend dependencies
npm install

# Run in development mode (hot-reloading React + Rust backend)
npm run tauri dev
```

### Building a release binary
```bash
npm run tauri build
```
Windows builds statically link OpenSSL (via `bundled-sqlcipher-vendored-openssl`) so the resulting `.exe`/`.msi` has no external DLL dependency on a clean machine.

### Running tests
```bash
# Frontend (Vitest)
npm test

# Backend (Cargo)
cd src-tauri && cargo test
```

---

## 📂 Detailed Folder Structure

This section outlines the complete tree structure of the PRERNA repository along with detailed annotations for each directory and crucial file.

```text
PRERNA/
├── .github/
│   ├── workflows/                  # CI/CD pipelines (lint, test, release, security)
│   └── dependabot.yml              # Automated dependency updates
├── docs/                           # Compliance, safety, and evaluation documentation (see index below)
├── src-tauri/                      # RUST BACKEND (Zero-Knowledge Environment)
│   ├── src/
│   │   ├── ai/                     # Local LLM Mentor logic in Rust (llama.cpp bindings)
│   │   │   ├── prompts.rs          # System prompts for the AI Mentor
│   │   │   └── safety.rs           # Safety guardrails before LLM execution
│   │   ├── commands/               # Specific Tauri IPC command modules
│   │   │   └── ai.rs               # IPC handlers for chat_with_mentor
│   │   ├── db/                     # SQLite Database and SQLCipher encryption logic
│   │   │   ├── mod.rs              # Database connection and CRUD operations
│   │   │   ├── models.rs           # Rust data structures mapped to database rows
│   │   │   └── schema.rs           # Raw SQL schemas for local tables
│   │   ├── school_api.rs           # Logic for any external school integrations
│   │   └── lib.rs & main.rs        # Tauri application setup and entry points
│   └── tauri.conf.json             # Tauri configuration (bundle ID: com.lenovo.prerna)
└── src/                            # REACT / TYPESCRIPT FRONTEND
    ├── ai/                         # Frontend AI interfaces mapping to Rust
    ├── assessment/                 # Assessment logic (Engine, Scenarios, Skills)
    ├── backup/                     # Data export/import utilities & scheduling
    ├── components/                 # React UI Components
    │   ├── activities/             # Gamified Assessments (LifeQuests, MoodMirror, etc.)
    │   ├── consent/                # DPDP Age and Parent Consent Modals
    │   ├── crisis/                 # Human Review Queue and Escalation alerts UI
    │   ├── dashboard/              # Main Teen UI (Widgets, Tracker, Mentor, Profile)
    │   ├── parent/                 # Teen-visible parent dashboard
    │   ├── settings/               # Audit trail, delete data, export data UI
    │   └── synthesis/              # Profile synthesis UI visualizations
    ├── db/
    │   └── schema.sql              # Frontend auto-generated reference of DB schema
    ├── engine/                     # Core Business Logic (Assessment, Consent, Crisis, i18n)
    ├── parent/                     # Raw-profile vs. parent-safe-profile permissions firewall
    ├── store/                      # Zustand Global State Management
    ├── synthesis/                  # Fusion Engine (combines raw traits into profiles)
    └── tests/                      # Automated Tests (Vitest integration & unit tests)
```

---

## 🗺️ Roadmap

- [x] **Phase 1 — Foundation:** local-first architecture, encrypted storage, disclosure-gated assessment, human-gated crisis routing (all verified in CI)
- [ ] **Phase 2 — External Validation:** licensed clinical review of crisis-detection criteria; qualified DPDP legal review — *no further crisis/consent-path features ship ahead of this*
- [ ] **Phase 3 — Feature Completion:** career pathway classifier, remaining assessment activities, centralized policy engine
- [ ] **Phase 4 — Structured Beta:** small consented cohort with real (non-simulated) parental verification
- [ ] **Phase 5 — Governance Hardening:** grievance redressal mechanism, breach notification procedure, code signing
- [ ] **Future:** voice journaling, adaptive activity pacing, counselor marketplace integration, regional language expansion (Tamil, Telugu, Marathi, Bengali)

---

## 📚 Documentation Index

To ensure transparency, clinical safety, and legal compliance, PRERNA maintains several specialized documentation files:

| Document | Purpose |
|---|---|
| [`docs/crisis-protocol.md`](docs/crisis-protocol.md) | Crisis detection criteria and human-review escalation process (provisional pending clinical sign-off) |
| [`docs/dpdp-compliance-mapping.md`](docs/dpdp-compliance-mapping.md) | Architecture-to-law mapping for India's DPDP Act (pending legal review) |
| [`docs/disclosure-language-review.md`](docs/disclosure-language-review.md) | Plain-language English/Hindi consent and disclosure text |
| [`SYSTEM_EVALUATION_METRICS.md`](SYSTEM_EVALUATION_METRICS.md) | Performance, clinical-efficacy, and safety KPIs/SLAs |
| [`project_context_for_claude.md`](project_context_for_claude.md) | Dense architectural onboarding doc for AI coding agents |
| [`docs/prerna-enterprise-review.md`](docs/prerna-enterprise-review.md) | Foundational audit defining phase blocks and architectural goals |
| [`docs/prerna-gap-analysis.md`](docs/prerna-gap-analysis.md) | Identifies missing features, security holes, and structural gaps |
| [`docs/prerna-critical-fixes-and-build-guide.md`](docs/prerna-critical-fixes-and-build-guide.md) | Step-by-step resolution of all major architectural flaws and build procedures |
| [`docs/prerna-agent-implementation-plan-v2.md`](docs/prerna-agent-implementation-plan-v2.md) | The master roadmap for AI agents to systematically build out remaining features |

---

## 🤝 Contributing

Issues and pull requests are welcome. Given the sensitivity of what this project handles, any contribution touching consent, disclosure, assessment data collection, or crisis handling will be held to a higher review bar than typical feature work — see the documents above for the invariants those areas must preserve.

## 📄 License

MIT — see [LICENSE](LICENSE).

## 👤 Author

**Harshkumar G.** — [@HarshkumarG007](https://github.com/HarshkumarG007)

---

<div align="center">
<sub>Built local-first, on purpose. Nothing about a teenager's inner life should live on someone else's server.</sub>
</div>
