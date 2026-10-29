# System Architecture
## PRERNA — Personalized Real-time Engagement & Neural Resource Assistant

**Version:** 1.0  
**Status:** Living Document — update this file for every architectural decision  
**Last Updated:** 2026-10-29

---

## 0. Architectural North Stars

1. **Local-first by default.** No sensitive data leaves the device unless the user explicitly opts in.
2. **Consent before compute.** No assessment, no AI inference, no data write without a verified consent record.
3. **Transparency is structural, not policy.** Privacy and disclosure guarantees are enforced in code; they cannot be accidentally toggled off by a developer.
4. **Human review for high-stakes decisions.** No autonomous action on crisis signals; all escalation paths route through a trained human before consequential action.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       CONSENT & AGE-GATING LAYER                        │
│  - Age declaration + good-faith verification signal                     │
│  - Under-18: verifiable parental/guardian consent (DPDP S.9)            │
│  - 18+: standard adult consent                                          │
│  - Teen-readable plain-language disclosure (not legalese)               │
│  ─── NOTHING BELOW THIS LINE RUNS BEFORE CONSENT IS VERIFIED ───        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                     USER DEVICE (Legion 5i / any modern laptop)         │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────┐  ┌────────────────────────┐    │
│  │  React 19 +      │  │  Tauri 2     │  │  Local LLM              │    │
│  │  TypeScript      │◄─►  (Rust IPC  │◄─►  (Mistral 7B / Llama   │    │
│  │  Tailwind v4     │  │   Bridge)   │  │   3 8B, 4-bit quant.)  │    │
│  │  Vite + Vitest   │  │             │  │   via llama.cpp         │    │
│  └──────────────────┘  └──────────────┘  └────────────────────────┘    │
│           │                   │                       │                 │
│  ┌──────────────────┐  ┌──────────────┐  ┌────────────────────────┐    │
│  │  Zustand Store   │  │  SQLCipher   │  │  ChromaDB              │    │
│  │  (Frontend State)│  │  (AES-256    │  │  (Embeddings /         │    │
│  │                  │  │   encrypted  │  │   Semantic search)     │    │
│  │                  │  │   local DB)  │  │                        │    │
│  └──────────────────┘  └──────────────┘  └────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
   ┌──────────────────────┐              ┌─────────────────────────────┐
   │ Crisis Escalation    │              │ Optional Encrypted Sync     │
   │ Service              │              │ (Opt-in only, future)       │
   │ - Resource surfacing │              │ - Cross-device profile sync │
   │ - Human triage queue │              │ - Never a behavioral-       │
   │ - Narrow, disclosed  │              │   analytics pipeline        │
   │   imminent-risk path │              └─────────────────────────────┘
   └──────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Version | Justification |
|---|---|---|---|
| **Frontend UI** | React + TypeScript | React 19, TS ~5.8 | Strongly typed, component-based, broad ecosystem |
| **Styling** | Tailwind CSS v4 | ^4.3 | Utility-first; enforces design system via tokens |
| **Build** | Vite | ^7 | Fast HMR, ESM-native, tree-shaking |
| **State** | Zustand | ^5 | Lightweight; single store; no boilerplate overhead |
| **Server-state** | TanStack Query | ^5 | Async data sync between Rust backend ↔ React |
| **Animation** | Framer Motion | ^13 | Gamified transitions; spring physics |
| **Desktop Shell** | Tauri 2 (Rust) | ^2 | Lightweight, secure, native; avoids Electron's memory overhead |
| **Local DB** | SQLite via SQLCipher | rusqlite + sqlcipher | Zero-config, portable, AES-256 encrypted at rest |
| **Vector DB** | ChromaDB | latest | Semantic embedding search for recommendations |
| **AI Runtime** | llama.cpp + ONNX Runtime | latest | Quantized 7-8B model inference on RTX 4060; no cloud dependency |
| **LLM** | Mistral 7B Instruct or Llama 3 8B | 4-bit GGUF | ~4-5GB VRAM; <2s response on target hardware |
| **Embeddings** | BGE-M3 or E5 | ~1GB | Semantic pathway/content matching |
| **Emotion Model** | DistilRoBERTa-emotion | ~250MB | Mood Mirror signal — **disclosed to user** |
| **Career Model** | Custom classifier | ~100MB | Career pathway matching from trait profile |
| **Icons** | Lucide React | ^1.29 | Consistent, accessible icon set |
| **Validation** | Zod | ^4 | Schema validation for all IPC payloads and form data |
| **Routing** | React Router DOM | ^7 | File-based-style routing for the desktop app |
| **Testing** | Vitest + Playwright | ^4 | Unit + E2E; Playwright for consent-flow testing |
| **CI/CD** | GitHub Actions | — | Lint, test, security audit, cross-platform release |

---

## 3. IPC Data Flow (How React Talks to Rust)

All core data flows through Tauri's IPC. The frontend **never** makes HTTP requests to a cloud server for core features.

```
React Component
    │  invoke('command_name', { payload })
    ▼
Tauri IPC Bridge (src-tauri/src/commands/)
    │  #[tauri::command] fn
    ▼
Rust Business Logic (src-tauri/src/)
    │  ageTierGate check → consentGate check → operation
    ▼
SQLCipher DB (PRAGMA key = derived_key)
    │  query / insert / update
    ▼
Result<T, AppError> back through IPC
    ▼
Zustand Store update → React re-render
```

**State flow rule (non-negotiable):**  
`Database → Tauri Command → Zustand Store → React Component`  
Never mutate React state directly for anything that must persist.

---

## 4. Folder Structure

```
prerna/
├── src/                              # React + TypeScript frontend
│   ├── components/
│   │   ├── consent/                  # GATE: everything below sits behind this
│   │   │   ├── AgeDeclaration.tsx
│   │   │   ├── TeenReadableDisclosure.tsx
│   │   │   ├── ParentConsentFlow.tsx
│   │   │   └── ConsentSummaryViewer.tsx
│   │   ├── activities/               # Transparent assessment activities
│   │   │   ├── LifeQuests.tsx
│   │   │   ├── SkillArena.tsx
│   │   │   ├── MoodMirror.tsx
│   │   │   ├── SocialCompass.tsx
│   │   │   └── BodyClock.tsx
│   │   ├── mentor/
│   │   │   └── AiMentorChat.tsx
│   │   ├── crisis/                   # Isolated; highest-stakes module
│   │   │   ├── ResourceSurface.tsx   # Always-on; NOT gated on detection
│   │   │   ├── TrustedAdultConnector.tsx
│   │   │   └── HumanReviewQueue.tsx  # Internal/admin-facing only
│   │   ├── dashboard/
│   │   │   ├── SharedDashboardView.tsx  # Teen + parent see same data
│   │   │   └── ParentDashboard.tsx
│   │   └── settings/
│   │       ├── DataExport.tsx
│   │       ├── DataDelete.tsx
│   │       └── AuditTrailViewer.tsx
│   ├── engine/
│   │   ├── assessment/               # Transparent assessment engine
│   │   │   ├── disclosures.ts        # Versioned disclosure text registry
│   │   │   ├── bigFive.ts
│   │   │   ├── riasec.ts
│   │   │   ├── multipleIntelligences.ts
│   │   │   └── emotionalProfile.ts
│   │   ├── consent/
│   │   │   ├── ageTierGate.ts        # Hard-codes under-18 constraints
│   │   │   ├── sessionGate.ts        # Disclosure-gated session creation
│   │   │   └── consentRecordStore.ts
│   │   └── crisis/
│   │       ├── patternDetection.ts   # Signal-only; no autonomous action
│   │       └── escalationRouter.ts   # Enforces Global Rules 0.1-1→3
│   ├── ai/
│   │   ├── llmClient.ts              # llama.cpp backend via Tauri IPC
│   │   ├── embeddings.ts
│   │   ├── emotionModel.ts           # Mood Mirror only (disclosed)
│   │   └── careerClassifier.ts
│   ├── store/
│   │   └── index.ts                  # Zustand: AuthState, ProfileState, AppUIState
│   ├── parent/
│   │   └── permissions.ts            # ParentSafeProfile firewall
│   ├── types/
│   │   └── index.ts                  # Shared TypeScript types
│   └── App.tsx
│
├── src-tauri/                        # Rust / Tauri backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   ├── consent.rs                # Age-tier gate (Rust-side enforcement)
│   │   ├── school_api.rs             # K-anonymity guard (k ≥ 5)
│   │   ├── commands/
│   │   │   ├── mod.rs
│   │   │   ├── ai.rs                 # LLM inference commands
│   │   │   └── security_tests.rs
│   │   ├── db/
│   │   │   ├── mod.rs                # SQLCipher init + PRAGMA key
│   │   │   ├── models.rs             # Rust structs for DB rows
│   │   │   └── schema.rs             # SQL schema definition
│   │   ├── ai/
│   │   │   ├── mod.rs
│   │   │   ├── cognitive.rs
│   │   │   ├── crisis.rs             # Crisis detection (Rust-side)
│   │   │   ├── prompts.rs            # System prompt templates
│   │   │   ├── rag.rs                # Retrieval-augmented generation
│   │   │   └── safety.rs             # Output safety filtering
│   │   ├── notifications/
│   │   │   └── mod.rs
│   │   └── policy/
│   │       └── mod.rs
│   └── tauri.conf.json
│
├── docs/                             # Living project documentation
│   ├── PRD.md                        # ← This project's product requirements
│   ├── architecture.md               # ← This file
│   ├── rules.md                      # Development rules & AI guidelines
│   ├── design.md                     # Design system
│   ├── task.md                       # Task breakdown checklist
│   ├── memory.md                     # Project context & history log
│   ├── crisis-protocol.md            # BLOCKED: requires clinical reviewer (H1)
│   ├── dpdp-compliance-mapping.md    # DPDP → implementation mapping
│   ├── disclosure-language-review.md # Disclosure text review tracking
│   └── integrity-audit-log.md        # Audit log for review claims
│
└── tests/
    ├── unit/
    ├── integration/
    ├── consent-flow/                 # Dedicated: every age-gate path
    └── crisis-protocol/              # Dedicated: highest scrutiny
```

---

## 5. Database Schema

All tables live in a single SQLCipher-encrypted SQLite file. Key material stored in the OS keychain — never in the database file alongside the data it protects.

```sql
-- Users
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    age_declared INTEGER NOT NULL,
    account_type TEXT NOT NULL CHECK(account_type IN ('under_18', 'adult')),
    parent_consent_id TEXT REFERENCES parent_consents(id), -- NULL for adult accounts
    region TEXT,
    language TEXT DEFAULT 'en'
);

-- Parental consent records (DPDP S.9 compliance)
CREATE TABLE parent_consents (
    id TEXT PRIMARY KEY,
    parent_verified_identity_ref TEXT NOT NULL,
    consented_at TIMESTAMP NOT NULL,
    disclosure_version TEXT NOT NULL,
    scope JSON NOT NULL,
    revoked_at TIMESTAMP          -- NULL unless revoked; revocation honored immediately
);

-- Assessment sessions (each tied to its own disclosure)
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    session_type TEXT NOT NULL CHECK(session_type IN (
        'life_quest','skill_arena','mood_mirror','social_compass','body_clock'
    )),
    disclosure_shown_id TEXT NOT NULL, -- required; no session without disclosure
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    choices JSON,        -- visible to the user in their own activity history
    derived_traits JSON
);

-- Trait profiles (temporal — multiple snapshots over time)
CREATE TABLE trait_snapshots (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    snapshot_date TIMESTAMP NOT NULL,
    big_five JSON,
    riasec JSON,
    multiple_intel JSON,
    emotional_profile JSON,
    confidence_score REAL
);

-- Recommendations
CREATE TABLE recommendations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    category TEXT NOT NULL CHECK(category IN ('career','skill','mental_health','physical','social')),
    content TEXT NOT NULL,
    reasoning TEXT NOT NULL,   -- always explainable
    accepted BOOLEAN,
    completed BOOLEAN,
    created_at TIMESTAMP NOT NULL
);

-- Crisis escalation events (stricter access/retention than general data)
CREATE TABLE crisis_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    detected_at TIMESTAMP NOT NULL,
    human_review_status TEXT NOT NULL CHECK(human_review_status IN (
        'pending','reviewed_no_action','reviewed_resources_only','reviewed_guardian_notified'
    )),
    reviewer_ref TEXT,               -- never blank for a notified case
    teen_informed_at TIMESTAMP       -- MUST be set before guardian_notified status
);

-- Data access audit log (user-accessible transparency feature)
CREATE TABLE access_audit_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    accessed_by TEXT NOT NULL CHECK(accessed_by IN ('self','parent_dashboard','system_process')),
    data_scope TEXT NOT NULL,
    accessed_at TIMESTAMP NOT NULL
);
```

---

## 6. AI Model Architecture

| Component | Model | Size | Purpose | User Disclosure |
|---|---|---|---|---|
| Core reasoning / AI mentor | Mistral 7B Instruct or Llama 3 8B, 4-bit | ~4-5GB | Conversational guide, insight synthesis | Always identified as AI; never implied to be human |
| Embeddings | BGE-M3 or E5 | ~1GB | Semantic matching (pathways, recommendations) | — |
| Emotion / sentiment | DistilRoBERTa-emotion | ~250MB | Mood Mirror — **explicitly disclosed as mood-tracking** | Disclosed at first use of Mood Mirror specifically |
| Career matching | Custom classifier | ~100MB | Career pathway recommendations | — |
| Speech (future) | Whisper Small | ~500MB | Optional voice journaling | Opt-in; clearly a recording feature |

**Critical constraint:** The emotion model may **only** run on data from a feature the user has been told is a mood-tracking feature. It cannot be quietly applied to chat logs or gameplay choices in *other* activities without a specific disclosure for that use.

---

## 7. Security Architecture

| Layer | Implementation |
|---|---|
| **Authentication** | Local biometric/PIN for teen's device access; separate verified auth for parent consent account |
| **Encryption at rest** | SQLCipher AES-256; key stored in OS keychain (not in DB) |
| **Encryption in transit** | TLS 1.3 for any network calls (crisis resource lookups, optional sync) |
| **Shared-device threat** | Per-profile PIN/biometric lock; device access ≠ authorized access |
| **Input validation** | Zod schemas (frontend); type-safe Rust deserialization (backend) |
| **SQL injection** | Parameterized queries only; no string interpolation in SQL |
| **Logging** | Local-only; no PII in logs; user-accessible audit trail |
| **Data subject rights** | Full export + delete, accessible by teen directly |
| **Crisis data** | Stricter access/retention standard than general assessment data |
| **School API** | k-anonymity guard: k_threshold = 5; cohort < 5 returns empty |

---

## 8. Performance Targets

| Metric | Target | Hardware Baseline |
|---|---|---|
| LLM response time | < 2s (p95) | RTX 4060, 8GB VRAM |
| UI frame rate | 60 fps | Any modern laptop |
| App cold start | < 3s | SSD-equipped machine |
| DB query (trait snapshot) | < 50ms | Local SQLite |
| Offline operation | Full feature parity | No network required for core features |

---

## 9. CI/CD Pipeline

```
Push to branch
    │
    ├── lint.yml      → ESLint (TypeScript) + cargo clippy (Rust)
    ├── test.yml      → Vitest (unit + integration) + cargo test
    │                    Special suites: consent-flow/, crisis-protocol/
    └── security.yml  → npm audit + cargo audit against CVE databases (weekly)

Push tag (e.g. v1.0.0)
    │
    └── release.yml   → Tauri cross-platform build
                         Windows (.exe) + macOS (.dmg) + Linux (.AppImage)
                         Signed installers attached to GitHub Release draft
```

---

## 10. Architectural Decision Records (ADR Index)

> Create `docs/adr/NNNN-title.md` for each significant architectural decision.

| # | Decision | Status | Date |
|---|---|---|---|
| 0001 | Use Tauri (not Electron) for desktop shell | Accepted | — |
| 0002 | Local-first SQLCipher (no cloud DB) | Accepted | — |
| 0003 | Age-tiered governance hard-coded at 18 (not a configurable threshold) | Accepted | — |
| 0004 | Crisis escalation requires human review before guardian notification | Accepted | — |
| 0005 | Emotion model scope-limited to Mood Mirror feature only | Accepted | — |
| 0006 | Key material stored in OS keychain, never in DB | Accepted | — |

