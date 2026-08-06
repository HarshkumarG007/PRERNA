# PRERNA — Agent Implementation Plan v2
### Incorporating the Enterprise Architecture Review Board's Findings

This supersedes the prior implementation spec's remaining open items. It is sequenced exactly as the review recommended: **verification before feature work**, **external expert sign-off before the crisis/consent paths advance further**, and only then new features and enhancements. It's mapped to your actual repository structure (`src-tauri/src/`, `src/`, `docs/`).

---

## 0. Global Standards (carried forward, plus new rules from the review)

**0.1 — The four non-negotiable rules from the prior spec still apply, unchanged:**
1. No code path may set `behavioral_tracking` or `targeted_advertising` to anything but `FALSE` for an under-18 account.
2. No assessment activity may collect profile data without a disclosure shown and logged first.
3. No guardian-notification code path may execute without both a qualifying `human_review_status` AND a non-null `teen_informed_at` already present.
4. The teen-readable disclosure text and the crisis-protocol document are not to be authored or approved solely by an executing agent — human sign-off required, tracked visibly, never simulated or asserted without evidence.

**0.5 — New rule, directly from the review: claims require checkable evidence, not summaries.** Any ticket that claims a fix, an invariant, or a review is "done" must reference the specific commit, test name, or document section that proves it — and that reference must be independently checkable on `main` by someone who wasn't the one who wrote the code. A PR description that says "fixed X" without a pointer to the enforcing test/commit does not satisfy this rule. This rule exists because of a specific, real incident earlier in this project (a document falsely claiming clinical approval, and a later claim of a fix that wasn't actually on `main`) — it is not a hypothetical precaution.

**0.6 — New rule: no ticket in Phase 1 may be marked done by the same agent/session that performed the fix.** Phase 1 is a verification phase. If an AI coding agent makes a fix, a *separate* verification step (a different session, a human, or at minimum a fresh `git pull` + direct file inspection rather than trusting in-session memory of having made the edit) must confirm it landed before the ticket closes.

**Commit strategy:** Conventional Commits; branch `ticket/<id>-<slug>`; PR description includes the checkable evidence required by Rule 0.5.

**Definition of Done (all tickets):** code merged and confirmed on `main` by direct inspection (not memory of having pushed it); tests passing; `docs/dpdp-compliance-mapping.md` and/or `docs/disclosure-language-review.md` updated where relevant; for Phase 1 specifically, Rule 0.6's independent-verification step completed.

---

## Phase 1 — Verification (No New Features Until This Is Done)

### Ticket V1-1: Independently Verify `docs/crisis-protocol.md`
**Dependencies:** none
**Task:** Fetch the file fresh from `main` (not from local memory or a cached diff). Confirm: the `[REVIEWED & APPROVED]` banner is either genuinely replaced with `[DRAFT — PENDING CLINICAL REVIEW]` and a real provenance note, or is still false and must be fixed now. Confirm the hotline reference is a verified current Indian resource, not `988`.
**Acceptance criteria:** paste or link the actual current file content as evidence (Rule 0.5) — not a description of what it should say.
**This ticket blocks every other ticket in this document.**

### Ticket V1-2: Independently Verify the Crisis Invariant Test
**Dependencies:** V1-1
**Task:** Locate the actual test (likely in `src-tauri/src/` test modules or `src/tests/`) asserting that guardian notification cannot fire without `teen_informed_at` set. Run it. Confirm it fails when the invariant is violated (don't just confirm it passes in the current state — mutate the test input to violate the invariant and confirm the test then catches it, proving the test isn't vacuous).
**Acceptance criteria:** name the exact test file and function; show it both passing under correct conditions and failing when the invariant is deliberately violated.

### Ticket V1-3: Independently Verify Disclosure-Gating Enforcement
**Dependencies:** V1-1
**Task:** Locate the actual Rust command (likely `save_session` or equivalent in `commands.rs`/`commands/`) and confirm it rejects a session insert with a missing/empty `disclosure_version`. Test directly, not by reading the code and assuming it works.
**Acceptance criteria:** a direct test call with an empty disclosure reference, showing the rejection actually occurs.

### Ticket V1-4: Resolve the Rust Module Structure Collision
**Dependencies:** none (can run in parallel with V1-1 through V1-3)
**Task:** Reconcile `src-tauri/src/commands.rs` vs. `src-tauri/src/commands/ai.rs`, and `src-tauri/src/db.rs` vs. `src-tauri/src/db/mod.rs`, into one canonical layout — recommended: convert fully to the directory form (`commands/mod.rs`, `db/mod.rs`) with the top-level `.rs` files removed, since the directory form is already partially in use for `ai.rs`.
**Acceptance criteria:** the project builds cleanly with `cargo build`; no `#[path]` workarounds masking the ambiguity; a comment in `lib.rs` documents the module layout convention going forward so it doesn't drift again.

### Ticket V1-5: Reconcile the Dual Schema Definitions
**Dependencies:** V1-4
**Task:** Make `src-tauri/src/db/schema.rs` the canonical source. Either generate `src/db/schema.sql` from it (a small build script) or replace it with a clear header comment: `-- GENERATED REFERENCE — DO NOT HAND-EDIT, see src-tauri/src/db/schema.rs`.
**Acceptance criteria:** a deliberate mismatch introduced between the two (as a test) is either impossible (if generated) or immediately obvious (if manually flagged) — pick the generated approach if at all feasible, since manual discipline is the weaker mitigation.

### Ticket V1-6: Label the Simulated Consent Verification Explicitly
**Dependencies:** none
**Task:** Find every place the "simulated DigiLocker workflow" is referenced — code comments, UI copy, README, `docs/`. Add unambiguous `SIMULATED — NOT PRODUCTION READY` labeling to all of them, including a runtime UI banner if the app can currently be run in a state where this flow is reachable.
**Acceptance criteria:** grep for "digilocker" (case-insensitive) across the repo and confirm every hit is clearly labeled.

**Phase 1 exit gate:** all six tickets closed, each with Rule 0.5 evidence, each independently verified per Rule 0.6. Do not proceed to Phase 2 or any feature ticket until this gate is genuinely passed.

---

## Phase 2 — External Expert Engagement (Human Deliverables, Not Code)

### Ticket V2-1: Clinical Review Engagement
**Dependencies:** Phase 1 complete
**Task:** This is not a coding ticket. Identify and engage a licensed mental-health professional (LCSW/LPC/equivalent, ideally with adolescent/pediatric crisis experience) to review `docs/crisis-protocol.md` in full — the imminent-risk criteria, the SLA/turnaround expectations, the disclosed language. An executing coding agent's role here is limited to: preparing a clear technical brief of what the system needs from this review (what fields exist, what the detection logic currently checks, what decisions the review process needs to support) so the reviewer's time is used efficiently.
**Acceptance criteria:** a named reviewer, a dated review, and a revised document reflecting their actual input — not a self-generated document with their name attached after the fact.

### Ticket V2-2: DPDP Legal Review Engagement
**Dependencies:** Phase 1 complete
**Task:** Similarly, engage qualified legal counsel (DPDP/Indian data-protection experience) to review `docs/dpdp-compliance-mapping.md`, the consent architecture, and the (eventually real, not simulated) parental verification mechanism.
**Acceptance criteria:** documented legal sign-off or a list of required changes from actual counsel.

**No Phase 3 ticket touching the crisis path, the consent path, or any real-user-facing deployment proceeds without V2-1 and V2-2 complete.** Feature work unrelated to those two paths (see Phase 3's non-blocked items) may proceed in parallel.

---

## Phase 3 — Core Feature Completion & Architecture Improvements

### Ticket P3-1: Centralized `PolicyEngine` Module
**Dependencies:** V1-4, V1-5
**Task:** New Rust module (`src-tauri/src/policy/mod.rs`) centralizing every consent/disclosure/age-tier/crisis invariant check currently scattered across individual commands. Each command in `commands/` calls into this module rather than implementing its own checks inline.
**Acceptance criteria:** a security-focused code review can audit all safety invariants by reading one module; a test confirms at least one existing command (e.g., `save_session`) now delegates to `PolicyEngine` rather than duplicating logic.

### Ticket P3-2: `reviewer_credentials_ref` on Crisis Events
**Dependencies:** V2-1 (needs the real reviewer process to know what "credentials" should be recorded)
**Task:** Add the field to the `crisis_events` schema and `resolve_crisis_event`; a resolution cannot be recorded without a valid reference to a registered reviewer.
**Acceptance criteria:** a resolution attempt with a missing/invalid reviewer reference is rejected.

### Ticket P3-3: LLM Mentor Output-Side Safety Filter
**Dependencies:** none (can proceed independent of Phase 2)
**Task:** Extend `src-tauri/src/ai/safety.rs` (currently described as guarding execution) to also screen the model's **output** before it reaches the UI — checking for, at minimum: claims of being human, unsupported clinical/diagnostic language, and any response that itself should have triggered crisis detection but didn't (a safety-net check on the detection system itself).
**Acceptance criteria:** a fixture test where the model is prompted adversarially to claim it's human, or to give a diagnostic-sounding statement, and the filter catches it before display.

### Ticket P3-4: Transparent Assessment Activities — Completion Pass
**Dependencies:** V1-3
**Task:** Finish the remaining activities in `src/components/activities/` and `src/assessment/` (Life Quests scenarios, Skill Arena mini-games) with disclosures wired per the verified-working gate from V1-3.
**Acceptance criteria:** every activity type has a corresponding, human-reviewed disclosure (cross-reference `docs/disclosure-language-review.md`) shown before first use.

### Ticket P3-5: Career Pathway Classifier
**Dependencies:** P3-4 (needs real trait data to classify from)
**Task:** `src/ai/careerClassifier.ts` — complete the mapping from `fusionEngine.ts`'s unified profile to Indian-context career pathways.
**Acceptance criteria:** sensible, reviewed recommendations against a set of fixture profiles.

### Ticket P3-6: Code Signing for Release Builds
**Dependencies:** none
**Task:** Add code signing to `release.yml` for Windows/macOS/Linux artifacts.
**Acceptance criteria:** a built artifact passes OS-level signature verification (no "unknown publisher" warning).

---

## Phase 4 — Structured, Consented Beta

### Ticket P4-1: Real Parental Consent Verification (Replaces Simulation)
**Dependencies:** V2-2, V1-6
**Task:** Replace the simulated DigiLocker flow with a genuine verification mechanism, scoped per legal counsel's guidance from V2-2.
**Acceptance criteria:** legal sign-off on the specific mechanism chosen, not just "it works technically."

### Ticket P4-2: Beta Cohort Onboarding
**Dependencies:** P4-1, V2-1
**Task:** Beta-specific disclosure content (response-time expectations, how to reach the team directly), human-reviewed per Rule 0.1-4.
**Acceptance criteria:** reviewed disclosure content exists before any beta participant is onboarded.

### Ticket P4-3: Live-Fire Crisis Pathway Drill
**Dependencies:** V2-1, P3-2
**Task:** Before real beta users are onboarded, run an internal drill of the full crisis pathway end to end with synthetic data — detection → pending event → reviewer resolution → teen notification → guardian notification — timed against the SLA in the (now really reviewed) `docs/crisis-protocol.md`.
**Acceptance criteria:** the drill completes within the documented SLA and every step is logged correctly; documented as a repeatable runbook, not a one-off.

---

## Phase 5 — Governance & Launch Hardening

### Ticket P5-1: Grievance Redressal Mechanism
**Dependencies:** V2-2
**Task:** Implement and document an accessible complaint/redressal path per legal counsel's guidance.

### Ticket P5-2: Breach Notification Procedure
**Dependencies:** V2-2
**Task:** Document (and, where applicable, implement tooling for) a breach-response procedure — even though local-first storage minimizes this risk, a lost/stolen device scenario still needs a documented response.

### Ticket P5-3: Data Retention & Deletion Guarantee Audit
**Dependencies:** none
**Task:** Verify (with a direct test, not documentation review) that the existing delete functionality genuinely removes data rather than soft-flagging it, per the original spec's requirement.

---

## Future Enhancements (Backlog — Not on the Critical Path)

These are worth tracking but should not be started until Phases 1–2 are genuinely closed. Listed roughly in order of value-to-effort, not commitment:

1. **Regional language expansion beyond Hindi** — Tamil, Telugu, Marathi, Bengali, per the original vision. Each requires its own disclosure-content human review (Rule 0.1-4 applies per-language, not just once).
2. **Coping Skills module depth** — the crisis protocol already references nudging teens toward a "Coping Skills module" on `reviewed_resources_only` outcomes; this module doesn't yet appear to exist as a first-class feature and is a natural, safety-positive addition — build it with the same clinical-review rigor as the crisis protocol itself, since it's the thing most teens flagged at sub-clinical severity will actually interact with.
3. **Counselor/professional marketplace integration** — connecting a teen (with consent) to a real professional beyond the crisis pathway, for non-emergency ongoing support — a natural extension of the "trusted adult connector" concept from the original redesign, scoped as its own consent-gated feature.
4. **Voice journaling** (Whisper-based, local) — mentioned as a future item in the original architecture; genuinely additive once text-based Mood Mirror/AI Mentor are solid, since voice data has its own storage/consent implications worth designing deliberately rather than bolting on.
5. **Adaptive activity difficulty/pacing** — using the rolling-average trait data already being computed to keep Skill Arena mini-games appropriately challenging over time, improving both engagement and signal quality.
6. **School counselor dashboard (beyond the K-anonymity aggregate report)** — a richer, still-privacy-preserving view for school partnerships; needs its own threat-modeling pass given the k-anonymity-bypass-via-overlapping-queries risk flagged in the earlier build guide.
7. **Family conversation guides** — structured prompts helping a parent start a conversation based on the `ParentSafeProfile` view's conversation-starter suggestions, deepening the "discover together" framing from the original redesign.
8. **Cross-device encrypted sync (opt-in)** — the original architecture flagged this as future scope; if pursued, needs its own full threat-model and legal review pass (cross-device sync reopens questions the local-first design currently avoids entirely) — treat as a new Phase 2-equivalent gate, not an incremental feature.
9. **Explainability view for the teen** — a "why did PRERNA suggest this" panel showing which activities/traits fed into a given recommendation, extending the transparency principle from assessment into the recommendation layer itself.
10. **Differential-privacy-preserving aggregate analytics for product improvement** — if you ever want to know "which activities are most engaging" in aggregate without any individual-level telemetry, this is the correct mechanism rather than ad hoc analytics — genuinely worth doing right (real DP guarantees) or not doing at all, given the trust stakes.

---

## Notes for the Executing Agent

- **Phase 1 is not busywork.** Its entire purpose is to convert claims into verified facts before anything else is built on top of them. Resist any urge to skip ahead to Phase 3's more interesting feature work.
- **Rule 0.5 (checkable evidence) applies to this document's own tickets too.** When reporting progress against this plan, cite the specific commit/test/file, not a summary of what was done.
- **If Phase 2's external reviewers are not yet engaged, Phase 3 tickets P3-1, P3-3, P3-4, P3-5, and P3-6 may still proceed** (they don't touch the crisis or consent paths) — but P3-2, and all of Phase 4, remain blocked until real clinical and legal sign-off exist. Don't let the availability of "non-blocked" work become a reason to deprioritize actually engaging V2-1 and V2-2.
