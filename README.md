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

### 1. `src/` (Frontend React / TypeScript)
The presentation layer and UI business logic.

*   **`ai/`**: Frontend interfaces for the AI Mentor. Contains `llmClient.ts` which manages the prompt formatting and Tauri IPC calls to the Rust AI backend.
*   **`backup/`**: Logic for encrypted data export/import (`engine.ts`, `scheduler.ts`). Allows teens to backup their profile to a USB drive.
*   **`components/`**: React UI components, modularized by feature.
    *   `activities/`: The gamified assessment games (Skill Arena, Mood Mirror, Life Quests).
    *   `consent/`: DPDP compliance modals and Beta agreements.
    *   `crisis/`: UI for the clinical review queue and escalation alerts.
    *   `dashboard/`: The main teen UI (glassmorphism cards, streak trackers, trait visualizations).
    *   `mentor/`: The chat interface for the AI companion.
    *   `parent/`: The read-only, privacy-respecting dashboard for guardians.
    *   `synthesis/`: UI for the final psychological profile summary.
*   **`engine/`**: Core frontend business logic that doesn't belong in UI components.
    *   `assessment/`: Rules for how game actions map to traits (`disclosures.ts`).
    *   `crisis/`: The `escalationRouter.ts` that detects distress signals.
    *   `localization/`: `i18n.tsx` for English/Hindi toggling.
*   **`hooks/`**: Custom React hooks (e.g., `useDatabase.ts` for abstracting Tauri DB calls).
*   **`parent/`**: Granular permissions system defining exactly what a parent can and cannot see (`permissions.ts`).
*   **`store/`**: Global state management using Zustand (`index.ts`). This is the bridge between the UI and Tauri; it calls the Rust backend to fetch/save profiles and caches it for React.
*   **`synthesis/`**: The `fusionEngine.ts`, which takes raw game scores and standardizes them into Big Five and RIASEC percentages.
*   **`tests/`**: Vitest unit and integration test suites validating the crisis router and consent gates.

### 2. `src-tauri/` (Backend Rust)
The secure execution environment, native OS bindings, and database.

*   **`src/`**: Core Rust source code.
    *   **`ai.rs`**: Manages the local LLaMA model inference lifecycle (loading the model, tokenizing, generating responses).
    *   **`commands.rs`**: Tauri IPC command handlers. These are the functions annotated with `#[tauri::command]` that React can call (e.g., `get_unified_profile`, `save_mood_log`).
    *   **`db/`**: The database access layer.
        *   `mod.rs`: SQLite connection management, SQLCipher pragmas, and schema migrations.
        *   `models.rs`: Rust Structs representing the database schema (User, Session, TraitSnapshot).
    *   **`lib.rs`**: The main Tauri application builder. Registers all plugins and commands, initializes the DB state, and starts the window.
    *   **`school_api.rs`**: Institutional deployment logic. Generates `SchoolAnalyticsReport` using strict K-anonymity checks to ensure privacy.
*   **`tauri.conf.json`**: Tauri compiler configuration (window size, bundle identifier, build scripts).
*   **`Cargo.toml`**: Rust dependency manager (similar to package.json).

### 3. `.github/` (CI/CD Pipelines)
Enterprise-grade GitHub Actions suite for DevOps.

*   **`workflows/`**:
    *   `lint.yml`: Enforces ESLint and `cargo clippy` code quality.
    *   `test.yml`: Runs `npm test` and `cargo test` on every PR.
    *   `security.yml`: Runs `npm audit` and `cargo audit` to catch vulnerabilities.
    *   `release.yml`: Matrix builds the `.exe` (Windows), `.dmg` (macOS), and `.AppImage` (Linux) native binaries when a `v*` tag is pushed.
*   **`dependabot.yml`**: Automated dependency updates.

### 4. `docs/`
*   **`crisis-protocol.md`**: Formal clinical guidelines detailing response SLAs and trigger conditions for the crisis escalation system.

---

## 🛠️ Frameworks & Tools

- **Vite**: Ultra-fast frontend build tool. Used instead of Webpack/CRA for rapid Hot Module Replacement (HMR).
- **React 19 + TypeScript**: Ensures type safety across the complex psychological state objects.
- **Tailwind CSS v4**: Utility-first CSS framework (configured via `@tailwindcss/vite`) used to build the premium, glassmorphism UI.
- **Zustand**: Lightweight global state manager (preferred over Redux for minimal boilerplate).
- **Tauri 2.0**: The desktop application framework. Chosen over Electron because it uses the native OS webview (Edge WebView2 on Windows, WebKit on Mac), resulting in a tiny binary size (~10MB) and virtually zero memory bloat.
- **rusqlite + SQLCipher**: C-bindings for SQLite with 256-bit encryption.
- **llama-cpp-2**: Rust bindings for `llama.cpp` to run AI models on CPU without requiring a massive Python/PyTorch stack.
