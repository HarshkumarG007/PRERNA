# PRERNA Project Structure

This document outlines the complete tree structure of the PRERNA repository along with detailed annotations for each directory and crucial file. It serves as an architectural map for new developers or AI agents (like Claude) to navigate the repository.

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
