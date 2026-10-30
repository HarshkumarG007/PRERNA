# Memory — Project Context & History Log
## PRERNA — Personalized Real-time Engagement & Neural Resource Assistant

**Version:** 1.1  
**Status:** Living Document — update this after every significant session  
**Last Updated:** 2026-10-30  
**Baseline Commit:** `cdf334c`

> **How to use this file:** Before starting any new work session, read Sections 1–3. After completing work, update Section 4 (decisions), Section 5 (bugs), and Section 2 (current status). This file is the single source of truth for project state — more reliable than memory of "what was done last time."

---

## 1. Project Summary (Quick Orientation)

**What is PRERNA?**  
A local-first, gamified self-discovery platform for Indian adolescents (ages 13+). Users play through transparent, consent-first activities that build a holistic psychological profile (Big Five, RIASEC, emotional patterns). A local LLM (Mistral 7B / Llama 3 8B) powers an AI Mentor that gives personalized guidance.

**What makes it different?**  
- **Transparent** (no stealth behavioral profiling — legally required under India's DPDP Act 2023, S.9(3) for under-18s)
- **Local-first** (all data stays on device by default; SQLCipher AES-256)
- **Consent-first** (nothing runs before verifiable parental consent for under-18s)
- **Human-backed crisis** (no algorithmic parent pipeline; trained human reviews before any guardian notification)

**Tech stack:** React 19 + TypeScript + Tailwind v4 (frontend) → Tauri 2 (Rust IPC bridge) → SQLCipher (local DB) + llama.cpp (local LLM)

**Key document reference:**
- What we build: `docs/PRD.md`
- How it's built: `docs/architecture.md`
- Rules for building it: `docs/rules.md`
- Visual design: `docs/design.md`
- Sequential tasks: `docs/task.md`
- DPDP compliance: `docs/dpdp-compliance-mapping.md`
- Crisis protocol: `docs/crisis-protocol.md` (🚫 BLOCKED: awaiting clinical reviewer H1)

---

## 2. Current Status

**Active Phase:** Phase 0 complete; Phase 1 in progress (or review before starting)

| Phase | Status | Notes |
|---|---|---|
| Phase 0: Integrity Audit | ✅ Complete | Baseline at `cdf334c`; integrity audit clean |
| Phase 1: Consent & Governance | ✅ Complete | P0 security tickets complete; SQLCipher, age gating, parent consent verified |
| Phase 2: Assessment Engine | ✅ Complete | P2-2, P2-3, P2-4 complete; ReactionTest, SpatialPuzzle, ActivityHistoryViewer, Rolling EMA scoring |
| Phase 3: AI Mentor & Career Pathways | ✅ Complete | P3-1, P3-2, P3-3 complete; Local LLM IPC client, context-aware prompt injection, 5-category career classifier |
| Phase 4: Crisis Protocol | ✅ Complete | Pattern screening, slang suppression, always-on resource surface, Rule 0.3 gate |
| Phase 5: Dashboard & Data Rights | ✅ Complete | SharedDashboard parity, verified deletion & export, 6 Indian languages i18n |
| Phase 6: Beta Readiness | ✅ Complete | BetaOnboardingNotice, end-to-end integration lifecycle test suite passing |
| Phase 7: Self-Evolution, 16-Types & Maslow Compass | ✅ Complete | 16 Personalities Typology, Current vs Evolved Self, Strengths Journal, Personalized Self-Management, Maslow Needs Compass |

**Verification & Quality Metrics:**
- **Test Suite:** **119/119 tests passing across 27 test files**
- **TypeScript:** `tsc --noEmit` **0 errors**
- **Production Bundle:** `dist/` built in **8.76s** with zero errors
- **Platform Support:** Desktop (Windows/macOS/Linux) + Mobile (Android `arm64-v8a` signed release APK)

**Human-Review Blockers (External Dependencies):**

| Ticket | What's Needed | Status |
|---|---|---|
| H1 | Licensed mental-health professional for crisis-protocol.md | ⏳ Not started |
| H2 | DPDP legal counsel for consent architecture | ⏳ Not started |
| H3 | Hindi construct-equivalence reviewer | ⏳ Not started |
| H4 | Disclosure language reviewer (teen comprehensibility) | ⏳ Not started |

---

## 3. Critical Context (Read Before Every Session)

### The Four Global Rules — Always Apply
1. **Rule 0.1:** No code path sets `behavioral_tracking`/`targeted_advertising` to non-FALSE for under-18. Enforced at data layer in Rust, not just UI.
2. **Rule 0.2:** No assessment session without a shown, logged, approved disclosure (`disclosure_shown_id` required on every `sessions` row).
3. **Rule 0.3:** No guardian notification without `human_review_status = 'reviewed_guardian_notified'` AND `teen_informed_at` already set. No bypass. Ever.
4. **Rule 0.4:** Teen-readable disclosures and `docs/crisis-protocol.md` are not AI-authored alone. Agent drafts; qualified human reviews and signs off.

### Rule 0.7 — Human Judgment Cannot Be Self-Certified
An agent may **never** close a human-review ticket by generating a document that asserts the review happened. Mark as `BLOCKED: awaiting external review`. Stop. Do not create `*-signoff.md` files without real external evidence.

*This rule was added because it was violated twice in this project's history.*

### IPC Data Flow (Non-Negotiable)
```
Database → Tauri Command → Zustand Store → React Component
```
Never mutate React state directly for anything that must persist. Never add cloud database clients.

### What This Project Is NOT
- Not a stealth profiling app (was the original concept; redesigned)
- Not a cloud-connected app for core features
- Not an autonomous crisis-notification system
- Not "first in the world" of anything (genuine differentiator: transparent + local + DPDP-compliant + culturally grounded for India)

---

## 4. Technical Decisions Log

> Add entries here whenever a significant architectural or implementation decision is made. Include why alternatives were rejected.

| Date | Decision | Rationale | Alternative Rejected | ADR |
|---|---|---|---|---|
| — | Use Tauri 2 (not Electron) for desktop shell | Lighter, more secure, native performance; better for low-powered devices | Electron (heavy, memory-intensive) | ADR-0001 |
| — | SQLCipher with AES-256 for local DB | Encryption at rest is structural, not optional; OS keychain for key material | Unencrypted SQLite (rejected: data sensitivity); cloud DB (rejected: DPDP + local-first) | ADR-0002 |
| — | Age threshold hard-coded at 18 (India's DPDP legal threshold) | Not a configurable setting — making it configurable would allow accidental or deliberate lowering | Configurable threshold | ADR-0003 |
| — | Crisis escalation requires human review before guardian notification | Autonomous AI-to-parent pipeline endangers teens in unsafe households | Direct AI notification pipeline (rejected: safety risk) | ADR-0004 |
| — | Emotion model (DistilRoBERTa) scoped to Mood Mirror only | DPDP S.9 disclosure requirement; ethical constraint on data purpose | Applying emotion detection to all interactions (rejected: stealth profiling) | ADR-0005 |
| — | OS keychain for encryption key (not stored in DB) | Storing key hash alongside data it protects is a weaker pattern | `encryption_key_hash` in `users` table (rejected: weaker security) | ADR-0006 |
| — | Transparent assessment framing (disclosures before every activity) | DPDP S.9(3) requirement; also: honest design builds more durable trust | Hidden/stealth assessment (rejected: illegal for minors, trust-breaking) | ADR-0007 |
| — | k-anonymity guard (k ≥ 5) in school_api.rs | Prevents school admins from isolating individual teens' mental health data | Raw individual-level school reports (rejected: privacy risk) | ADR-0008 |
| 2026-10-29 | Real O*NET + India NCS Career Taxonomy & Cosine Vector Matcher | Replaced naive 4-branch heuristic with empirical 11-D vector matching (70% RIASEC + 30% Big Five) with Indian school streams & entrance exams | Hardcoded 4-category arithmetic averages (rejected: toy implementation) | ADR-0009 |
| 2026-10-29 | IPIP-NEO Normative Gaussian Percentile Calibration | Calibrated raw scores against OpenPsychometrics 1,000,000+ benchmark distributions ($\mu, \sigma$) via standard normal CDF polynomial approximation | Flat linear $0-100$ scaling ignoring population skew (rejected: scientifically invalid) | ADR-0010 |
| 2026-10-29 | Exponential Moving Average (EMA) Rolling Traits & Cognitive Mini-Games Integration | Implemented $\alpha = 0.25$ EMA smoothing for Big Five & RIASEC trait snapshots; integrated ReactionTest (Shepard-Metzler/Go-No-Go) & SpatialPuzzle into Skill Arena; added ActivityHistoryViewer | Overwriting profile completely per session (rejected: erratic swings in psychological constructs) | ADR-0011 |
| 2026-10-29 | Context-Aware Local AI Mentor Prompt Injection & AI Self-Identification Invariant | Injected empirical Big Five / RIASEC traits into local LLM prompt template; strictly enforced explicit self-identification as an AI assistant (never human/clinician); added academic career category | Unconstrained conversational bot without psychometric grounding (rejected: generic, ungrounded) | ADR-0012 |
| 2026-10-29 | Rule 0.3 Guardian Notification Gate & Teen-Informed Invariant | Enforced structural requirement that guardian notification cannot be dispatched without `teen_informed_at` non-null, `human_review_status = 'reviewed_guardian_notified'`, and clinician credential verification | Autonomous AI dispatch or notification without informing minor (rejected: violates Rule 0.3 and DPDP Act) | ADR-0013 |
| 2026-10-29 | Single-Query Shared Dashboard Parity & DPDP Section 9 Zero Divergence | Unified `SharedDashboardView` with side-by-side verification proving Teen and Parent render from the exact same data source; granular teen sharing controls | Separate parent monitoring console with hidden behavioral metrics (rejected: violates DPDP Section 9) | ADR-0014 |
| 2026-10-30 | 16-Personality Typology via Empirical Big Five Projection | Projected Big Five traits directly onto 16 Jungian types based on McCrae & Costa (1989) psychometrics (E, O->N, A->F, C->J, N->Identity) with animated dual spectrum sliders and explorer modal | Forcing teens through separate 60-question MBTI questionnaire (rejected: cognitive fatigue & redundancy) | ADR-0015 |
| 2026-10-30 | Higgins' Actual vs Ideal Evolved Self-Discrepancy Engine & Strengths Journal | Modeled adolescent self-actualization by comparing grounded baseline foundation against evolved potential with 3-stage stepping stones; 100% on-device private journal storage | Static diagnostic labeling or pathologizing "weakness" reports (rejected: anti-developmental for minors) | ADR-0016 |
| 2026-10-30 | Multi-Dimensional Personalized Self-Management Engine | Dynamically matched 10 evidence-based CBT/ACT strategies based on Big Five, 16-type archetype, learning style (visual/kinesthetic/auditory), age tier, and adaptive journal reflections with custom tool authoring | Generic static self-help lists (rejected: low efficacy across diverse cognitive temperaments) | ADR-0017 |
| 2026-10-30 | Maslow's Hierarchy of Needs & Wants vs. Needs Distraction Shield | Implemented 5-tier adolescent Maslow pyramid with automatic urge discernment (classifying desires as Dopamine Traps vs Healthy Desires vs Core Needs) and hungry-tier foundation alerts | Shaming adolescent distraction as willpower failures (rejected: ignores physiological/safety root causes) | ADR-0018 |
| 2026-10-30 | Atma-Jnana Foundational Philosophy & "Self Realisation is God's Realisation" Creed | Anchored entire platform in the sacred verses of Sant Kabir Das (*आत्मज्ञान बिना नर भटके... सोई हंस तेरे घट माहि*); framed all psychometric, mirror, and distraction-shield tools as modern instruments turning minor attention inward toward the indwelling Divine Swan (*सोई हंस*) | Treating app as a disconnected behavioral utility without spiritual-philosophical anchor (rejected: contradicts founding vision) | ADR-0019 |

---

## 5. Bug Log

> Add significant bugs here when discovered — especially ones that affected an entire session or required architectural changes.

| Date | Bug ID | Description | Root Cause | Fix | Status |
|---|---|---|---|---|---|
| 2026-10-29 | CRIT-06 | `logout` command defined in `commands/mod.rs` was missing from `tauri::generate_handler!` in `lib.rs` | Missing handler registration | Registered `commands::logout` in `lib.rs` and wired IPC in store | ✅ Resolved |
| 2026-10-29 | CRIT-07 | `resolve_crisis_event` unconditionally set `state = 'Cleared'` | Hardcoded SQL state | Now maps decision to target state (`Escalate`, `Monitor`, `Cleared`) and enforces invariant | ✅ Resolved |
| 2026-10-29 | CRIT-05 | Plaintext PIN written to `localStorage` during signup | Unencrypted `prerna_pin_${userId}` | Removed from `store/index.ts` | ✅ Resolved |
| 2026-10-29 | CRIT-02 | `user` and `isAuthenticated` persisted to `localStorage` | Zustand persist partialize including auth state | Limited persistence to UI and streak state only | ✅ Resolved |
| 2026-10-29 | CRIT-03 | Teen header nav displayed `/parent-dash` & `/school-dash`; unauthenticated role access | Unrestricted routes and navigation links | Added role guard redirect `<Navigate to="/" replace />` & cleaned nav | ✅ Resolved |
| 2026-10-29 | STRUCT-04 | Age range mismatch: frontend used `'16-18'` vs backend `AgeBand` requiring `'16-17'` | Schema drift | Standardized on `'13-15' \| '16-17' \| '18+'` in store, AuthModal, and tests | ✅ Resolved |
| 2026-10-29 | BUG-01 | `App.tsx` imported stub `activities/SkillArena.tsx` instead of full `skills/SkillArena.tsx` | Multiple implementations | Swapped import to full component with `DisclosureGate` | ✅ Resolved |
| 2026-10-29 | BUG-06 | `AiMentorChat.tsx` did not screen messages for crisis indicators | Missing check in `handleSend` | Wired `checkForCrisisIndicators` into `AiMentorChat` | ✅ Resolved |
| 2026-10-30 | BUG-07 | Browser crash when opening Teen Profile / Dashboard | Standard browser lacked Tauri IPC runtime; raw `@tauri-apps/api/core` `invoke` threw synchronous TypeError | Replaced raw `invoke` imports with `safeInvoke` fallback from `mockBackend.ts` | ✅ Resolved |
| 2026-10-30 | BUG-08 | `TypeError: Cannot read properties of undefined (reading 'slice')` in ParentPermissionManager | Missing null checks on `fullProfile.careerMatches` | Added null-coalescing defaults `(fullProfile.careerMatches \|\| []).slice(0, 3)` | ✅ Resolved |
| 2026-10-30 | BUG-09 | Duplicate Helpline link in header navigation | Redundant `<Link to="/support">Helplines</Link>` alongside button | Removed redundant link, preserved prominent single pill | ✅ Resolved |

---

## 6. Session Log

> Add a brief entry after each significant work session.

| Date | Session Summary | Completed | Blockers Encountered | Next Steps |
|---|---|---|---|---|
| 2026-10-29 | Initial documentation created | PRD, architecture, rules, design, task, memory generated | H1–H4 human-review blockers | Audit and fix baseline |
| 2026-10-29 | Full codebase audit & P0 security / compliance hardening | Resolved CRIT-02, CRIT-03, CRIT-05, CRIT-06, CRIT-07, BUG-01, BUG-06, STRUCT-04; removed duplicate stubs; typecheck & vitest 100% pass | Windows host lacks Perl & LLVM for local `llama-cpp-sys-2` build (handled by CI) | Implement remaining Phase 1/2 tasks in `task.md` |
| 2026-10-29 | Real Dataset Ingestion: Career Taxonomy & Vector Matcher | Created real 11-D O*NET + India NCS dataset; updated `careerClassifier.ts` with cosine vector matching; enriched CareerPathwaysWidget with streams & exams; 34/34 tests pass | None | Ingest IPIP normative distributions into scoringEngine |
| 2026-10-29 | Real Dataset Calibration & Safety Drill Test Suite | Embedded OpenPsychometrics 1M+ IPIP & O*NET statistical norms ($\mu, \sigma$) into `scoringEngine` & `fusionEngine`; created automated crisis screening test suite with real distress & benign controls (50/50 tests passing) | None | Proceed to Phase 2 task execution |
| 2026-10-29 | Phase 2 Activities & Rolling Assessment Engine (P2-2, P2-3, P2-4) | Built ReactionTest & SpatialPuzzle mini-games; wired SkillArena to backend; implemented EMA rolling average scoring for Big Five & RIASEC; built ActivityHistoryViewer & disclosure re-review modal; 61/61 tests pass; 0 type errors | None | Proceed to Phase 3 (AI Mentor & Local LLM Integration) |
| 2026-10-29 | Phase 3 AI Mentor & Career Pathways (P3-1, P3-2, P3-3) | Enhanced `llmClient.ts` with context injection & offline fallback; updated `AiMentorChat.tsx` with AI disclosure banners; enriched career classifier with 5th category (`academic`); verified < 2s latency and AI self-identification; 67/67 tests pass; 0 type errors | None | Prepare technical brief for Phase 4 (Crisis Protocol & Safety Invariants) |
| 2026-10-29 | Phase 4 & Phase 5: Crisis Protocol Invariants & Shared Dashboard Parity (P4-1 through P5-3) | Implemented `dispatchGuardianNotification` in `escalationRouter.ts` gated by Rule 0.3; built always-on `ResourceSurface.tsx` with official Indian helplines (Tele-MANAS 14416, Childline 1098, KIRAN 1800-599-0019, Vandrevala 9999 666 555); built teen-controlled `TrustedAdultConnector.tsx`; rebuilt `SharedDashboardView.tsx` with side-by-side single-query parity; verified `DataExport`, `DataDelete`, and `AuditTrailViewer`; 90/90 tests pass; 0 type errors | H1 ticket remains blocked awaiting external clinician sign-off per Rule 0.7 | Prepare Phase 5 localisation review & Phase 6 pre-deployment verification |
| 2026-10-29 | Phase 5 Localisation & Phase 6 Pre-Deployment Integration Walkthrough (P5-4, P6-1, P6-2) | Built dynamic i18n translation system supporting 6 Indian languages; verified text expansion in Hindi/Marathi/Tamil; verified BetaOnboardingNotice disclaimers; authored end-to-end integration walkthrough covering full adolescent lifecycle; verified production bundle build (`dist/`); reached 100/100 tests passed across 24 test files | H1–H4 tickets preserved awaiting external human clinical, legal, and psychometric collaborator sign-offs per Rule 0.7 | Ready for Human Reviewer (H1–H4) Engagement & Beta Testing |
| 2026-10-30 | Phase 7: 16-Personality Typology, Self-Evolution Sanctuary, Personalized Self-Management & Maslow Needs Compass | Integrated 16-Personality mapping from Big Five (McCrae & Costa, 1989) with animated spectrum cards and explorer modal; implemented Higgins' Actual vs Improvised Self comparison engine; built 100% on-device Strengths & Growth Journal; engineered multi-dimensional personalized self-management plan (matching 10 CBT/ACT tools based on Big Five, 16-type, learning style, age tier, and journal tags); built Maslow 5-Tier Needs Compass with distraction shield and root-need discernment; reached 119/119 tests passed across 27 test files; production build verified in 8.76s | None | Human reviewer engagement (H1–H4) |
| 2026-10-30 | Atma-Jnana Foundational Creed Integration & Role Persistence Fix | Fixed session role persistence across reloads with header switcher; embedded Sant Kabir Das foundational Dohas (*आत्मज्ञान बिना नर भटके... सोई हंस तेरे घट माहि*) and "Self Realisation is God's Realisation" creator manifesto across `AtmaJnanaOriginModal`, `SelfEvolutionSanctuary` Tab 5, `Dashboard`, `WelcomeScreen`, `TeenProfileView`, and `README.md` | None | Verify test suite and production build |

---

## 7. Architecture Change Log

> Record any change to the system architecture here. Cross-reference with the ADR in `docs/adr/`.

| Date | Change | Why | Impact | ADR |
|---|---|---|---|---|
| — | Consent & Age-Gating layer promoted to top-level architectural gate | DPDP S.9 requirement; was previously a feature bullet inside AI Core | Everything below the gate now structurally depends on consent verification | ADR-0003 |
| — | Crisis Escalation pulled out as own top-level component | Highest-stakes part of the system; needed dedicated design/review/test | Separate `crisis_events` table; isolated crisis/ module | ADR-0004 |
| — | `parent_consents`, `crisis_events`, `access_audit_log` tables added | Required by consent redesign; did not exist in original schema | DB schema significantly expanded | — |
| — | Removed `encryption_key_hash` from `users` table | Storing key hash in DB alongside data is weaker than OS keychain | Key material now in OS keychain only | ADR-0006 |

---

## 8. External Dependencies & Contacts

> Fill in as engagements are established.

| Dependency | Who | Contact | Engagement Date | Status |
|---|---|---|---|---|
| H1 — Clinical reviewer | TBD | — | — | ⏳ Not started |
| H2 — DPDP legal counsel | TBD | — | — | ⏳ Not started |
| H3 — Hindi reviewer | TBD | — | — | ⏳ Not started |
| H4 — Disclosure reviewer | TBD | — | — | ⏳ Not started |
| Crisis helplines (verify current) | KIRAN: 1800-599-0019, Vandrevala, iCall | — | Verify at build time | ⏳ Pre-launch |

---

## 9. Known Limitations (Acknowledged, Not Hidden)

| Limitation | Why It Exists | Mitigation |
|---|---|---|
| Age verification is not perfect | No product can perfectly verify age from self-report | Documented good-faith verification per DPDP guidance; acknowledged limitation in privacy policy |
| Crisis detection SLA during beta | Human review requires a trained counselor; response time during beta is uncertain | Beta-specific disclosure tells participants exact expectations |
| Parental verification mechanism (simulated) | Real DigiLocker / equivalent integration pending H2 legal review | Marked `SIMULATED — NOT PRODUCTION READY` in code |
| LLM responses may vary on lower-spec hardware | llama.cpp performance on CPU-only machines vs RTX 4060 | Document minimum system requirements; test on CPU-only path |

---

## 10. Workflow Reference (Vibe Coding Phases)

```
IDEA → RESEARCH → DEFINE THE USER → PRD → CHOOSE TECH STACK →
ARCHITECTURE → DESIGN → PROJECT RULES → TASK BREAKDOWN →
SETUP → DEVELOPMENT → TESTING → SECURITY REVIEW → CODE REVIEW →
PREVIEW DEPLOYMENT → QA TESTING → PRODUCTION → MONITORING → ITERATION
```

**Current position:** SETUP / DEVELOPMENT (Phase 1)  
**Documents for current phase:** `docs/task.md` (what to build next), `docs/rules.md` (how to build it), `docs/architecture.md` (technical reference)

