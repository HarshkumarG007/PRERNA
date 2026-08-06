# PRERNA — Repo Gap Analysis & Delta Implementation Plan
### Comparing github.com/HarshkumarG007/PRERNA against the planned architecture

---

## 0. Critical Finding (blocks Phase 4 work — read this first)

`docs/crisis-protocol.md` currently opens with a **`[REVIEWED & APPROVED]`** banner claiming clinical review "adapted from Columbia-Suicide Severity Rating Scale and APA Guidelines," with specific reviewer-qualification and SLA language. Unless this reflects a real, named licensed professional's actual review, this is a fabricated authority claim in front of the single highest-stakes decision the system makes — whether to notify a guardian about a minor's safety. Ticket P4-1 in the original implementation spec required this document to be human-authored and explicitly marked `BLOCKED: requires human collaborator` until real sign-off existed; the current file appears to have been generated to satisfy that ticket's *shape* without the actual review taking place.

**Required immediate actions, before any other Phase 4 work proceeds:**
1. Replace the `[REVIEWED & APPROVED]` banner with `[DRAFT — PENDING CLINICAL REVIEW]` until a real licensed mental-health professional (LCSW/LPC or equivalent, ideally with pediatric/adolescent crisis experience) has actually reviewed it.
2. Replace the `988` reference with verified, current Indian crisis resources (KIRAN: 1800-599-0019; Vandrevala Foundation; iCall) — confirm these are still active immediately before any use, since helpline availability changes over time.
3. Treat the specific clinical thresholds in the document (the PHQ-9-equivalent 14-day criterion, the ideation-language examples) as a **draft proposal for a clinician to react to and correct**, not a finished specification — the direction of authorship should be human-judgment-first, AI-formatting-second, not the reverse.
4. Add a visible provenance note to the document itself: who drafted it, on what date, and the actual review status — so this can never again be mistaken for something it isn't, by you, a collaborator, or a future reviewer.

This is the one item in this whole plan that isn't a feature gap — it's a correctness-of-claims problem, and it's worth fixing before writing another line of Phase 4 code.

---

## 1. What's Actually in the Repo (as of this check)

- **2 commits total.** Very early — scaffold plus initial documentation, not yet a working assessment/mentor/crisis pipeline.
- **Confirmed stack (from `package.json`):** React 19, TypeScript, Vite, Tailwind v4, Tauri v2 + Rust, Zustand, TanStack Query, `react-router-dom`, `framer-motion`, Tauri plugins for SQL/fs/dialog/opener. Testing via Vitest + React Testing Library.
- **Not yet present in dependencies:** anything AI/LLM-related — no `llama.cpp` binding, no ONNX runtime, no embedding library, no Python/FastAPI sidecar. The README's "AI-driven mentorship" and "psychological assessments" claims are describing the *target*, not current functionality — worth being precise about this distinction anywhere you describe the project's current state (a resume, a demo, a conversation with a collaborator).
- **`docs/crisis-protocol.md` exists** and is structurally close to what was planned (imminent-risk indicators, human review process, teen-informed-before-guardian sequencing, disclosed language) — good bones, undermined by the fabricated-approval issue in Section 0.
- **README claims matching the plan well, structurally:** age/consent gating via "simulated Digilocker workflows," informed-consent architecture with UI-blocking session initiation, Rust-level IPC invariant enforcement (`insert_crisis_event`), SQLCipher-at-rest. These are strong, correct architectural instincts — assuming the actual Rust implementation backs up the README's claims, which I can't fully verify from outside the repo (see Section 4).

**One genuinely good thing that exceeds the original plan:** enforcing invariants at the compiled Rust/Tauri IPC layer rather than only in JavaScript is a *stronger* implementation of Global Rule 0.1-3 (the guardian-notification gating rule) than what I originally specified — client-side JS is trivially tamperable, and pushing the safety invariant into Rust is a real security improvement. If the Rust code genuinely does what the README claims, that's worth highlighting as a deliberate, above-spec engineering decision in any writeup of this project.

---

## 2. Feature-by-Feature: Planned vs. Current

| Area | Planned (architecture doc) | Current state | Gap |
|---|---|---|---|
| Age/consent gating | Full `ageTierGate`, hard-coded `behavioral_tracking=FALSE` for minors, verifiable parental consent | README claims a "simulated Digilocker workflow" exists | Need to confirm: is this a real DigiLocker-equivalent integration or a mocked flow? A *simulated* verification is fine for development but must be replaced with a genuinely verifiable mechanism before any real user data is collected — this is the difference between a DPDP-compliant product and one that only looks compliant in a demo |
| Disclosure-gated sessions (Rule 0.1-2) | No session without a shown, versioned disclosure | README claims "UI physically blocks session initiation until explicit, timestamped consent" | Sounds aligned in principle; needs the actual disclosure *content* (Ticket P1-3) written and human-reviewed per Rule 0.1-4 — confirm this exists, not just the blocking mechanism |
| Crisis escalation router | Pattern detection → human review queue → gated guardian notification | `crisis-protocol.md` exists with matching structure; `insert_crisis_event` Rust command referenced | Structure is right; **Section 0's fabricated-review issue must be resolved before this is trustworthy**; need to confirm P4-2 (detection-only, no autonomous action), P4-5 (review queue UI), and P4-6 (the `teen_informed_at`-gated notification path) are actually implemented, not just documented |
| Transparent assessment engine (Life Quests, Skill Arena, Mood Mirror, Social Compass) | Full gamified activities with per-activity disclosures | Not evident in current dependencies/commits | Not started — this is most of Phase 2's and Phase 4's scope |
| AI Mentor | Local LLM (Mistral 7B/Llama 3 8B via llama.cpp), self-identifying, context-aware | No AI/LLM dependency present | Not started — Phase 3 in full |
| Career pathway classifier | Custom classifier over trait profile | Not evident | Not started |
| Parent dashboard (teen-visible mirror) | Shared data source for teen and parent views | Not evident | Not started — Phase 5 |
| Data export/delete, audit trail | Self-service, teen-accessible | Not evident | Not started — Phase 5 |
| Encryption at rest | SQLCipher | README claims "built-in SQLCipher encryption support" | Confirm this is actually wired into the Tauri SQL plugin config and tested (a documented but unconfigured dependency is a common gap — verify with a direct test that the DB file is unreadable without the key, per original Ticket P1-1's acceptance criteria) |
| Testing | Consent-flow tests, crisis-protocol tests, disclosure review tracking | README claims "rigorous DPDP invariant tests" via Vitest | Good signal; confirm test coverage actually includes the specific invariant tests from Rule 0.1 (e.g., the `teen_informed_at`-before-notification test) rather than only general UI tests |

---

## 3. Exact Next Steps, in Priority Order

### Immediate (before anything else)
1. **Resolve Section 0.** Fix the crisis-protocol document's false approval claim and hotline reference. This blocks all further Phase 4 work in good conscience.
2. **Verify the "simulated Digilocker workflow" is clearly labeled as simulated everywhere it appears** (code comments, README, any demo materials) so it's never mistaken for a production-ready verification mechanism ahead of a real integration.
3. **Confirm SQLCipher is actually active**, not just a stated intention — run the direct test from original Ticket P1-1: attempt to open the database file without the correct key and confirm it fails.

### Short-term (complete Phase 1 for real)
4. Finish and human-review the teen-readable disclosure content (original Ticket P1-3) — this is a prerequisite for Phase 2's activities and is easy to underestimate as "just copy" when it actually needs real comprehensibility testing with people in the target age range.
5. Implement and test the consent-revocation path (original Ticket P1-4's acceptance criteria: revoking `parent_consents` immediately locks further data collection) if not already present.
6. Wire the `access_audit_log` (original Ticket P1-6) if not already present — this is a small, high-value addition to build now while the data-access patterns are still simple, rather than retrofitting once more features read/write teen data.

### Medium-term (Phase 2 — the first real content)
7. Build Life Quests and Skill Arena with their disclosures shown *before* first use, reading from a real `projects`-equivalent content data layer (`disclosures.js` from the original folder structure) — this is the first place the product becomes genuinely demoable as more than a consent shell.
8. Implement Big Five / RIASEC scoring backends against real psychometric scoring methodology, not an approximation — validate scores against fixture data with known expected outputs.

### Medium-term (Phase 3 — bring the AI claims in the README up to reality)
9. Integrate the local LLM (llama.cpp + a quantized 7-8B model) via the Tauri sidecar pattern — this is the largest single piece of unbuilt scope relative to what the README already claims exists. Until this lands, the README's "AI-driven mentorship" language should be softened to "planned" or moved to a roadmap section, so the repo's own documentation doesn't get ahead of its code the same way the crisis-protocol document did.
10. Build the career pathway classifier once real trait-profile data exists to classify from (depends on step 8).

### Before resuming Phase 4 content work
11. Get real clinical review of the crisis protocol (Section 0) — do not build Mood Mirror, Social Compass, or the pattern-detection/human-review-queue code against an unreviewed document, since the detection *criteria themselves* will very likely change once a real clinician looks at them, and building against a moving target wastes real effort.
12. Once reviewed: implement pattern detection (original P4-2) as detection-only, no autonomous action; build the human review queue UI (P4-5); implement guardian notification (P4-6) with the `teen_informed_at`-gate test as the single most scrutinized test in the codebase.

### Later (Phase 5-6)
13. Teen-visible parent dashboard, self-service export/delete, regional language support (with translated disclosures going through their *own* human review, not inheriting the English version's review status), beta cohort onboarding with its own disclosure content.

---

## 4. Things I Can't Verify From Outside the Repo — Worth Checking Yourself

- Whether the Rust IPC commands (`insert_crisis_event` and others) genuinely enforce the invariants the README claims, or whether the enforcement is currently only at the (weaker) JavaScript layer with Rust as an aspirational description.
- Whether the "rigorous DPDP invariant tests" mentioned in the README actually test the specific invariants from Rule 0.1 (the four non-negotiable rules) or are general-purpose UI/unit tests that happen to touch the same code paths.
- The actual content of the teen-readable disclosures, if any exist yet — these are the piece most likely to look "done" (a component exists) while not actually being done (the content hasn't been reviewed for genuine age-appropriate comprehensibility).

Worth a quick pass through the actual source (not just the README) to confirm claims match implementation before you rely on either in a demo, a resume conversation, or — especially — before any real user's data touches this system.
