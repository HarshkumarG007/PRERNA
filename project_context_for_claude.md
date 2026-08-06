# PRERNA - Deep Dive Context for LLM Analysis

This document is specifically designed to provide an LLM (like Claude) with a granular, exhaustive understanding of the PRERNA codebase, architecture, state management, and data flow.

## 1. System Architecture & Data Flow

PRERNA is a local-first desktop application using Tauri.
*   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4.
*   **State Management**: Zustand.
*   **Backend**: Rust (Tauri), SQLite (via `rusqlite` + `sqlcipher` for AES-256 encryption), `llama-cpp-2` for offline AI inference.

### The IPC Bridge (How React talks to Rust)
All data flows through Tauri's Inter-Process Communication (IPC). The frontend never makes HTTP requests to a cloud server for core features.
*   **Frontend**: Uses `@tauri-apps/api/core` `invoke('command_name', { args })`.
*   **Backend**: Rust functions annotated with `#[tauri::command]` in `src-tauri/src/commands.rs`.

---

## 2. Exhaustive Folder & File Structure

### Frontend (`src/`)

#### `src/store/index.ts` (The Brain of the Frontend)
*   **Purpose**: Global Zustand store managing the `AuthState`, `ProfileState`, and `AppUIState`.
*   **How it works**: It is the single source of truth. When a user logs in, `login(userId)` is called, which invokes the Rust command `get_unified_profile`. The Rust backend decrypts the SQLite database, fetches the user's `TraitSnapshot`, and returns it. Zustand caches this as `profile: UnifiedProfile`. React components (like the Dashboard) re-render reactively when this profile updates.

#### `src/components/activities/` (Gamified Assessments)
*   **Purpose**: Gamified components that extract psychological data without standard survey fatigue.
*   **`SkillArena.tsx`**: Contains mini-games (Reaction Test, Spatial Puzzle). Scores are passed to the `fusionEngine.ts` to calculate cognitive strengths.
*   **`MoodMirror.tsx`**: A daily check-in that logs emotional valence (1-100). Passes data to `invoke('save_mood_log')`.

#### `src/engine/synthesis/fusionEngine.ts`
*   **Purpose**: The algorithmic heart of the assessment.
*   **How it works**: It takes raw telemetry (e.g., "User took 1.2s on Reaction Test" or "User chose the analytical dialogue option in Life Quests") and maps it to standardized psychological frameworks:
    *   **Big Five (OCEAN)**: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism.
    *   **RIASEC**: Realistic, Investigative, Artistic, Social, Enterprising, Conventional.
*   **Detail**: It maintains rolling averages so the teenager's profile evolves naturally over time rather than jumping erratically.

#### `src/ai/llmClient.ts` & `src/components/mentor/AiMentorChat.tsx`
*   **Purpose**: The AI Companion interface.
*   **How it works**: The React component renders the chat UI. When a message is sent, `llmClient.ts` takes the user's message PLUS their current `UnifiedProfile` (from Zustand) to inject context into the prompt (e.g., "You are talking to a highly agreeable, artistic teenager. Respond accordingly."). This is sent via IPC to the Rust backend, which feeds it to the local LLaMA GGUF model via `llama-cpp-2`.

#### `src/components/parent/ParentDashboard.tsx` & `src/parent/permissions.ts`
*   **Purpose**: The DPDP compliant guardian view.
*   **Detail**: By default, parents see *nothing* raw. They only see high-level conversation starters ("Ask them about their recent interest in Design!"). The `permissions.ts` file acts as a strict firewall defining what `ParentSafeProfile` looks like compared to the raw `UnifiedProfile`.

#### `src/engine/crisis/escalationRouter.ts`
*   **Purpose**: Clinical safety.
*   **How it works**: Acts as middleware whenever a mood log or AI chat is saved. If the text contains specific regex triggers (e.g., suicidal ideation) or if `MoodMirror` scores stay below a critical threshold for 14 days, it triggers a `CrisisEvent`. This overrides DPDP privacy to notify the guardian immediately. (Formalized in `docs/crisis-protocol.md`).

---

### Backend (`src-tauri/`)

#### `src-tauri/src/db/mod.rs` & `models.rs`
*   **Purpose**: The zero-knowledge database.
*   **Detail**: Uses `rusqlite`. Before any query is executed, it runs `PRAGMA key = 'user_derived_key';` to decrypt the database in memory using SQLCipher.
*   **Schema (`models.rs`)**:
    *   `User`: id, name, encrypted_pin, created_at.
    *   `Session`: id, user_id, start_time, duration, activity_type.
    *   `TraitSnapshot`: id, user_id, timestamp, big_five (JSON), riasec (JSON), emotional_profile (JSON).

#### `src-tauri/src/commands.rs` & `ai.rs`
*   **Purpose**: IPC Handlers.
*   **Detail**: Functions like `save_trait_snapshot` take the JSON sent from React's `fusionEngine`, serialize it in Rust, and insert it into the SQLite DB. `ai.rs` manages the GPU/CPU memory allocation for the `llama-cpp-2` binary, ensuring the desktop app doesn't crash from OOM (Out Of Memory) errors during inference.

#### `src-tauri/src/school_api.rs`
*   **Purpose**: Institutional analytics.
*   **Detail**: Allows schools to run a command `generate_school_report(student_ids)`. It has a hardcoded **K-Anonymity Guard** (`k_threshold = 5`). If the requested cohort size is less than 5, it returns empty data, making it mathematically impossible for a school admin to single out a specific teenager's mental health profile.

#### `src-tauri/tauri.conf.json`
*   **Detail**: Configures the app bundle (`com.lenovo.prerna`), window size, and build scripts. Defines that the frontend lives in `../dist`.

---

## 3. DevOps & CI/CD (`.github/workflows/`)

*   **`lint.yml`**: Prevents bad pushes. Runs ESLint (TypeScript) and `cargo clippy` (Rust).
*   **`test.yml`**: Runs `npm test` (Vitest integration tests for the `escalationRouter`) and `cargo test`.
*   **`security.yml`**: Audits `package-lock.json` and `Cargo.lock` against known CVEs weekly.
*   **`release.yml`**: Triggered exclusively by pushing a tag (e.g., `git tag v1.0.0`). It spins up Windows, macOS, and Linux runners concurrently. It compiles the Rust codebase, bundles the Vite frontend, and attaches the `.exe`, `.dmg`, and `.AppImage` to a GitHub Release draft automatically using `tauri-apps/tauri-action`.

---

## 4. How to Guide the LLM

When asking Claude to modify this project, remind it of these constraints:
1. **Never add cloud database dependencies** (No Firebase, Supabase, etc.). Everything must remain in `src-tauri/src/db/`.
2. **State flows top-down**: Database -> Tauri Command -> Zustand Store -> React Component. Never mutate React state directly if it needs to persist.
3. **Respect DPDP**: Any new data collected must pass through the teen-controlled permission firewall before being visible in the `ParentDashboard`.
