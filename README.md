# PRERNA - Local-First AI Guidance & Gamified Assessment Platform

PRERNA is a zero-knowledge, offline-first desktop application designed to provide teenagers with a safe, engaging environment for emotional expression and cognitive assessment. By blending gamified assessments (mini-games) with an empathetic, locally-running AI mentor, PRERNA generates deep psychological insights (Big Five, RIASEC, Cognitive Strengths) without ever transmitting sensitive data to the cloud.

---

## 🏛️ System Architecture (ASCII)

PRERNA relies on a secure, two-tier architecture running entirely on the user's local machine.

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
│  Rust + Tauri Framework                                  │
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
│  (AES-256 Encrypted) │            │  (GGUF Binary)       │
└──────────────────────┘            └──────────────────────┘
```

---

## 🚀 Core Features & Implementation

1. **Zero-Knowledge Privacy (Offline-First)**
   - **How:** The app does not rely on a cloud database. All data is saved to a local `.sqlite` file encrypted using `SQLCipher` with 256-bit AES encryption.
   - **Why:** To ensure strict compliance with DPDP (Digital Personal Data Protection) and guarantee that deeply personal psychological profiles cannot be leaked or hacked from a central server.

2. **Transparent Cognitive Assessments (Skill Arena)**
   - **How:** Gamified React components (Pattern Match, Word Bridge, Spatial Puzzle, Reaction Test). User performance (speed, accuracy, choices) is mapped to psychological traits using the `fusionEngine.ts`.
   - **Why:** Teenagers often suffer from test anxiety or survey fatigue. Transparent gamified assessment gathers authentic cognitive data while the user plays a game, preceded by explicit disclosure.

3. **Offline AI Mentor**
   - **How:** Uses the Rust crate `llama-cpp-2` to run quantized GGUF models directly on the user's CPU/GPU. The React frontend chats with the backend via `invoke('chat_with_mentor')`.
   - **Why:** Provides empathetic, non-judgmental career and emotional guidance without sending chat logs to OpenAI or Anthropic.

4. **Clinical Crisis Protocol**
   - **How:** A passive monitoring engine (`crisisRouter.ts` and Rust equivalents) scans mood logs and AI chat transcripts for high-risk flags (e.g., PHQ-9 equivalents, suicidal ideation). Triggers immediate escalation to a guardian interface.
   - **Why:** Ensures duty of care. If a teen is in immediate danger, privacy is temporarily overridden to provide life-saving intervention.

5. **School Integration API (K-Anonymity)**
   - **How:** A Rust module (`school_api.rs`) that aggregates local data and only permits export if `N >= 5` (K-Anonymity threshold).
   - **Why:** Allows schools to measure cohort wellbeing and career trends without accidentally de-anonymizing individual students.

---

## 📂 Detailed Folder Structure

This section outlines the complete tree structure of the PRERNA repository along with detailed annotations for each directory and crucial file. It serves as an architectural map for new developers or AI agents (like Claude) to navigate the repository.

```text
PRERNA/
├── .github/
│   ├── workflows/
│   │   ├── lint.yml                # CI/CD: Automated ESLint and Prettier checks
│   │   ├── release.yml             # CI/CD: Automated Tauri builds for macOS/Windows/Linux
│   │   ├── security.yml            # CI/CD: Security vulnerability scanning
│   │   └── test.yml                # CI/CD: Automated Vitest/Cargo test execution
│   └── dependabot.yml              # Automated dependency updates
├── .vscode/
│   └── extensions.json             # Recommended VS Code extensions for the team
├── docs/
│   ├── crisis-protocol.md          # Clinical rules and constraints for handling user emergencies
│   ├── disclosure-language-review.md # DPDP compliant plain-text disclosures
│   └── dpdp-compliance-mapping.md  # Architectural proofs of legal data privacy compliance
├── public/
│   ├── tauri.svg                   # Static assets
│   └── vite.svg
├── src-tauri/                      # RUST BACKEND (Zero-Knowledge Environment)
│   ├── icons/                      # App icon assets for all platforms
│   ├── src/
│   │   ├── ai/                     # Local LLM Mentor logic in Rust (llama.cpp bindings)
│   │   │   ├── mod.rs
│   │   │   ├── prompts.rs          # System prompts for the AI Mentor
│   │   │   └── safety.rs           # Safety guardrails before LLM execution
│   │   ├── commands/               # Specific Tauri IPC command modules
│   │   │   └── ai.rs               # IPC handlers for chat_with_mentor
│   │   ├── db/                     # SQLite Database and SQLCipher encryption logic
│   │   │   ├── mod.rs              # Database connection and CRUD operations
│   │   │   ├── models.rs           # Rust data structures mapped to database rows
│   │   │   └── schema.rs           # Raw SQL schemas for local tables
│   │   ├── commands.rs             # Root Tauri IPC commands (save_session, etc.)
│   │   ├── db.rs                   # Database state initialization
│   │   ├── lib.rs                  # Application setup and command registration
│   │   ├── main.rs                 # Tauri application entry point
│   │   └── school_api.rs           # Logic for any external school integrations
│   ├── Cargo.toml                  # Rust dependencies (rusqlite, sqlcipher, etc.)
│   ├── build.rs                    # Rust build script
│   └── tauri.conf.json             # Tauri configuration (bundle ID: com.lenovo.prerna)
├── src/                            # REACT / TYPESCRIPT FRONTEND
│   ├── ai/                         # Frontend AI interfaces mapping to Rust
│   │   ├── careerClassifier.ts
│   │   └── llmClient.ts            # Client interface for calling Rust AI commands
│   ├── assessment/                 # Assessment logic (Engine & Activities)
│   │   ├── scenarios/
│   │   │   └── lifeQuests.ts       # Specific narrative logic for quests
│   │   ├── skills/
│   │   │   └── engine.ts           # Math/Logic evaluation engine
│   │   └── engine.ts               # Core assessment logic mapping game state to traits
│   ├── backup/                     # Data export/import utilities (Local Backup)
│   │   ├── engine.ts
│   │   └── scheduler.ts            # Automated backup scheduling
│   ├── components/                 # React UI Components
│   │   ├── activities/             # Gamified Assessments (LifeQuests, MoodMirror, etc.)
│   │   ├── ai/                     # Mentor UI logic
│   │   ├── backup/                 # Backup interface
│   │   ├── common/                 # Shared UI components (LoadingScreen)
│   │   ├── consent/                # DPDP Age and Parent Consent Modals
│   │   ├── crisis/                 # Human Review Queue and Escalation alerts UI
│   │   ├── dashboard/              # Main Teen UI (Widgets, Tracker, Mentor, Profile)
│   │   ├── mentor/                 # AiMentorChat component
│   │   ├── parent/                 # Parent Dashboard and Privacy Controls
│   │   ├── settings/               # Audit trail, delete data, export data UI
│   │   ├── skills/                 # Mini-games (PatternMatch, WordBridge)
│   │   ├── synthesis/              # Profile synthesis UI visualizations
│   │   └── welcome/                # Authentication & Welcome Modal
│   ├── db/
│   │   └── schema.sql              # Frontend reference of the DB schema
│   ├── engine/                     # Core Business Logic
│   │   ├── assessment/             # Trait mapping (Big 5, RIASEC) & Disclosures
│   │   ├── consent/                # Auditing and session gating (blocking logic)
│   │   ├── crisis/                 # Escalation Router and Pattern Detection rules
│   │   └── localization/           # Hindi/English translations
│   ├── hooks/
│   │   └── useDatabase.ts          # Custom React hook for database IPC calls
│   ├── parent/
│   │   └── permissions.ts          # Gatekeeper for parental access rights
│   ├── store/                      # Zustand Global State Management
│   │   └── index.ts                # Main Zustand store
│   ├── synthesis/                  # Fusion Engine
│   │   └── fusionEngine.ts         # Combines raw traits into unified cognitive profiles
│   ├── tests/                      # Automated Tests (Vitest)
│   │   ├── integration/            # Component integration testing
│   │   └── ... unit tests
│   ├── App.css                     # Global styles
│   ├── App.tsx                     # Main App component & routing
│   ├── main.tsx                    # React DOM entry point
│   └── vite-env.d.ts               # Vite environment types
├── .gitignore                      # Ignored files (node_modules, target, etc.)
├── LICENSE                         # Project License
├── package.json                    # Node dependencies and scripts
├── README.md                       # Project overview and high-level architecture
├── SYSTEM_EVALUATION_METRICS.md    # Metrics for evaluating system success/accuracy
├── project_context_for_claude.md   # Specialized context file for feeding to Claude AI
├── tsconfig.json                   # TypeScript configuration
└── vite.config.ts                  # Vite bundler configuration
```

---

## 🛠️ Frameworks & Tools

- **Vite**: Ultra-fast frontend build tool. Used instead of Webpack/CRA for rapid Hot Module Replacement (HMR).
- **React 19 + TypeScript**: Ensures type safety across the complex psychological state objects.
- **Tailwind CSS v4**: Utility-first CSS framework (configured via `@tailwindcss/vite`) used to build the premium, glassmorphism UI.
- **Zustand**: Lightweight global state manager (preferred over Redux for minimal boilerplate).
- **Tauri 2.0**: The desktop application framework. Chosen over Electron because it uses the native OS webview (Edge WebView2 on Windows, WebKit on Mac), resulting in a tiny binary size (~10MB) and virtually zero memory bloat.
- **rusqlite + SQLCipher**: C-bindings for SQLite with 256-bit encryption.
- **llama-cpp-2**: Rust bindings for `llama.cpp` to run AI models on CPU without requiring a massive Python/PyTorch stack.
