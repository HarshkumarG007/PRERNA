# Contributing to PRERNA

Thank you for your interest in contributing to PRERNA (प्रेरणा) — Sovereign Adolescent Wellbeing Sanctuary.

## Core Architectural Invariants

Before contributing, please review our core architectural invariants:
1. **Local-First Privacy:** Adolescent journals, psychometric assessments, and sensitive reflections must remain strictly on-device. No telemetry, third-party analytics trackers, or external cloud voice synthesis.
2. **Child Safety Invariants:** 
   - No behavioral tracking directed at minors (DPDP Act 2023 Section 9(3)).
   - Crisis intervention escalation requires clinical review and teen notification before guardian alerts (Rule 0.3).
   - Privilege separation: Privileged roles (`reviewer`, `educator`, `admin`) can never be self-assigned.
3. **Cryptographic Standards:** Never use `Math.random()` for security tokens, nonces, or IDs. Always use CSPRNG (`crypto.getRandomValues`).

## Development Workflow

### Prerequisites
- Node.js 20+
- Rust 1.80+ (Stable)
- Android Studio / NDK r26d (for mobile builds)

### Testing & Verification
All changes must pass our verification gates:
```bash
# 1. TypeScript & Lint
npm run lint

# 2. Frontend Test Suite (Vitest)
npm test

# 3. Rust Backend Test Suite
cargo test --manifest-path src-tauri/Cargo.toml

# 4. Production Build Verification
npm run build
```

## Pull Request Guidelines
- Branch from `main` using descriptive naming: `feat/...`, `fix/...`, `security/...`.
- Keep changes atomic, focused, and backed by automated unit/integration tests.
- Maintain documentation integrity and update relevant threat models and architecture documents when modifying trust boundaries.

