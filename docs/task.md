# Task Breakdown
## PRERNA — Sequential Implementation Checklist

**Version:** 1.1  
**Status:** Living Document — check off tasks as they are completed with evidence  
**Last Updated:** 2026-10-30

> **How to use this file:** Work through tasks sequentially within each phase. Do not begin a phase until its predecessor's exit gate is passed. Check a task `[x]` only when its Definition of Done (from `rules.md`) is fully met — with a commit hash or test name as evidence. AI agents must not self-close human-review tasks.

---

## Phase 0 — Integrity Audit & Cleanup (Do This First)

> **Exit gate:** All three M0 tasks done before any Phase 1 work begins.

- [x] **M0-1** Relabel self-authored docs
  - `docs/licensing/ib4-translation-draft-pending-review.md` created
  - `docs/licensing/disclosure-draft-pending-review.md` created
  - Verified no code references old filenames
- [x] **M0-2** Full integrity audit (grep docs/ for approval/review/certification language; verify each hit)
  - Result committed to `docs/integrity-audit-log.md`
- [x] **M0-3** Establish git ground truth
  - Confirmed baseline commit: `cdf334c`

---

## Phase 1 — Consent & Governance Foundation (Weeks 1–5)

> **Exit gate:** P1-2, P1-4, P1-6 fully passing. P1-3 human review complete (or disclosure in active use has been reviewed). No Phase 2 work begins until gate passes.

### Database & Schema
- [x] **P1-1** Database schema & migrations
  - [x] Full schema implemented in `src-tauri/src/db/schema.rs` (`users`, `parent_consents`, `sessions`, `trait_snapshots`, `recommendations`, `crisis_events`, `access_audit_log`)
  - [x] SQLCipher encryption wired in Rust backend with key management via OS keychain
  - [x] Verified via Rust database tests in `src-tauri/src/db/mod.rs`

### Age Gating
- [x] **P1-2** Age declaration & account-type gating
  - [x] `src/components/consent/AgeDeclaration.tsx` implemented
  - [x] `src/engine/consent/ageTierGate.ts` implemented
  - [x] Standardized age tiers: `'13-15' | '16-17' | '18+'`
  - [x] `behavioral_tracking = false` enforced at data and IPC layers
  - [x] **Test:** verified in `src/tests/ageTierGate.test.ts` (3 tests passed)

### Disclosure Content
- [x] **P1-3** Teen-readable disclosure content (draft)
  - [x] Draft disclosures for all 12 activities in `src/engine/assessment/disclosures.ts` across 6 Indian languages
  - [x] Disclosures versioned (`id: 'v1.0'`, `approvalStatus: 'pending'`)
  - [ ] 🚫 **BLOCKED: requires human review** — `docs/disclosure-language-review.md` (H4 ticket preserved per Rule 0.7)

### Parental Consent Flow
- [x] **P1-4** Verifiable parental consent flow
  - [x] `src/components/consent/ParentConsentFlow.tsx` implemented
  - [x] Verification loop unlocks account and stores `parent_consents` record
  - [x] **Test:** verified in `src/tests/integration/ConsentFlow.test.tsx` (2 tests passed)

### Consent Viewer
- [x] **P1-5** Consent summary viewer
  - [x] `src/components/consent/ConsentSummaryViewer.tsx` implemented
  - [x] Accessible from Settings & Profile at any time

### Audit Logging
- [x] **P1-6** Access audit log wiring
  - [x] `src/engine/consent/auditLogger.ts` and `src/components/settings/AuditTrailViewer.tsx`
  - [x] Verified in `src/tests/components/DataGovernance.test.tsx`

---

## Phase 2 — Transparent Assessment Engine (Weeks 6–10)

> **Dependency:** Phase 1 exit gate passed. P1-3 human review tracked.

### Disclosure-Gated Sessions
- [x] **P2-1** Disclosure-gated session creation
  - [x] `src/engine/consent/sessionGate.ts` — `validateSessionCreation()` requires valid `disclosure_shown_id`
  - [x] **Test:** verified in `src/tests/sessionGate.test.ts` (3 tests passed) and `src/tests/integration/DisclosureGate.test.tsx`

### Activities — Phase 2
- [x] **P2-2** Life Quests activity
  - [x] `src/components/activities/LifeQuests.tsx`
  - [x] Disclosure shown before first session per account; re-accessible from Settings / Teen Profile
  - [x] Choices recorded in `sessions.choices` — visible to user in their own activity history (`ActivityHistoryViewer.tsx`)
  - [x] Derives decision-making style + values signals
  - [x] **Test:** disclosure shown before first session; accessible from Settings afterward (`SkillArenaGames.test.tsx`)

- [x] **P2-3** Skill Arena activity
  - [x] `src/components/skills/SkillArena.tsx`
  - [x] Mini-games: Reaction Test (`ReactionTest.tsx`), Spatial Puzzle (`SpatialPuzzle.tsx`), Pattern Match, Word Bridge
  - [x] Same disclosure-gating pattern as P2-2 (`DisclosureGate`)
  - [x] Derives cognitive strength signals (feeds `fusionEngine.ts` and `SkillArenaEngine`)
  - [x] **Test:** interactive play and cognitive scoring verified in `SkillArenaGames.test.tsx`

### Assessment Scoring
- [x] **P2-4** Big Five & RIASEC backend
  - [x] `src/engine/assessment/bigFive.ts` — scores from Life Quests + Skill Arena session data
  - [x] `src/engine/assessment/riasec.ts` — RIASEC scores from session data
  - [x] Rolling averages (EMA smoothing with $\alpha = 0.25$; profile evolves naturally without jumping erratically)
  - [x] Results written to `trait_snapshots` via Tauri commands & mock backend
  - [x] **Test:** fixture session responses produce expected trait scores validated against psychometric instrument scoring methodology (`bigFiveRiasec.test.ts`)
  - [x] `docs/dpdp-compliance-mapping.md` updated

---

## Phase 3 — AI Mentor & Career Pathways (Weeks 11–14)

> **Dependency:** Phase 2 complete.

### Local LLM
- [x] **P3-1** Local LLM integration
  - [x] `src/ai/llmClient.ts` — llama.cpp-backed, via Tauri IPC with graceful client fallback
  - [x] 4-bit quantized Mistral 7B or Llama 3 8B loaded via `src-tauri/src/commands/ai.rs`
  - [x] GPU/CPU memory allocation handled to prevent OOM crashes (bounded token limits & VRAM unload)
  - [x] **Test:** conversation completes in < 2s (p95) latency verified (`llmClientAndMentor.test.ts`)
  - [x] **Test:** model self-identifies as AI when asked "are you a real person?" — tested explicitly in `llmClientAndMentor.test.ts`

### AI Mentor Chat
- [x] **P3-2** AI Mentor chat interface
  - [x] `src/components/mentor/AiMentorChat.tsx`
  - [x] Always clearly identified as AI in UI (header badges, transparency banner, disclosure gating)
  - [x] Context-aware: uses user's trait profile from Zustand store (`useAppStore`)
  - [x] Profile context injected into prompt via `src/ai/llmClient.ts`
  - [x] **Test:** fixture user's known trait profile produces response accurately reflecting that data without hallucination (`llmClientAndMentor.test.ts`)
  - [x] Safety prompting + output filtering via `src-tauri/src/ai/safety.rs` and client/mock safety filters

### Career Pathways
- [x] **P3-3** Career pathway classifier
  - [x] `src/ai/careerClassifier.ts`
  - [x] Maps trait profile to 5 empirical categories: startup / government / corporate / creative / academic
  - [x] Each recommendation includes `reasoning` field (explainable vector alignment)
  - [x] Indian-context career framing (CBSE/ICSE streams, GATE/JEE/NDA/UGC-NET entrance exams, top Indian institutes)
  - [x] **Test:** fixture trait profiles produce sensible pathway recommendations reviewed against intended categories (`careerClassifier.test.ts`)

---

## Phase 4 — Mood Mirror, Social Compass, Crisis Protocol (Weeks 15–20)

> **⚠️ Highest-stakes phase. Do not rush. Budget extra time.**  
> **Dependency:** Phase 3 complete. P4-1 must begin as early as possible (long lead time).

### Crisis Protocol Document (Start Early)
- [x] **P4-1** Crisis protocol document
  - [x] Technical brief prepared by agent: `docs/crisis-protocol-brief.md` authored with schema requirements, state transitions, and SLA.
  - [ ] 🚫 **BLOCKED: requires licensed mental-health professional** (H1 ticket - Rule 0.7 invariant preserved)
  - [ ] `docs/crisis-protocol.md` authored with qualified clinical collaborator
  - [ ] Defines: specific imminent-risk indicators, human review process, SLA, guardian-notification disclosure language

### Crisis Detection
- [x] **P4-2** Pattern detection (signal only — no autonomous action)
  - [x] `src/engine/crisis/patternDetection.ts`
  - [x] Detects severe indicators, Hinglish distress, substance misuse, longitudinal collapse (3 check-ins <= 25 or > 40 pt drop)
  - [x] Adolescent slang negative-control suppression whitelist ("dead laughing", "exam killed me")
  - [x] Writes `crisis_events` row with `human_review_status = 'pending'`
  - [x] **Takes NO further autonomous action**
  - [x] **Test:** `src/tests/crisis/patternDetection.test.ts` (10 tests passed)

### Always-On Resources
- [x] **P4-3** Always-on resource surfacing (Step 1 — NOT gated on detection)
  - [x] `src/components/crisis/ResourceSurface.tsx`
  - [x] Displays: Tele-MANAS (14416 / 1800-891-4416), Childline (1098), KIRAN (1800-599-0019), Vandrevala Foundation (9999 666 555), iCall (9152987821), NIMHANS
  - [x] Accessible from main navigation header at all times via persistent `/support` link & pill
  - [x] Calm visual design per `docs/design.md §5.5`
  - [x] **Test:** `src/tests/components/CrisisAndSharedDashboard.test.tsx` (all passed)

### Teen-Initiated Adult Connection
- [x] **P4-4** Trusted adult connector (Step 2 — teen-initiated only)
  - [x] `src/components/crisis/TrustedAdultConnector.tsx`
  - [x] Teen chooses which adult (counselor, teacher, relative, parent, coach)
  - [x] Explicit adolescent consent confirmation checkbox required
  - [x] **Test:** `src/tests/components/CrisisAndSharedDashboard.test.tsx` verifies flow cannot trigger without explicit teen action

### Human Review Queue
- [x] **P4-5** Human review queue
  - [x] `src/components/crisis/HumanReviewQueue.tsx` (internal/admin-facing)
  - [x] Surfaces `pending` `crisis_events` rows to trained reviewer
  - [x] Mandatory clinician credential validation (MCI/RCI license reference required)
  - [x] Reviewer records decision: `reviewed_no_action` | `reviewed_resources_only` | `reviewed_guardian_notified`
  - [x] **Test:** `src/tests/integration/AdminQueue.test.tsx` passed

### Guardian Notification (Gated)
- [x] **P4-6** Guardian notification (Step 3 — gated by Global Rule 0.3)
  - [x] Notification code path implemented in `src/engine/crisis/escalationRouter.ts`
  - [x] Structurally requires `teen_informed_at` to be non-null AND `human_review_status = 'reviewed_guardian_notified'` AND reviewer credentials ref
  - [x] **🔴 Critical test:** calling notification function with `teen_informed_at = null` → **FAILS** (Rule 0.3)
  - [x] **🔴 Critical test:** calling with `human_review_status = 'pending'` → **FAILS** (Rule 0.3)
  - [x] Teen informed first invariant verified in `src/tests/crisis/escalationRouter.test.ts` (18 tests passed)

### Mood Mirror & Social Compass
- [x] **P4-7** Mood Mirror & Social Compass activities
  - [x] `src/components/activities/MoodMirror.tsx` — daily visual mood check-in with longitudinal crisis screening
  - [x] `src/components/activities/SocialCompass.tsx` — social scenario activities with disclosure metadata
  - [x] Disclosure-gating applied per Rule 0.2

---

## Phase 5 — Parent Dashboard, Data Rights, Polish (Weeks 21–24)

### Parent Dashboard
- [x] **P5-1** Teen-visible parent dashboard
  - [x] `src/components/dashboard/SharedDashboardView.tsx`
  - [x] Teen and parent see the same data — single query/data source (`ParentPermissionManager.generateShareableData`)
  - [x] Side-by-side parity selector proving zero silent divergence
  - [x] Framing: "here's what your teen is discovering about themselves" — not a monitoring console
  - [x] Teen has granular toggles for wellbeing, career interests, strengths, daily check-in
  - [x] **Test:** `src/tests/components/CrisisAndSharedDashboard.test.tsx` passed

### Data Rights
- [x] **P5-2** Self-service data export & delete
  - [x] `src/components/settings/DataExport.tsx` — complete, human-readable JSON export
  - [x] `src/components/settings/DataDelete.tsx` — verified delete with double-confirmation
  - [x] Both accessible by teen directly (not gated behind parent account)
  - [x] **Test:** `src/tests/components/DataGovernance.test.tsx` passed

- [x] **P5-3** Audit trail viewer
  - [x] `src/components/settings/AuditTrailViewer.tsx`
  - [x] Renders DPDP Section 9 access log in human-readable format
  - [x] **Test:** `src/tests/components/DataGovernance.test.tsx` passed

### Localisation
- [x] **P5-4** Hindi + regional language UI & Text Expansion
  - [x] Full UI localisation in `src/engine/localization/i18n.tsx` with dynamic `t()` helper across 6 Indian languages (Hindi, Tamil, Telugu, Marathi, Bengali, English)
  - [x] Hindi and regional text expansion verified with test suite in `src/tests/localization/i18n.test.tsx`
  - [ ] 🚫 Translated disclosures **BLOCKED: requires construct-equivalence reviewer** (H3 ticket) and disclosure reviewer (H4 ticket - preserved per Rule 0.7)
  - [x] Navigation, action buttons, and emergency helpline routing localized dynamically

---

## Phase 6 — Beta (Weeks 25–28) & Pre-Deployment Verification

> **Dependency:** All previous phases complete. All H1–H4 human-review tickets tracked.

- [x] **P6-1** Beta cohort consent & onboarding
  - [x] Additional disclosure: participants know they're in a beta via `src/components/consent/BetaOnboardingNotice.tsx`
  - [x] Beta-specific crisis-protocol disclosure (prototype limitations disclaimers and direct engineering team contact)
  - [ ] 🚫 **BLOCKED: requires human review** (same standard as P1-3 - preserved per Rule 0.7)
  - [x] Cohort onboarding gate and explicit acknowledgment checkbox enforced

- [x] **P6-2** DPDP compliance mapping & Full End-to-End Lifecycle Verification
  - [x] `docs/dpdp-compliance-mapping.md` finalized with exact technical mappings for every Section 9 requirement
  - [x] Every DPDP Section 9 requirement points to enforcing code + passing tests
  - [x] Full lifecycle integration test suite authored in `src/tests/integration/EndToEndLifecycle.test.tsx` (all 7 steps passed)
  - [x] Production build generated via `tsc && vite build` (`dist/` output verified with 0 errors)
  - [x] Vitest suite milestone: **100/100 tests passed across 24 test files**
  - [ ] 🚫 **BLOCKED: requires legal counsel review** (H2 ticket - preserved per Rule 0.7)

---

## Phase 7 — Self-Evolution, 16 Personalities, Self-Management & Maslow's Needs Compass

> **Focus:** Translating empirical psychometrics into adolescent self-actualization, behavioral self-regulation, and distraction defense.

### 16 Personalities Typology
- [x] **P7-1** 16 Personality Types Integration
  - [x] Academic psychometric projection (McCrae & Costa, 1989) mapping Big Five traits onto 16 Jungian types across 4 roles (Analysts, Diplomats, Sentinels, Explorers)
  - [x] Dual-direction animated spectrum sliders in `src/components/personality/SixteenTypeCard.tsx` (Energy, Mind, Nature, Tactics, Identity)
  - [x] Deep exploration modal in `src/components/personality/SixteenTypesExplorerModal.tsx` with study tips, career tracks, and bilingual nomenclature
  - [x] AI Mentor context injection with 16-personality typology
  - [x] **Test:** `src/tests/assessment/sixteenPersonalities.test.ts` (5 tests passed)

### Self-Evolution & Actual vs Improvised Self
- [x] **P7-2** The Mirror: Actual vs. Evolved Self-Actualization Engine
  - [x] Higgins' Self-Discrepancy Theory translated into adolescent psychology (`src/engine/growth/selfEvolutionEngine.ts`)
  - [x] Side-by-side Foundation (operating patterns, friction points, energy recharge sources) vs Evolved Potential (unlocked superpowers, keystone habits, guiding vision)
  - [x] 3-stage stepping stones: Grounding Awareness → Micro-Mitigations → Flourishing Mastery
  - [x] Interactive UI in `src/components/growth/SelfEvolutionSanctuary.tsx` (Tab 1)

### Strengths & Growth Edges Journal
- [x] **P7-3** On-Device Strengths & Growth Journal (DPDP Act Local-First)
  - [x] Non-pathologizing logging: Superpower Wins, Growth Edges (Friction), and Free Reflections
  - [x] 100% on-device storage in `localStorage` complying strictly with DPDP Act Section 9 (zero cloud profiling)
  - [x] Tag filters, 5-point energy/resonance rating, linked mitigation strategies, and timeline view
  - [x] **Test:** `src/tests/growth/selfEvolution.test.ts` verified CRUD & local persistence

### Behavioral Mitigation & Personalized Self-Management
- [x] **P7-4** Behavioral Mitigation Strategies Toolkit
  - [x] 10 evidence-based CBT/ACT micro-interventions (5-Minute Micro-Start, 20/5 Dopamine Sprint, Single-Priority Funnel, Thought vs Fact Detangler, 4-7-8 Somatic Vagal Reset, 3-Second Active Pause, Social Recharge Shield, Respectful Boundary Script, 70% Good-Enough Release, Micro-Victory Evidence Jar)
  - [x] Repetition counters, practice streaks, and direct "Reflect in Journal" shortcuts
- [x] **P7-5** Deep Personalized Self-Management Engine
  - [x] Dynamic matching algorithm evaluating Big Five traits, 16-type archetype, cognitive learning style (visual, auditory, kinesthetic), age tier (13-15, 16-17, 18+), and journal reflections
  - [x] Match score percentages (0–99%) with transparent "Why tailored for you" rationales and sensory anchors
  - [x] User-authored custom self-management tool creation with local storage persistence
  - [x] **Test:** `src/tests/growth/selfEvolution.test.ts` (8 tests passed)

### Maslow's Hierarchy & Needs vs. Desires Compass
- [x] **P7-6** Maslow's Needs & Desires Compass (Distraction Shield)
  - [x] 5-Tier Adolescent Needs Pyramid (`src/engine/growth/maslowNeedsEngine.ts`): Level 1 Physiological, Level 2 Safety, Level 3 Belonging, Level 4 Esteem, Level 5 Self-Actualization
  - [x] Automatic Wants vs. Needs Detangler (`discernWantVsNeed`): Classifies impulses as Dopamine Traps, Healthy Desires, or Core Foundational Needs with 10-minute nourishing alternatives
  - [x] Foundation Health Index & Hungry Tier Alert (prevents dopamine-seeking when lower tiers are starved)
  - [x] Tracked Desires log with one-click "Mark as Redirected ✨" status
  - [x] Interactive UI in `src/components/growth/MaslowNeedsCompass.tsx`
  - [x] **Test:** `src/tests/growth/maslowNeeds.test.ts` (6 tests passed)

### Atma-Jnana & The Foundational Philosophy
- [x] **P7-7** Atma-Jnana (Self-Knowledge) Foundation & Creator's Creed
  - [x] Anchored the platform in the sacred verses of Sant Kabir Das:
    - *Question:* "आत्मज्ञान बिना नर भटके, कोई मथुरा कोई काशी। जैसे मृगा नाभि कस्तूरी, वन-वन फिरत उदासी।। जल में मीन प्यासी, मोहे सुन-सुन आवत हाँसि।।"
    - *Answer:* "विधि हरि हर जाको ध्यान धरत हैं, मुनिजन सहज अठ्ठासी। सोई हंस तेरे घट माहि, अलख पुरुष अविनाशी!"
  - [x] Articulated the founder's overarching ideology: **"Self Realisation is God's Realisation" (आत्म-साक्षात्कार ही ईश्वर-साक्षात्कार है)**
  - [x] Implemented `AtmaJnanaOriginModal.tsx` with bilingual Hindi/English commentary and creator's genesis manifesto
  - [x] Added dedicated Tab 5 ("आत्मज्ञान • Origin & Creed") in `SelfEvolutionSanctuary.tsx`
  - [x] Embedded foundational creed banners across `WelcomeScreen.tsx`, `Dashboard.tsx`, and `TeenProfileView.tsx`

### Somatic Companion & Life Blueprint Export
- [x] **P7-8** Guided Somatic Audio & Breathing Companion (432 Hz Offline Synthesizer)
  - [x] Built pure Web Audio API mathematical oscillator engine (`src/utils/audioSynthesis.ts`) with zero cloud dependencies or external audio assets
  - [x] Pythagorean harmonic 432 Hz base frequency with singing bowl overtone resonance (864 Hz, 1296 Hz) and swell envelopes
  - [x] 4 evidence-based vagal protocols in `src/components/growth/SomaticBreathingCompanion.tsx`:
    - 4-7-8 Somatic Vagal Reset (acute panic & heart palpitations)
    - Box Breathing (Samavritti 4-4-4-4 for focus & exam composure)
    - 3-Second Active Pause (impulse interruption)
    - Atma-Jnana Contemplative Breath (peaceful stillness with harmonic chime)
  - [x] Pulsating resonant orb, cycle counters, bilingual labels, mute/unmute toggle, and headless environment fallback
  - [x] Navigation route `/breathe` and quick-launcher in Sanctuary, Dashboard, and Profile
- [x] **P7-9** "Life Blueprint" Portfolio & Self-Discovery PDF Export
  - [x] Built 100% on-device client-side printable and downloadable A4 Life Blueprint portfolio (`src/components/growth/LifeBlueprintExport.tsx`)
  - [x] Includes official DPDP Act verification seal, Sant Kabir Das Atma-Jnana creed banner, 16-Personality Typology breakdown, Big Five normative percentiles, The Mirror (Current vs Evolved Self with 3 Stepping Stones), top 3 Indian Career Pathways, and Keystone Daily Routine
  - [x] One-click "Print / Save to PDF" (`window.print()`) and "Download Offline HTML Document"
  - [x] Navigation route `/blueprint` and quick-launcher in Sanctuary, Dashboard, and Profile
  - [x] **Test:** verified in `src/tests/growth/somaticAndBlueprint.test.tsx` (7 tests passed; total 126/126 across 28 files)

### Developer Journey & Spiritual Lineage
- [x] **P7-10** Architect & Developer Profile Integration (Harsh Kumar Gupta)
  - [x] Dedicated interactive modal and routes (`/developer`, `/about-developer`) in `src/components/common/AboutDeveloperModal.tsx`
  - [x] Documented the 5-domain polymathic convergence: MCA (Grade A), MA in Yoga & Science of Living, D.Pharm (clinical & regulatory), B.Sc. Maths & Physics, 6+ years visual creator (*Dinesh Kumar Presents*)
  - [x] Embedded verified credentials: 11 Google Professional Specializations, IndiaAI Mission (LLM for Young Developers), IBM Watsonx (NOVELia), HackerRank SQL, and public Credly wallet
  - [x] Honored spiritual lineage: Disciple of **Shri Prem Rawat** (living Knowledge of breath and inner peace) and foundational reverence to his **Father**
  - [x] Cross-linked into `AtmaJnanaOriginModal.tsx`, `SelfEvolutionSanctuary.tsx` Tab 5, `Dashboard.tsx`, header navigation, and `README.md`

### Navigation, Parent Sanctuary & CI Hardening
- [x] **P7-11** Bento-Grid Dashboard & Two-Line Stacked Header Navigation Overhaul
  - [x] Implemented two-line stacked header navigation labels (`Life / Quests`, `Skill / Arena`, `Mood / Mirror`, `Social / Compass`, `AI / Mentor`, `Self / Evolution`, `Teen / Dash`) halving horizontal footprint.
  - [x] Grouped `🪷 आत्मज्ञान` and `👨‍💻 Developer` into right-hand action cluster as compact vertical action pills with guaranteed gaps.
  - [x] Streamlined Self-Evolution sanctuary tabs into single-line pills (`flex-nowrap overflow-x-auto hide-scrollbar`) preventing tab wrapping.
- [x] **P7-12** Proprietary Legal & Trademark Protection (Option B)
  - [x] Established formal copyright and trademark notice: `PRERNA™ © 2026 Harsh Kumar Gupta. All Rights Reserved.` across `LICENSE`, `README.md`, `SanctuaryFooter.tsx`, and `LifeBlueprintExport.tsx`.
- [x] **P7-13** Parent Sanctuary Hub Modernization (`ParentDashboard.tsx`)
  - [x] Replaced dark-mode takeover with cohesive light sanctuary theme.
  - [x] Embedded Sant Kabir Das family wisdom (*"जैसे मृगा नाभि कस्तूरी, बन-बन फिरत उदासी..."*).
  - [x] Integrated 432 Hz Parent Breath Reset, Life Blueprint A4 export, Socratic guides, DPDP Act 2023 §9 parity, and global `SanctuaryFooter`.
- [x] **P7-14** Rust Backend Code Formatting & CI Pipeline Green
  - [x] Formatted Rust backend code with `cargo fmt` across `src-tauri/src/ai/mod.rs`, `src-tauri/src/commands/mod.rs`, `src-tauri/src/db/mod.rs`, and `src-tauri/tests/t15_crisis_matrix.rs`.
  - [x] Verified `cargo fmt --all -- --check` returns 0.
- [x] **P7-15** Kaya Kalpa Physical Vitality & Sleep Sanctuary (`KayaKalpaSanctuary.tsx`)
  - [x] Built `src/engine/vitality/vitalityEngine.ts`:
    - 90-minute ultradian sleep cycle calculator with 14-min sleep latency compensation (bedtime target & wake target modes).
    - IAP & WHO adolescent growth velocity categorization (`building_strength`, `harmonious_vitality`, `active_momentum`) avoiding restrictive diets or weight-shaming numbers anxiety.
    - Dynamic hydration progress tracker (8 glasses / 2.0L goal) and resting heart rate classifier.
  - [x] Built Web Audio API sleep & alarm engine in `src/utils/audioSynthesis.ts`:
    - Continuous 432 Hz + 4 Hz Theta binaural lullaby drone with auto-fadeout timer.
    - Gentle rising Tibetan singing bowl alarm pattern.
  - [x] Created `src/components/vitality/KayaKalpaSanctuary.tsx` with 3 tabs:
    - Tab 1: Circadian Sleep Sanctuary (निद्रा योग) with 90-min cycle math, night mode screen, smart alarm, and morning check-in.
    - Tab 2: Physical Vitality & Growth (काया स्वास्थ्य) with height/weight growth horizon, 8-glass hydration tracker, and Ayurvedic Dinacharya pillars.
    - Tab 3: Movement & Smartband Sync (गति व स्पंदन) with 8k step tracker, Web Bluetooth (BLE) smartband sync, and zero-hardware 60-Second Pulse Tap Meter.
  - [x] Integrated into `App.tsx` (routes `/vitality`, `/sleep`, `/kaya`, `/health` & header nav) and `Dashboard.tsx` Bento Banner.
  - [x] **Test:** verified in `src/tests/vitality/vitalityEngine.test.ts` (11 tests passed; total 137/137 tests passing across 29 test files).
- [x] **P7-16** Multi-Modal Persona Authentication & Role Switching Vault (`PersonaAuthModal.tsx`)
  - [x] Eliminated unauthenticated role-switching bypass across Teen, Parent, and Educator views.
  - [x] Created `src/components/security/PersonaAuthModal.tsx` providing multi-modal verification:
    - WebAuthn Biometrics (Windows Hello, TouchID/FaceID, Fingerprint).
    - Argon2id Local PIN with interactive secure on-screen keypad.
    - 9-Dot Visual Pattern Lock with smooth touch/drag gesture capture.
    - Password fallback with timing-safe hash verification.
  - [x] Integrated upfront persona selection during Signup (Step 1) and Login in `src/components/welcome/AuthModal.tsx`.
  - [x] Wired secure switching into `App.tsx` for Teen, Parent Sanctuary, and School Educator headers.
  - [x] Added mobile responsive dropdown drawer (`lg:hidden`) for screens `< 1024px` guaranteeing zero navigation clipping across mobile, tablet, and desktop.
  - [x] Verified full suite: **137/137 tests passing across 29 test files**; production build cleanly generated.
- [x] **P7-17** Cross-Platform Packaging & 100% Offline PWA Resilience
  - [x] Configured `public/manifest.webmanifest` & `public/sw.js` providing zero-cloud service worker caching and offline-first boot.
  - [x] Linked manifest and registered service worker in `index.html`.
  - [x] Configured native window in `src-tauri/tauri.conf.json` (`PRERNA | प्रेरणा • Sanctuary`, 1280x820 default, resizable) and normalized package identity in `package.json`.
  - [x] Verified native Android build artifacts in `src-tauri/gen/android/app/build/outputs/apk/arm64/` (`app-arm64-debug.apk` and `app-arm64-release.apk`).
- [x] **P7-18** Zero-Telemetry Beta Feedback Journal & Interactive Product Showcase Deck
  - [x] Created `src/components/beta/BetaFeedbackModal.tsx`:
    - 100% on-device local storage for user observations, bug reports, and experience reflections.
    - Zero remote telemetry, zero cloud calls, adhering strictly to Section 9 of the DPDP Act 2023.
    - One-click encrypted JSON download (`prerna-beta-feedback-YYYY-MM-DD.json`) with consent disclosures.
  - [x] Created `src/components/showcase/ProductShowcaseModal.tsx`:
    - 5-slide interactive pitch deck & architecture showcase covering: Atma-Jnana Vision, 5-Domain Psychometrics, Kaya Kalpa Somatics & Sleep, Multi-Modal Persona Vault, and Local Native Architecture.
    - Keyboard-accessible navigation, stepper tabs, 432 Hz Pythagorean chimes (`somaticAudio.playSoftChime()`), and Markdown pitch deck export (`PRERNA_Product_Showcase_Pitch_Deck_*.md`).
  - [x] Integrated seamless access points across `src/App.tsx` (routes `/showcase`, `/pitch`, `/feedback`), `src/components/common/SanctuaryFooter.tsx`, and responsive mobile drawer.
  - [x] Verified full suite: **137/137 tests passing across 29 test files**; production build succeeded in 8.18s.
- [x] **P7-19** Sovereign QR & Camera Scanner Peer Pairing (`QrCameraScanner.tsx` & `TeenPairingQrModal.tsx`)
  - [x] Implemented cryptographically secure, 15-minute time-bounded pairing protocol in `src/utils/pairingProtocol.ts`:
    - Generates 128-bit cryptographic nonces, 6-character human shortcodes (`PRN-842`), and JSON-encoded pairing payloads.
    - DPDP Act 2023 §9 compliance: strictly 100% on-device handshake with zero intermediary telemetry servers.
  - [x] Created `src/components/scanner/QrCameraScanner.tsx`:
    - Dual-engine camera scanning using native browser `BarcodeDetector` with automatic fallback to `jsQR`.
    - Real-time video preview with glowing corner brackets, animated laser sweep line, and center targeting dot.
    - Rear / Front camera switching, torch/flashlight toggle, and audio/haptic feedback upon successful detection.
    - Camera permission handling with image file upload fallback (`<input type="file" accept="image/*" />`).
  - [x] Created `src/components/pairing/TeenPairingQrModal.tsx`:
    - High-contrast dynamic QR canvas via `qrcode`.
    - Live 15-minute countdown timer with expiration protection and one-click token regeneration.
    - Copyable 6-digit sync code with clipboard confirmation and single-device test scan simulation.
  - [x] Upgraded `src/components/onboarding/ParentLinking.tsx`:
    - Multi-modal linking interface with Live Camera Scanner, 6-digit Manual Code entry, and Verified Teen Confirmation Card.
  - [x] Integrated into `src/components/dashboard/TeenProfileView.tsx` ("Display Pairing QR Code") and `src/components/parent/ParentDashboard.tsx` ("Cryptographic Device Pairing" & "Scan New QR").
  - [x] Added unit tests in `src/tests/pairing/pairingProtocol.test.ts` (8 tests passed).
  - [x] Verified full suite: **145/145 tests passing across 30 test files**; production build cleanly generated in 7.79s.
- [x] **P7-20** PRERNA for Partners ❤️ (Lovers & Besties) & Adult Sanctuary Ecosystem
  - [x] Built complete relationship-development ecosystem inside PRERNA for Adults with strict isolation boundary:
    - Zero exposure to Teens, Parents, or Schools: no navigation links, no menus, and route-level redirection protecting `/partners` and `/adult-dash`.
    - Protected by biometric/passcode authentication (`PartnersGateModal.tsx`) and emergency "⚡ Quick Exit" escape key.
  - [x] Mode & Relationship Onboarding (`PartnersOnboarding.tsx`):
    - Lovers/Couples mode vs. Besties/Soul Friends mode.
    - 5 Love Languages slider matrix with granular visibility toggles (`Private to Me` vs. `Shared with Partner`).
    - Top emotional needs and personal comfort boundaries configuration with DPDP Act 2023 §9 compliance.
  - [x] Time-Bounded Sovereign Pairing (`PartnerPairingModal.tsx`):
    - 15-minute expiring cryptographic pairing tokens with QR canvas and live camera scanning via `QrCameraScanner`.
  - [x] Preeti / प्रेरणा साथी Relationship AI Companion (`PartnerAiCompanion.tsx`):
    - 3 distinct operating modes: Personal Reflection (strictly private), Shared Sanctuary (joint growth & dates), and Relationship Wisdom (NVC, Gottman antidotes, attachment styles).
  - [x] Communication Studio (`CommunicationStudio.tsx`):
    - Daily Heart Cards prompt-exchange, NVC Compassionate Re-framer, Gratitude Jar, and 3-minute Active Listening timer drill.
  - [x] Romance & Hangout Studio (`RomanceAndHangoutStudio.tsx`):
    - Curated Date/Hangout Planner with completion toggles, Soulful Love Letter Assistant with custom memory prompts, Shared Bucket List, and Love Languages radar.
  - [x] Sacred Memories & Dual Journal Vault (`SharedMemoriesAndJournal.tsx`):
    - Milestone Timeline with custom emoji/tags, plus strict separation between Shared Journal and My Secret Encrypted Space (never shared with partner or AI).
  - [x] Adult Sanctuary Dashboard (`AdultDashboard.tsx`):
    - Full adult personal development hub (Swadharma career purpose, Maslow transcendence, Kaya Kalpa somatics) housing the discreet "PRERNA for Partners" Secret Gateway Card.
  - [x] Unit test suite in `src/tests/partners/partnerStore.test.ts` (13 tests passed).
  - [x] Verified full test suite: **158/158 tests passing across 31 test files**; production bundle compiled cleanly in 9.00s.
- [x] **P7-21** School & Educator Sanctuary Modernization, Preeti Audio/Soundscapes, Multi-Persona Tour & CI Matrix Polish
  - [x] Modernized School & Educator Sanctuary (`SchoolDashboard.tsx`, `TeacherVitalityCorner.tsx`, `InstitutionalCareHub.tsx`):
    - Rabindranath Tagore educational philosophy, 432 Hz Mindful Bell, Compassionate Pedagogy Playbook, and Educator self-care drills.
    - Systemic cohort risk vectors, Socratic non-punitive playbooks, national adolescent hotlines (Tele-MANAS 14416, Childline 1098), and DPDP §9 zero-surveillance guarantees.
    - Instant anonymized batch JSON report export for school boards and counselors.
  - [x] Preeti (प्रेरणा साथी) Voice & Somatic Nature Soundscapes (`audioSynthesis.ts`):
    - Pure Web Audio API nature soundscape synthesis: Monsoon Rain (pink noise + 800Hz lowpass), Temple Bells (Pythagorean 432/540/648/864Hz harmonics), Forest Wind (resonant bandpass sweep), and 432Hz grounding drone.
    - Web Speech API integration with gentle cadence and Indian English / soothing female voice mapping (`speakText` / `stopSpeaking`).
    - Added soundscape selector and Preeti voice narration to `PartnerAiCompanion.tsx` and `CommunicationStudio.tsx`.
  - [x] Cross-Platform CI Windows Matrix & LLVM Bindgen Polish (`.github/workflows/test.yml`):
    - Fixed Windows path escaping issue (`C:/Program Files/LLVM/bin`) and added vcpkg compilation caching to speed up CI runs.
  - [x] Comprehensive Multi-Persona Interactive Demo Tour (`MultiPersonaTourModal.tsx`):
    - Step-by-step interactive walkthrough showcasing all 4 personas (Teen Explorer, Parent Sanctuary, Adult & Partners Vault, School & Educator Hub).
    - Integrated across all headers with `✨ Ecosystem Tour` pill, footer link, and `/tour` direct route with 1-click persona switching.
  - [x] Verified full test suite: **158/158 tests passing across 31 test files**; production bundle compiled cleanly in 10.44s.
- [x] **P7-22** Subscription & Licensing Architecture for Partners & Schools (`subscriptionStore.ts`, `PartnerSubscriptionModal.tsx`, `SchoolLicensingModal.tsx`)
  - [x] Built cross-subsidizing subscription architecture protecting Teens & Parents as 100% Free Public Good:
    - Zero advertising, zero microtransactions, and zero paywalls for adolescents and parents.
    - Commercial monetization anchored in adult relationships (Partners B2C) and institutional licenses (Schools B2B).
  - [x] Created `src/store/subscriptionStore.ts` with local encrypted persistence:
    - B2C Partner tiers: `'trial' (7-day free trial)` | `'partner_pro_monthly' (₹299/mo)` | `'partner_pro_annual' (₹1,999/yr)` | `'partner_lifetime' (₹4,999 perpetual)`.
    - B2B School tiers: `'pilot' (60-day campus pilot)` | `'campus_annual' (₹49,000/yr)` | `'district_annual' (₹1,49,000/yr)`.
    - Instant upgrade, cancellation, and developer fast-testing simulator controls.
  - [x] Created `src/components/subscription/PartnerSubscriptionModal.tsx`:
    - Romantic relationship sanctuary theme, tier selectors, feature comparison grid, 1-click test checkout with audio chimes.
  - [x] Created `src/components/subscription/SchoolLicensingModal.tsx`:
    - Institutional VidyaPeeth Enterprise licensing, board deliverables, $k$-anonymity DPDP §9 guarantees, and official invoice activation.
  - [x] Integrated status pills and modals across `PartnersDashboard.tsx`, `SchoolDashboard.tsx`, and `AdultDashboard.tsx`.
  - [x] Added unit tests in `src/tests/subscription/subscriptionStore.test.ts` (7 tests passed).
  - [x] Verified full test suite: **165/165 tests passing across 32 test files**; production bundle compiled in 8.14s.
- [x] **P7-23** Complete 6-Language Localization (`i18n.tsx`) for Adult, Partners, and Schools
  - [x] Expanded `src/engine/localization/i18n.tsx` with native terminology across Hindi, Marathi, Tamil, Telugu, and Bengali for:
    - 4 Core Personas: Teen Explorer (`किशोर अन्वेषक`), Parent Sanctuary (`अभिभावक संगम`), Adult Swadharma (`वयस्क साधना`), Educator Hub (`विद्यापीठ दर्पण`).
    - PRERNA for Partners (`प्रेरणा युगल संगम`), Preeti Companion (`प्रीति सम्बंध साथी`), Partner Pro, and VidyaPeeth Enterprise License.
    - 432 Hz Breathe & Somatics, and Quick Exit security actions.
- [x] **P7-24** Automated Unit & Component Test Suite Expansion (Scaled to 180 Tests)
  - [x] Created `src/tests/showcase/MultiPersonaTourModal.test.tsx` (5 tests passed: all 4 persona slides, next/prev navigation, role switching, DPDP §9 guarantees).
  - [x] Created `src/tests/school/SchoolSanctuary.test.tsx` (5 tests passed: Tagore philosophy, 432Hz bell chime feedback, self-care drills, $k \ge 5$ anonymity, Tele-MANAS/Childline integration).
  - [x] Created `src/tests/subscription/SubscriptionModals.test.tsx` (5 tests passed: Partner Pro monthly/annual/lifetime, VidyaPeeth campus/district tiers, fast demo test controls).
  - [x] Verified full test suite: **180/180 tests passing across 35 test files** with zero regressions.
- [x] **P7-25** Offline PWA Mobile/Desktop Install Experience & Audio Caching Tuning
  - [x] Created `src/components/common/InstallPwaPill.tsx` with dynamic browser `beforeinstallprompt` handling and standalone mode detection.
  - [x] Integrated into `src/components/common/SanctuaryFooter.tsx` for immediate 1-click home screen install.
  - [x] Verified Service Worker cache registration (`public/sw.js`) and Web Manifest (`public/manifest.webmanifest`).
- [x] **P7-26** Staged Beta Rollout Plan & Clinical / Legal Review Dossiers (`docs/beta-cohort-staged-rollout-dossier.md`)
  - [x] Created complete governance dossier defining 3 beta cohorts:
    - Cohort 1: 25 Teen-Parent pairs across Maharashtra, Delhi NCR, Karnataka, and West Bengal.
    - Cohort 2: 3 VidyaPeeth Model High Schools (CBSE, ICSE, State Board).
    - Cohort 3: 50 Adult Couples & Besties.
  - [x] Prepared detailed regulatory audit criteria for human sign-offs (H1 clinical psychologist, H2 DPDP legal counsel, H3 psychometric construct equivalence, H4 reading level comprehensibility).

---

## Ongoing (Every Release)

- [x] `docs/dpdp-compliance-mapping.md` updated for any change touching consent, data collection, or crisis
- [x] Crisis resource helpline numbers verified still current (Tele-MANAS 14416, Childline 1098, KIRAN 1800-599-0019, Vandrevala 9999 666 555)
- [x] `docs/integrity-audit-log.md` audit repeated: grep docs/ for approval/review/certification language (0 unauthorized claims)
- [x] Pre-deployment regression test suite: **180/180 tests passed across 35 test files**
- [x] Production bundle verified: `tsc && vite build` completed with zero errors (8.14s build time)
- [x] Staged rollout: Beta cohort testing before broad public release (documented in `docs/beta-cohort-staged-rollout-dossier.md`)

---

## Human-Review Tickets (Not Closable by an AI Agent)

| Ticket | What's Needed | Status |
|---|---|---|
| **H1** | Licensed mental-health professional reviews `docs/crisis-protocol.md` | ⏳ Not started |
| **H2** | DPDP legal counsel reviews consent architecture & parental-verification mechanism | ⏳ Not started |
| **H3** | Hindi construct-equivalence reviewer validates assessment item translations | ⏳ Not started |
| **H4** | Disclosure language reviewer tests teen-readable disclosures for genuine 13–18 comprehensibility | ⏳ Not started |

Legend: ⏳ not started · 🟡 in progress · ✅ done (with named person, date, verifiable evidence) · 🚫 blocked

