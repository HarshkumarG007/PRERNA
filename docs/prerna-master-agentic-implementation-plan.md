# PRERNA — Master Agentic Implementation Plan
### The single authoritative status & sequencing document, effective now

---

## 0. Purpose and How to Use This Document

This project has accumulated many planning documents over its build (`prerna-agent-implementation-plan-v2.md`, `prerna-p0-security-verify-and-fix-plan.md`, `prerna-insight-engine-implementation-plan.md`, plus several review/gap-analysis docs). Each is still valid as a **detailed reference** for its own area. But fragmentation across them is part of why status has repeatedly gotten confused in this project — a fix reported in one place, a claim made in another, no single place to check what's actually true right now.

**This document is that single place, going forward.** Any executing agent (human or AI) picking up work on PRERNA should read this file first, check the status table in Section 3, and only then go to the relevant detailed reference document for a specific milestone's full ticket breakdown.

---

## 1. Global Rules (Consolidated, Including the Newest and Most Important One)

Carried forward from prior planning documents, unchanged:

- **0.1** — No code path sets `behavioral_tracking`/`targeted_advertising` to anything but `FALSE` for under-18 accounts. No assessment activity collects data without a shown, logged disclosure. No guardian notification without both human review confirmation and `teen_informed_at` already set.
- **0.5** — Any claimed fix, invariant, or review must reference a specific commit, test name, or document section that's independently checkable — not a summary.
- **0.6** — No ticket is marked done by the same session that performed the work; a fresh, independent check confirms it landed before closing.

**New, and the most important rule in this document — 0.7, Human Judgment Cannot Be Self-Certified:**

> Any ticket whose Definition of Done depends on a licensed, credentialed, or otherwise qualified human's judgment — a clinical reviewer approving crisis-detection criteria, a lawyer approving a consent flow, a linguist approving translation equivalence, a domain expert approving disclosure language — **may never be closed by generating a document that asserts the review happened.** An executing agent's role on such a ticket is limited to: preparing the material a reviewer needs, drafting content for the reviewer to react to, and tracking the ticket as `BLOCKED: awaiting external review` until a named, contactable, qualified person provides dated, checkable evidence of their actual review. If an agent finds itself about to create a file with a name like `*-signoff.md` or `*-approved.md` without that evidence already in hand, that is the signal to stop, not to proceed.

This rule exists because it has already been violated twice in this project's history — once with a fabricated clinical-approval banner, once with self-authored translation and disclosure sign-offs. Rule 0.7 is the direct, permanent fix for that specific, repeated failure mode.

**0.8 — Audit for prior violations before adding new work.** Before starting any new milestone, grep the repository for patterns like `REVIEWED & APPROVED`, `sign-off`, `signoff`, `certified`, `approved by` across `docs/` and confirm every hit has real, external, dated evidence behind it — not just that it did once, but that it still does, since documents can drift.

---

## 2. Milestone 0 — Integrity Audit & Cleanup (Do This First, Before Any Other Work)

| Ticket | Task | Acceptance Criteria |
|---|---|---|
| **M0-1** | Rename `docs/licensing/ib4-translation-signoff.md` → `ib4-translation-draft-pending-review.md`; rename `docs/licensing/disclosure-signoffs.md` → `disclosure-drafts-pending-review.md`. Update any code or docs referencing the old filenames. | Both files renamed; a repo-wide search for the old filenames returns nothing; the content inside is reframed as a draft for reviewer use, not a completed approval. |
| **M0-2** | Full repository audit per Rule 0.8 — grep `docs/` (and any other location) for approval/review/certification language, and cross-check every hit against real, external, dated evidence. | A written audit result (even if the answer is "no further instances found") committed to `docs/integrity-audit-log.md`, dated, listing every hit and its verification status. |
| **M0-3** | Resolve current ground truth on `git log` vs. `origin/main`, per Ticket T0 of the P0 security plan — this has come up multiple times in this project's history and needs a final, confirmed answer before anything else proceeds. | A confirmed current commit hash, agreed as the baseline for every ticket below. |

**Nothing in Milestones 1–3 begins until Milestone 0 is closed.**

---

## 3. Status Table — The Single Source of Truth

This table is the actual living record. Update it directly as items close — do not let status live only in commit messages or scattered docs going forward.

| # | Item | Owner | Status | Evidence |
|---|---|---|---|---|
| M0-1 | Relabel self-authored docs | Agent | ✅ Done | Both files renamed to `*-draft-pending-review.md`. No remaining claims in codebase. |
| M0-2 | Integrity audit | Agent | ✅ Done | `docs/integrity-audit-log.md` committed and verifies 0 instances of fabricated claims. |
| M0-3 | Git ground truth | You | ✅ Done | Ground truth established at commit `a57f9e1`. |
| H1 | Clinical reviewer engaged | You | ⏳ Not started | *(named person, date, contact-verifiable)* |
| H2 | DPDP legal counsel engaged | You | ⏳ Not started | *(named person/firm, date)* |
| H3 | Hindi construct-equivalence reviewer | You | ⏳ Not started | *(named person, date)* |
| H4 | Disclosure language reviewer (+ teen comprehension test) | You | ⏳ Not started | *(named person/process, date)* |
| P0-T0–T11 | Security verify-and-fix tickets | Agent | ⏳ Not started (see detailed plan) | *(per-ticket, see `prerna-p0-security-verify-and-fix-plan.md`)* |
| IB/FE/TN/PG/BF | Insight engine tickets | Agent | 🟡 Partially started (schema + disclosure code done; reviews not) | *(per-ticket, see `prerna-insight-engine-implementation-plan.md`)* |
| T12 | Register `claim_crisis_event` in Tauri handler | Agent | ✅ Verified (Pending CI) | **Verified in commit `b6b6f66`: `claim_crisis_event` is registered exactly once. Awaiting CI run to confirm compilation.** |
| T13 | Remove duplicate `export_user_data` registration | Agent | ✅ Verified (Pending CI) | **Verified in commit `b6b6f66`: exactly one `export_user_data` registration remains. Awaiting CI run.** |
| T14 | Resolve `mock_mode` status (wire real inference, or honestly relabel every "AI Mentor implemented" claim) | Agent | 🚫 Deferred: real inference pending | `mock_mode: true` independently verified in `src-tauri/src/ai/mod.rs`; real inference deferred because the current local build environment cannot satisfy the `llama-cpp-2` native dependency requirements. README and relevant documentation now describe the system as a "local LLM integration scaffold, inference pending." No claim of operational AI inference is made. |
| T15 | Verify and fix: does crisis detection in `chat_with_mentor` actually call `create_crisis_event`? | Agent | 🔴 Verification Failed | **Code inspection of commit `b6b6f66` confirms identity is from `ActiveSession`, DB lock sequence is safe, DB failure propagates, and duplicate events are handled via unique IDs. HOWEVER, verification fails on test coverage: `test_crisis_detection_persists_event` only exercises the extracted `handle_crisis_detection` helper, not the actual Tauri command. If the helper call is removed from `chat_with_mentor`, the test still passes, meaning it tests the wrong layer.** |

Legend: ⏳ not started · 🟡 in progress · ✅ done with checkable evidence · 🔴 confirmed broken (independently verified) · 🔶 reported, unverified · 🚫 blocked on external dependency

---

## 4. Milestone 1 — Human Engagement (Tracked as Tickets, Not Closable by an Agent)

| Ticket | What's Needed | Where to Look |
|---|---|---|
| **H1 — Clinical Reviewer** | A licensed mental-health professional (clinical psychologist, psychiatrist, LCSW/LPC-equivalent) reviews `docs/crisis-protocol.md` in full — trigger criteria, SLA, disclosure language, the guardian-notification invariant. | University psychiatry/psychology departments with adolescent focus; licensed practitioners via professional bodies (e.g., Indian Association of Clinical Psychologists); paid consulting, not only pro bono. |
| **H2 — DPDP Legal Counsel** | Qualified counsel reviews `docs/dpdp-compliance-mapping.md`, the consent architecture, and signs off on the actual parental-verification mechanism to build (replacing the simulated flow). | DPDP-focused privacy lawyers/firms (a growing specialty given the law's recency); digital-rights orgs for referrals; university legal aid clinics. |
| **H3 — Hindi Construct-Equivalence Reviewer** | Someone genuinely fluent in Hindi with linguistics or psychometrics background confirms adapted IPIP/O\*NET items still measure their intended construct post-translation. | University linguistics/psychology departments; professional translators with psychometric experience. |
| **H4 — Disclosure Language Reviewer** | Someone with child-development or plain-language expertise reviews all disclosure text for genuine 13–18 comprehensibility — ideally including actual moderated testing with teens in that age range, not just an adult's read-through. | Child-development researchers; UX researchers with youth-testing experience. |

**Definition of Done for every ticket in this milestone, without exception:** a named, real person or firm; a date; and evidence of their actual review (their own written feedback, a signed document, meeting notes) — supplied by them, not generated on their behalf. An agent working on this project should treat these four tickets as permanently outside its own authority to close.

---

## 5. Milestone 2 — P0 Security Verify-and-Fix

Fully detailed in `prerna-p0-security-verify-and-fix-plan.md`. Summary of the eleven tickets (T0 is the prerequisite for all others; T1→T2/T3/T5/T7 form a dependency chain; T4/T6/T8/T9/T10/T11 can proceed independently):

| Ticket | Area |
|---|---|
| T0 | Ground-truth commit reconciliation |
| T1 | Authenticated session/principal |
| T2 | Authorization on every privileged command |
| T3 | Real parent–teen relationship verification |
| T4 | Argon2id password hashing |
| T5 | Authenticated crisis reviewer identity |
| T6 | Real AI SafetyFilter integration into the generation path |
| T7 | Backend-owned conversation context |
| T8 | Complete encrypted export/import |
| T9 | Deletion manifest completeness |
| T10 | Crisis detection robustness (engineering only — criteria still gated on H1) |
| T11 | Overclaim language cleanup |

Every ticket in this milestone begins with a **Verify** step before any fix is attempted, per that document's own governing rule — do not skip straight to implementation.

---

## 5a. Milestone 2b — Externally-Verified Findings (New)

These four tickets came from an external "autopsy" review of the live repository. Unlike earlier reviews pasted into this project, this one cited specific file blob URLs per claim — the correct citation discipline — and two of its highest-stakes claims were independently checked by direct file fetch (not by trusting the review) and confirmed exactly accurate. That earns the rest of the review a meaningfully higher prior than prior unsourced reviews got, without treating it as automatically correct throughout.

| Ticket | Task | Verification Status |
|---|---|---|
| **T12** | Add `commands::claim_crisis_event` to the `generate_handler!` list in `src-tauri/src/lib.rs`. One-line fix — no design decision required. | ✅ Bug confirmed by direct fetch. Fix not yet applied. |
| **T13** | Remove the duplicate `commands::export_user_data` entry from the same handler list. | ✅ Bug confirmed by direct fetch. Fix not yet applied. |
| **T14** | Decide `mock_mode`'s fate deliberately: either fix the `llama-cpp-2 v0.1.154` API mismatch and wire real inference, or leave it mocked for now but correct every doc/README claim of "AI Mentor implemented" to "local LLM integration scaffold, inference pending." Either is acceptable; silent status quo is not. | ✅ Root cause confirmed by direct fetch. Decision not yet made. |
| **T15** | Fetch `src-tauri/src/commands/ai.rs` directly and confirm whether `chat_with_mentor`'s crisis-detection path actually calls `create_crisis_event`, or dead-ends at a canned response string. Fix only if the gap is confirmed — per Milestone 2's own Verify-first rule. | 🔶 Reported by the external review, not yet independently checked. Highest-priority item to verify next given what it would mean if true — the crisis architecture's detection and escalation halves would be disconnected. |

**T15 in particular should be verified before anything else in this addendum** — if confirmed, it's a more urgent finding than T12/T13's simple registration bugs, since it bears directly on whether the crisis-safety invariant this entire project has been built around is actually reachable in the running app.

---

## 6. Milestone 3 — Insight Engine Completion

Fully detailed in `prerna-insight-engine-implementation-plan.md`. Current state per the last session's work: schema default and `extended_assessment` disclosure wiring are done (code-complete); IB-4 (item translation review) and the disclosure sign-offs are **not** done despite prior claims — they map directly onto Milestone 1's H3 and H4 tickets above. Treat them as the same open item, not a separate one.

| Ticket | Area | Status |
|---|---|---|
| IB-1–IB-3 | Item sourcing, licensing, adaptation | ✅ Likely done — verify against Section 3's evidence standard |
| IB-4 | Translation review sign-off | 🚫 Blocked — same item as H3 |
| IB-5 | Item bank versioning | ✅ Done per last session (schema default updated) |
| FE-1, FE-2 | Fusion engine extension | Verify current state |
| TN-1–TN-4 | Teen insight narrative layer | Verify; disclosure sign-off blocked — same item as H4 |
| PG-1–PG-5 | Parent guide layer | Verify; PG-1 (PLH license check) status unknown — verify explicitly |
| BF-1 | Fairness review | 🚫 Blocked — needs its own qualified reviewer, distinct from H1–H4 |

---

## 7. The Beta Readiness Gate

Do not begin Beta planning, do not begin a new architectural phase, until **every** item below is independently true — checked against Section 3's status table with real evidence, not inferred from the fact that a lot of related code exists:

- [ ] Milestone 0 fully closed
- [ ] H1 (clinical review) closed with named-person evidence
- [ ] H2 (legal review) closed with named-person evidence
- [ ] H3 (translation review) closed with named-person evidence
- [ ] H4 (disclosure review) closed with named-person evidence, ideally including real teen comprehension testing
- [ ] BF-1 (fairness review) closed with named-person evidence
- [ ] All P0 security tickets (T0–T11) closed, each with its Verify evidence
- [ ] Real (non-simulated) parental consent mechanism built, per H2's guidance — replacing the current simulated flow
- [ ] Real (non-mock) guardian notification delivery implemented — replacing the current "MOCK GUARDIAN NOTIFICATION EXECUTED" logging

Only once this list is genuinely, checkably complete does "what phase comes next" become a live question again.

---

## 8. Going Forward

Update Section 3's status table directly, in this file, as the single place to check truth. If a future session — yours or an AI agent's — reports a status that isn't reflected here with real evidence, treat the report as unconfirmed until it is. That single habit, more than any individual ticket in this plan, is what will actually get PRERNA to production safely.
