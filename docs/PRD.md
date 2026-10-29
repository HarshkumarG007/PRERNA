# PRD — Product Requirements Document
## PRERNA: Personalized Real-time Engagement & Neural Resource Assistant
### A Transparent, Consent-First Self-Discovery Platform for Indian Adolescents

**Version:** 1.0  
**Status:** Living Document  
**Last Updated:** 2026-10-29  
**Owner:** PRERNA Core Team

---

## 0. Core Principle

> **Never skip: IDEA → RESEARCH → DEFINE → PRD → ARCHITECTURE → DESIGN → RULES → TASKS → SETUP → DEV → TEST → SECURITY → REVIEW → DEPLOY → MONITOR → ITERATE**

This PRD is the definitive statement of *what* we are building and *why*. The Architecture doc defines *how*. Code follows both.

---

## 1. Problem Statement

Indian adolescents face a compounded guidance crisis:

| Problem | Scale |
|---|---|
| School counselor ratio | 1:1500 (national average) |
| Career guidance scope | Almost exclusively "doctor or engineer" |
| Mental health stigma | Teens actively avoid formal help |
| Data privacy for minors | DPDP Act 2023, Section 9(3) prohibits stealth behavioral profiling of under-18s |

Existing solutions (Character.AI, Calm, career-guidance apps) either operate in stealth (illegal under DPDP for minors), are not culturally grounded for India, require cloud data storage, or are clinical in tone — defeating adoption with the exact population that needs them most.

---

## 2. Vision

PRERNA is a **local-first, gamified self-discovery companion** for Indian teens that transparently helps them understand their cognitive style, emotional patterns, interests, and values — through genuinely fun daily activities — building a holistic life-guidance profile the user always knows about and controls.

**Core Design Commitment:** You don't need to hide the assessment to make it feel unlike a test. Duolingo doesn't hide that it's teaching you a language. PRERNA tells a teen *"these activities help you understand your own decision-making"* and is still genuinely fun, still feels like a game, and still generates rich self-discovery data — honestly.

---

## 3. Target Audience

### Primary: Indian Adolescents (Ages 13–17)
- Under India's DPDP Act 2023, legally classified as minors requiring verifiable parental consent before any data processing
- Facing career and mental-health guidance gaps
- Comfortable with gamified interfaces (Clash of Clans, BGMI, Ludo King — the reference frame, not the mechanics)
- Skeptical of "assessment" framing; respond to game/story framing

### Secondary: Young Adults (Ages 18–22)
- Legally adults under DPDP — more personalization latitude
- Transitioning to higher education / early career decisions
- Can use the product without a parental consent flow

### Tertiary: Parents / Guardians
- Co-participants in the consent architecture, not surveillance actors
- Deserve visibility into what PRERNA shows their child — but that visibility is designed *with* the teen, not behind them

### Institutional: Schools (B2B Channel)
- Access to aggregated, k-anonymized class-level insights (k ≥ 5, per `school_api.rs`)
- Never access individual student mental-health profiles

---

## 4. Elevator Pitch

PRERNA is a local-first, gamified self-discovery companion for Indian teens that transparently helps them understand their cognitive style, emotional patterns, interests, and values through genuinely fun daily activities — building a holistic life-guidance profile the user always knows about and controls, with verifiable parental consent and zero behavioral profiling for under-18 users per India's DPDP Act, and a real human-backed crisis-support pathway instead of silent algorithmic surveillance.

---

## 5. Key Differentiators

| Differentiator | Why It's Defensible |
|---|---|
| Transparent, consent-first design | Legally required for India (DPDP S.9); morally required full stop |
| Local-first architecture | Data never leaves the device by default; DPDP data minimization compliant |
| Age-tiered data governance | Hard-coded split at 18 — not a UI setting, an architectural guarantee |
| Human-backed crisis escalation | No algorithmic parent pipeline; real human review before any notification |
| Cultural grounding for India | Hindi + regional language support; Indian career pathway context |
| Holistic (not career-only) | Cognitive + emotional + social + physical self-discovery in one profile |

---

## 6. MVP Feature Set (Minimum Viable Product)

> MVP target: **Phases 1–3 of the development roadmap** (Weeks 1–14). Nothing beyond Phase 3 is in scope for MVP.

### 6.1 Consent & Age-Gating (P1 — Must Have)
- [ ] Age declaration screen (first launch, no bypass)
- [ ] Under-18: verifiable parental/guardian consent flow
  - Parent creates/links their own verified account
  - Plain-language disclosure (teen-readable AND parent-facing)
  - Consent recorded with timestamp + disclosure version
  - Teen account unlocked only after consent verified
- [ ] 18+ standard adult consent flow
- [ ] Consent Summary Viewer (accessible at any time from settings)
- [ ] Access audit log (every data read/write logged with attribution)

### 6.2 Transparent Assessment Engine (P1 — Must Have)
- [ ] Life Quests: interactive daily story-choices → decision-making style + values
- [ ] Skill Arena: puzzle/creative/social mini-games → cognitive strengths
- [ ] Disclosure shown before each activity type (shown once per account, re-accessible from settings)
- [ ] Big Five (OCEAN) trait scoring
- [ ] RIASEC career-interest scoring
- [ ] Trait snapshots stored locally, user-visible in their own activity history

### 6.3 AI Mentor (P1 — Must Have)
- [ ] Local LLM (Mistral 7B / Llama 3 8B, 4-bit quantized via llama.cpp)
- [ ] Chat interface clearly identified as AI at all times
- [ ] Context-aware responses using the user's own trait profile
- [ ] Any reference to user's history traceable to real stored data (no hallucinated references)
- [ ] Response time: < 2s on RTX 4060-class hardware

### 6.4 Career Pathway Matching (P1 — Must Have)
- [ ] Career recommendations from transparently-collected trait profile
- [ ] Indian-context career categories: startup / government / corporate / creative / academic
- [ ] Recommendations explainable: "This matches your RIASEC Investigative score because..."

### 6.5 Data Rights (P1 — Must Have)
- [ ] Full local data export (human-readable JSON)
- [ ] Full local data delete (verified: query for data after delete returns empty)
- [ ] Both accessible directly by the teen (not gated behind parent account)

---

## 7. Phase 2 Features (Post-MVP)

### 7.1 Mood Mirror & Social Compass (Phase 4 — High Stakes)
- [ ] Mood Mirror: daily visual mood check-in with transparent disclosure ("this tracks patterns in how you're feeling")
- [ ] Social Compass: friendship/social scenario activities → social style insights
- [ ] Both wired into crisis pattern detection (see 7.2)

### 7.2 Crisis Protocol (Phase 4 — Highest Stakes; Requires Clinical Input)
- [ ] Always-on resource surfacing (KIRAN helpline, Vandrevala, iCall) — NOT gated on detection
- [ ] Pattern detection → `crisis_events` row with `pending` status → NO autonomous action
- [ ] Human review queue (trained counselor partner reviews pending events)
- [ ] Guardian notification only after: (a) human review confirmed, AND (b) teen has been informed
- [ ] `docs/crisis-protocol.md` authored with licensed mental-health professional before this phase ships

### 7.3 Parent Dashboard (Phase 5)
- [ ] Teen-visible mirror: teen sees exactly what parent dashboard shows
- [ ] Ongoing visibility settings: teen has meaningful input into detail level shared
- [ ] Framing: "here's what your teen is discovering about themselves, together with them" — not a monitoring console

### 7.4 Localisation (Phase 5)
- [ ] Hindi full localisation (all UI + disclosures + crisis content)
- [ ] One additional regional language (TBD)
- [ ] Translated disclosures reviewed to same standard as English originals

---

## 8. Non-Goals (Explicit — Not in PRERNA)

| What We Will NOT Build | Why |
|---|---|
| Stealth/hidden behavioral profiling | DPDP Section 9(3) violation; ethical dead end |
| Silent algorithmic parent notification pipeline | Endangers teens in unsafe households |
| Cloud database / server-side data storage | Violates local-first architecture; DPDP data minimization |
| Targeted advertising of any kind | Prohibited for under-18 users (DPDP); misaligned with product values |
| Public leaderboards or shareable "scores" | Peer pressure / comparison is antithetical to self-discovery |
| Social network features | Out of scope; increases compliance surface area significantly |
| Perfect age verification | Acknowledged as unsolvable; we use good-faith documented verification |

---

## 9. Success Metrics

### Product Health (MVP)
| Metric | Target | Why |
|---|---|---|
| Day-30 retention | ≥ 40% | Core indicator of habit formation |
| Consent completion rate | ≥ 70% of under-18 signups | Drop-off signals friction or trust issues in consent flow |
| Session engagement | ≥ 3 activities/week average | Enough signal for meaningful trait snapshots |
| AI response time | < 2s (p95) | Core UX bar on target hardware |

### Safety (Phase 4+)
| Metric | How Tracked |
|---|---|
| Crisis resource visibility | % of users who can locate resources without prompting |
| Human review turnaround | Time from `pending` → reviewed decision (SLA in crisis-protocol.md) |
| False positive rate | Reviewed events resulting in `reviewed_no_action` (tracked as ongoing safety audit) |
| Guardian notification accuracy | All notified cases had real human review — verifiable in `crisis_events` table |

### Trust (All Phases)
| Metric | How Tracked |
|---|---|
| Parental trust score | Self-reported (NPS-style) at 30 and 90 days |
| Teen-reported sense of control | "I understand what PRERNA collects and why" — surveyed at onboarding + 30 days |

---

## 10. Monetisation

| Tier | Price | Features |
|---|---|---|
| Free | ₹0 | Core activities (Life Quests, Skill Arena), basic AI Mentor, trait snapshot |
| Plus | ₹199/month | Full activity suite, Mood Mirror, Social Compass, Body Clock, detailed career pathways |
| Premium | ₹499/month | All Plus features + priority human review queue, extended history, parent dashboard |
| School B2B | Custom | Aggregated k-anonymised class insights (k ≥ 5), counselor dashboard, no individual mental-health data |

---

## 11. Constraints & Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| DPDP regulatory review | High (new law, active enforcement) | Compliance-by-design; `dpdp-compliance-mapping.md` updated every release |
| Clinical review dependency (Phase 4) | High | Budget and timeline for real clinical collaborator; Phase 4 cannot ship without it |
| Age verification bypass (teen declares 18+) | Medium | Documented good-faith verification per arch doc S.8.1; acknowledged limitation, not hidden |
| LLM hallucinating user data references | Medium | Test suite explicitly verifies every profile reference is traceable to real stored data |
| Shared-device privacy (Indian household context) | High | Per-profile PIN/biometric lock; device access ≠ authorized access |
| Hindi translation quality | Medium | Construct-equivalence review by qualified Hindi linguist (H3 ticket) |

---

## 12. Open Questions (Requiring Human Decision)

> These are not tasks for an AI agent to resolve.

- [ ] **H1**: Which clinical psychologist/psychiatrist will review `crisis-protocol.md`? (Contact, date, engagement terms)
- [ ] **H2**: Which DPDP legal counsel will review the consent architecture and parental-verification mechanism?
- [ ] **H3**: Which Hindi construct-equivalence reviewer will validate assessment item translations?
- [ ] **H4**: Who will review teen-readable disclosures for genuine 13–18 comprehensibility?
- [ ] **Parental verification mechanism**: What specific identity signal (DigiLocker? OTP to a separate parent account? Other?) will be used for "verifiable" consent under DPDP Rules?
- [ ] **Crisis SLA**: What response-time commitment will be made to teens during the beta crisis-review process?

