# PRERNA — Enterprise Architecture Review Board Assessment

## 0. Scope, Method, and Epistemic Honesty

This review is conducted against: the folder structure you shared, the README/context documents from earlier in this project, the actual raw content of `docs/crisis-protocol.md` (independently fetched from `main`), and `package.json`. It is **not** conducted against a full read of the Rust/TypeScript source — several assessments below are inferences from module names and prior descriptions, and are explicitly marked as such. Per the review framework's own instruction to "highlight uncertainties instead of inventing answers," this board will not claim to have verified code it hasn't seen.

**One fact this review treats as load-bearing:** as of the last direct fetch, `docs/crisis-protocol.md` on `main` still contained the fabricated `[REVIEWED & APPROVED]` banner and the `988` (US) hotline reference, despite a summary claiming both were fixed. This is not resolved as of this review. Everything below assumes this is still open unless you've since confirmed otherwise.

---

## Executive Summary

**Overall assessment:** The architectural *design* — local-first Tauri/Rust, SQLCipher at rest, disclosure-gated sessions, human-review-gated crisis escalation, K-anonymity for school aggregates, a teen-visible parent permissions firewall — is genuinely sound and, where it's been actually implemented as described, ahead of what most solo-built projects in this space attempt. The gap between this project and a defensible v1 is not architectural ambition; it's **verification**. Several claimed fixes and safety properties have not been independently confirmed, and one (the crisis-protocol document) has been directly checked and found not yet corrected.

**Major strengths:**
- Local-first, zero-cloud-dependency architecture is the right foundation for this problem, both technically and for DPDP alignment.
- The consent/disclosure-gating and crisis-escalation *designs* (as documented) correctly separate detection from action and require human judgment before any consequential real-world step.
- K-anonymity guard on the school API and the parent-permissions firewall (raw profile vs. `ParentSafeProfile`) show real privacy-engineering maturity for a project at this stage.
- CI coverage (lint, test, security scan, cross-platform release) is more mature than most solo projects reach this early.

**Critical weaknesses:**
- No independently verified confirmation that the crisis-protocol document's fabricated approval claim has been corrected on `main`.
- No independently verified confirmation that the Rust-level invariants (disclosure-gated session creation, `teen_informed_at`-gated guardian notification) are actually implemented and tested, versus described.
- Parental consent verification is explicitly "simulated" (per earlier README language) — this is fine for development, dangerous if it reaches real users before being replaced with genuine verification.
- No qualified legal review of DPDP compliance claims has occurred; no qualified clinical review of crisis-detection criteria has occurred. Both are self-assessed at present.
- Two structural code-organization issues (detailed below) suggest either an inconsistent module layout or duplicated/competing implementations that need reconciling.

**Recommendation: Conditional Go.** The architecture is worth continuing to build on. It is **not** ready for any real user's data — including a "just me testing it" scenario with your own or a family member's real information — until the Phase 1 verification items below are independently confirmed, not just claimed.

---

## Detailed Technical Review

### Architecture Review
The layering (React/Zustand frontend → Tauri IPC → Rust command handlers → SQLCipher-encrypted SQLite) is clean and appropriate for a local-first desktop app. Two structural concerns from the folder listing:

1. **Module collision risk:** the tree shows both `src-tauri/src/commands.rs` *and* `src-tauri/src/commands/ai.rs`, and both `src-tauri/src/db.rs` *and* `src-tauri/src/db/mod.rs`. In Rust's default module resolution, having both `foo.rs` and a `foo/` directory for the same module name is either a conflict the compiler will reject, or requires explicit `#[path]` attributes to disambiguate — which is itself a maintainability smell if not clearly commented. This needs reconciling into one canonical layout (most likely: everything under `commands/` and `db/` as directories with `mod.rs`, with the top-level `.rs` files removed) before this causes a confusing build or a merge conflict that hides a real bug.

2. **Dual schema source of truth:** `src-tauri/src/db/schema.rs` (Rust) and `src/db/schema.sql` (frontend reference) both appear to define the database schema. Two hand-maintained copies of a schema drift eventually — recommend one canonical source (Rust, since it's the actual enforcement point) with the frontend copy generated/exported from it, not independently authored.

### AI Review
The mentor is a single local LLM with a `safety.rs` guardrail described as running "before LLM execution" — worth confirming this also screens **output**, not just input/context, since a well-intentioned prompt can still produce a poor response. No evaluation harness or explainability layer is evident yet. Recommend a small, fixed test-conversation suite (including adversarial prompts like "are you a real person" and crisis-adjacent language) run in CI against every model/prompt change, not just ad hoc manual testing.

### Security Review
SQLCipher-at-rest is the right call. The one detail worth scrutinizing directly in the actual Rust code (not inferable from structure alone): how `user_derived_key` is actually derived and stored — if it's anything less than OS-keychain-backed derivation, the encryption is weaker than it appears. `security.yml` running `cargo audit`/`npm audit` weekly is good practice and should be treated as a blocking CI gate, not just a report.

### Privacy Review
The consent/disclosure architecture, as designed, is strong. The open question is entirely about verification (Phase 1 below), not design.

### UX / HCI Review
Cannot be meaningfully assessed without seeing the actual components or, ideally, watching someone in the target age range use them. This board's strong recommendation: budget real moderated usability testing with teens (and separately with parents) on the disclosure language and consent flow specifically — comprehension by a 13-year-old is an empirical question, not something to infer from the text reading well to an adult.

### Data Model / Database Review
The schema additions from the prior redesign (`crisis_events`, `parent_consents`, `disclosure_version`/`disclosure_shown_at` on sessions) are appropriate. Recommend adding a `reviewer_credentials_ref` field to whatever table records crisis-event human review, so the system can structurally enforce (not just document) that only a qualified reviewer's decision can move an event out of `pending`.

### API / IPC Review
Recommend every Tauri command that touches consent, disclosure, or crisis data have its input validated via `serde` deserialization *plus* an explicit business-rule check (per the earlier `save_session`/`resolve_crisis_event` examples) — the pattern is right; it needs to be applied consistently across every command in `commands/`, not just the two that were the focus of the last fix pass.

### Local AI / Agent Architecture Review
This is correctly **not** a multi-agent system for the crisis path — detection is rule-based, escalation requires human judgment, and the LLM mentor is a separate, lower-stakes conversational component. This board endorses keeping it this way: an LLM making autonomous judgment calls about crisis severity would be a regression, not an improvement, even though "multi-agent" sounds more sophisticated. Resist any future pressure to make the crisis path "smarter" via LLM autonomy.

### Testing Strategy Review
CI presence (lint/test/security/release) is good. The specific test this board considers non-negotiable — a direct test asserting the guardian-notification function fails when `teen_informed_at` is `None`, regardless of `decision` value — needs to be independently confirmed to exist and pass, not inferred from the workflow file's existence.

### Deployment & Monitoring Review
Cross-platform builds via `release.yml` are good. Recommend code-signing for all three platforms before any public release (unsigned binaries trigger OS security warnings that will erode user trust in exactly the population — parents evaluating a child-safety-adjacent app — least likely to click through them). For monitoring: given the local-first privacy commitment, recommend *only* opt-in crash reporting with no behavioral telemetry, consistent with the DPDP posture already established.

---

## Legal & Governance Review

**This board does not and cannot state that PRERNA is DPDP-compliant.** That determination requires qualified legal counsel, not an AI review. What this board can say: `docs/dpdp-compliance-mapping.md` existing as a living document is the right instinct, and several concrete implementation choices (local-first storage, disclosure gating, verifiable-consent architecture) are the kinds of things a compliance mapping should point to. Specific governance gaps worth addressing before any real deployment:

- **Grievance Officer / grievance redressal mechanism:** DPDP-adjacent obligations typically expect an accessible complaint/redressal path for data principals — not evident in the current structure.
- **Breach notification procedure:** no documented process for what happens if the local encryption is ever compromised (e.g., a stolen device) or if a future sync feature introduces new exposure — worth a documented policy even before it's operationally needed.
- **Data retention policy:** how long is data kept after account deletion is requested, and is "delete" genuinely irreversible (per the earlier fix guide's note about soft-delete vs. real delete)?
- **Simulated verification labeling:** anywhere the "simulated DigiLocker workflow" is referenced (code, docs, demo materials) needs unambiguous labeling as non-production, so it's never mistaken for real verification by a future contributor, a reviewer, or a regulator.

---

## Clinical & Behavioural Review

**This board does not make clinical claims and defers to qualified professionals on all specifics.** What can be said from a design-review standpoint:

- The crisis-detection criteria described (e.g., a "14 consecutive days of lowest valence score" proxy compared to "PHQ-9 equivalent") should be presented internally and to users as a **risk-flagging heuristic**, not a validated clinical instrument — using clinical-sounding terminology for an unvalidated proxy risks overstating its reliability, to both the team and, eventually, users or regulators.
- Passive-vs-active ideation as a severity distinction is a reasonable direction but needs an actual clinician's calibration, not an engineering team's best guess at where the line sits.
- Big Five/RIASEC-style trait scoring from mini-game telemetry across a 13–22 age *range* should account for real developmental differences — a 13-year-old's and a 21-year-old's cognitive/identity development are not the same, and a single scoring model risks misinterpreting an age-appropriate developmental stage as a stable trait.
- Single-session performance on any one mini-game (e.g., reaction time) should never be treated as a stable trait without repeated-measures validation over time — the rolling-average approach mentioned earlier is the right instinct; make sure the UI never presents an early, low-confidence snapshot with the same visual weight as a mature one.

---

## Architecture Improvements (Concrete)

1. Resolve the `commands.rs`/`commands/` and `db.rs`/`db/mod.rs` collision into one canonical layout.
2. Make the Rust `schema.rs` the single source of truth; generate or clearly mark `schema.sql` as a derived reference, not a hand-maintained duplicate.
3. Introduce a centralized `PolicyEngine`-style module in Rust that all consent/disclosure/crisis invariant checks route through, so a security reviewer (human or automated) can audit one place rather than trusting that every relevant command remembered to check independently.
4. Add the `reviewer_credentials_ref` field noted above to crisis-event resolution.

---

## Risk Register

| # | Risk | Impact | Likelihood | Severity | Mitigation | Owner |
|---|---|---|---|---|---|---|
| 1 | Crisis-protocol fabricated-approval claim not yet confirmed fixed on `main` | Severe | Confirmed as of last check | Critical | Independently verify the live file; do not trust status summaries for this document specifically | You (verify) |
| 2 | Simulated parental consent mistaken for production-ready verification | Severe (regulatory) | Medium | High | Explicit "SIMULATED — NOT PRODUCTION" labeling everywhere it appears; real integration before any real user | Eng lead |
| 3 | Rust module structure collision (`commands`/`db`) | Medium (build/maintainability) | High | Medium | Refactor to single canonical layout | Eng lead |
| 4 | Dual schema source of truth drifting over time | Medium | Medium | Medium | Single generated source | Eng lead |
| 5 | Crisis criteria based on unvalidated proxy instruments | Severe (clinical/safety) | Medium | Critical | Mandatory real clinical review before any live user, including yourself with real data | Clinical reviewer (TBD) |
| 6 | No independent legal review of DPDP compliance claims | Severe (regulatory/legal) | Medium | Critical | Retain qualified counsel before any beta | You |
| 7 | No breach notification / grievance officer process documented | High | Medium | High | Add governance docs before real deployment | Eng lead |
| 8 | LLM mentor output not confirmed to pass a safety filter | Medium-High | Medium | Medium | Explicit, tested output-side safety check | Eng lead |
| 9 | No moderated usability/comprehension testing of disclosures with real teens | Medium | Medium | Medium | Conduct real testing before relying on disclosure text as "informed" | Product/UX |
| 10 | Unverified Rust invariant tests (`teen_informed_at` gate) | Severe if false | Unknown — needs confirmation | Critical | Independently confirm test exists and passes | You (verify) |

---

## Implementation Roadmap

**Phase 1 — Verification, Not Feature Work (do this before anything else):** independently confirm the crisis-protocol.md fix is live on `main`; confirm the `teen_informed_at` invariant test exists and passes in CI (not just described); resolve the two module-structure collisions; add explicit "SIMULATED" labeling to the consent-verification flow everywhere it appears. *Acceptance criteria: every claim in this section is checkable by looking at `main`, not by reading a summary.*

**Phase 2 — Independent Expert Engagement:** retain a licensed mental-health professional to review and revise the crisis-detection criteria; retain DPDP-qualified legal counsel to review the compliance mapping document and the consent architecture. *This phase has no code deliverable — its deliverable is two external sign-offs, and no Phase 4 work should begin without them.*

**Phase 3 — Core Feature Completion:** finish the transparent assessment activities with human-reviewed disclosures; complete the career-pathway classifier; add and test the LLM mentor's output-side safety filter; centralize invariant checks into the `PolicyEngine` module from the Architecture Improvements section.

**Phase 4 — Structured, Consented Beta:** small cohort, real teens and parents, full awareness they're in a beta, real (not simulated) consent verification, real crisis-protocol pathway backed by the Phase 2 clinical review — monitored closely, with a documented plan for what happens if the crisis pathway is ever actually triggered for real during the beta.

**Phase 5 — Governance & Launch Hardening:** breach notification procedure, grievance redressal mechanism, code signing for all platforms, final legal sign-off, documentation of data retention and deletion guarantees.

---

## Closing Note from the Board

The technical instincts throughout this project — local-first, Rust-enforced invariants, human-gated escalation, K-anonymity, a teen-visible permissions firewall — are the right ones, repeatedly. The recurring failure mode isn't bad design; it's **claims of completion outrunning verification**, most visibly in the crisis-protocol document. The single highest-leverage habit to adopt going forward: for anything touching consent, disclosure, or crisis handling, treat "it's fixed" as a hypothesis to check against the actual `main` branch, every time, before building the next thing on top of it.
