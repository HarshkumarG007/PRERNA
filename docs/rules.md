# Rules — Development Rules & AI Agent Guidelines
## PRERNA Project

**Version:** 1.0  
**Status:** Living Document — these rules are permanent and apply retroactively  
**Last Updated:** 2026-10-29

> These rules apply to every human developer and every AI coding agent working on this codebase. When in conflict with any other instruction, these rules take precedence.

---

## 0. The Four Non-Negotiable Rules (Global Rules)

These rules exist because of specific, serious, already-identified harms. They are not preferences. There is no "urgent override" path for any of them.

### Rule 0.1 — No Behavioral Tracking for Under-18 Accounts
```
NO code path may set behavioral_tracking or targeted_advertising
to anything but FALSE for an under_18 account.
```
- These are not settings. There is no UI, admin panel, or configuration flag anywhere that can change these values for an `under_18` account type.
- Enforced at the **data layer** (Rust-side in `src-tauri/src/consent.rs`), not just the UI layer — an API call attempting to set tracking flags for an `under_18` account must fail server-side/locally regardless of what the UI sends.
- **If you find yourself writing code that would allow this: STOP. File it as a violation. Do not proceed.**

### Rule 0.2 — No Assessment Without Disclosure
```
No assessment activity may collect profile data without its Section 7
disclosure having been shown and logged first.
```
- A `sessions` row cannot be created without a valid `disclosure_shown_id` referencing an approved, versioned disclosure text.
- Enforced in `src/engine/consent/sessionGate.ts` — the `validateSessionCreation()` function is the only creation path; there is no bypass.
- The disclosure version must be tracked on every session row — "shown once globally at signup" is not sufficient.

### Rule 0.3 — No Guardian Notification Without Human Review + Teen Informed
```
No guardian-notification code path may execute without BOTH:
  (a) human_review_status = 'reviewed_guardian_notified' on the crisis_events row
  (b) teen_informed_at timestamp already set (non-null) on that same row
```
- There is no "urgent bypass" flag. If a situation seems to demand one, that is a signal for a design review involving a mental-health professional — not an inline code change.
- The guardian notification function must fail with a hard error if either condition is not met. This is the single most important test in the entire codebase.

### Rule 0.4 — Teen-Readable Disclosure & Crisis Protocol Are Not AI-Authored
```
The teen-readable disclosure text and docs/crisis-protocol.md
must not be written or substantively edited by an AI agent alone.
```
- An AI agent may **draft** content for a human reviewer to react to.
- The content may only be marked done when `docs/disclosure-language-review.md` shows sign-off from a named, contactable, qualified human reviewer (child-development background for disclosures; licensed mental-health professional for crisis protocol).
- Mark the ticket `BLOCKED: requires human review` rather than merging without it.

---

## 1. Human Judgment Cannot Be Self-Certified (Rule 0.7)

> Any ticket whose Definition of Done depends on a licensed, credentialed, or otherwise qualified human's judgment may **never** be closed by generating a document that asserts the review happened.

An AI agent's role on such tickets is limited to:
1. Preparing the material a reviewer needs
2. Drafting content for the reviewer to react to
3. Tracking the ticket as `BLOCKED: awaiting external review`

**If you find yourself about to create a file named `*-signoff.md`, `*-approved.md`, or `*-certified.md` without that external evidence already in hand — STOP. That is the signal, not a reason to proceed.**

This rule exists because it has already been violated twice in this project's history. Rule 0.7 is the permanent fix for that specific, repeated failure mode.

---

## 2. Definition of Done (All Tickets)

A ticket is not done until **all** of the following are true:

- [ ] Code implemented and type-safe (TypeScript strict mode; mypy --strict for Python; Rust standard)
- [ ] Unit/integration tests passing, **including** any consent-flow or crisis-protocol tests specified in the ticket
- [ ] `docs/dpdp-compliance-mapping.md` updated if the ticket touches consent, data collection, or crisis handling
- [ ] For tickets flagged `requires human review` — sign-off recorded **before** merge, not after
- [ ] Ticket closed by a **fresh session / independent check** — not by the same session that performed the work (Rule 0.6)
- [ ] Any claimed fix references a specific commit hash, test name, or document section — not a summary (Rule 0.5)

---

## 3. Language-Specific Standards

### TypeScript (Frontend)
```typescript
// ✅ Always: strict mode
// tsconfig.json: "strict": true

// ✅ Always: explicit return types on exported functions
export function validateSession(id: string): Promise<SessionResult> { ... }

// ✅ Always: Zod validation on all IPC payloads coming from Rust
const payload = SessionPayloadSchema.parse(rawPayload);

// ❌ Never: `any` type
// ❌ Never: non-null assertion `!` without a preceding runtime check
// ❌ Never: mutate Zustand state directly for persistent data
//           (always go through the Tauri IPC command path)
```

### Rust (Tauri Backend)
```rust
// ✅ Always: handle Result<> — no unwrap() in production code paths
// ✅ Always: parameterized queries — never string-interpolated SQL
// ✅ Always: run the ageTierGate check before any data write for a user
// ❌ Never: store encryption key material in the database
// ❌ Never: log PII — user IDs are acceptable; names, traits, mood data are not
```

### Python (FastAPI sidecar, if used)
```python
# ✅ Always: type hints + mypy --strict
# ✅ Always: pydantic models for all request/response schemas
# ❌ Never: cloud database calls — all persistence goes through the Rust layer
```

---

## 4. Preferred Libraries

Use these. Do not introduce alternatives without an ADR explaining why.

| Purpose | Library | Version |
|---|---|---|
| Frontend framework | React | 19 |
| Styling | Tailwind CSS | v4 |
| State management | Zustand | ^5 |
| Async data | TanStack Query | ^5 |
| Animation | Framer Motion | ^13 |
| Validation | Zod | ^4 |
| Routing | React Router DOM | ^7 |
| Icons | Lucide React | ^1.29 |
| Testing (unit) | Vitest | ^4 |
| Testing (E2E) | Playwright | latest |
| Markdown | react-markdown + remark-gfm | ^10 / ^4 |

**Do NOT introduce:**
- Firebase, Supabase, or any cloud database client
- Any analytics SDK that sends data to a third-party server
- Any advertising SDK
- Any social-login SDK that creates a server-side identity record without explicit architectural review
- electron or any Electron-based wrapper (we use Tauri)

---

## 5. Error Handling Protocol

### Frontend (TypeScript)
```typescript
// ✅ Pattern: Result type from Tauri IPC
const result = await invoke<SessionResult>('create_session', payload);
// Handle both success and Tauri error variants explicitly

// ✅ Pattern: Zod safeParse for user input
const parsed = Schema.safeParse(input);
if (!parsed.success) {
  // Show user-facing validation error; log (without PII) for debugging
}

// ❌ Anti-pattern: silent catch
try { ... } catch (_) { /* swallowed */ }
```

### Rust Backend
```rust
// ✅ Pattern: propagate with context
fn save_session(conn: &Connection, s: Session) -> Result<(), AppError> {
    conn.execute(INSERT_SQL, params![...])
        .map_err(|e| AppError::DatabaseWrite(e.to_string()))?;
    Ok(())
}

// ❌ Anti-pattern: panic in a command handler
// A panic in a Tauri command crashes the whole app silently for the user.
```

### Crisis Path (Stricter)
- Any error in the crisis escalation path must **fail closed** — if a step cannot complete (e.g., cannot write `teen_informed_at`), the guardian notification must **not** proceed.
- Errors in the crisis path are logged locally (no PII in log content) and surfaced to the internal review queue, not silently swallowed.

---

## 6. Data & Privacy Rules

1. **Purpose limitation**: Every data field collected must map to a specific, disclosed feature. No field collected "in case it's useful later."
2. **No PII in logs**: User IDs (UUIDs) are acceptable in logs. Names, mood scores, trait data, and conversation content are never logged.
3. **Audit trail for every read**: Every read of a teen's profile data by any actor (self / parent_dashboard / system_process) writes an `access_audit_log` row.
4. **Emotion model scope**: The DistilRoBERTa emotion model may only be invoked on data from the Mood Mirror feature. It may not be called on AI mentor chat logs, Life Quests choices, or any other context without a dedicated disclosure for that use.
5. **No cross-app tracking**: No tracking pixels, no third-party SDKs that phone home, no fingerprinting of any kind.
6. **Shared-device safety**: Never use "same device" as any signal of "same authorized user." Always require PIN/biometric for each profile.

---

## 7. Commit & Branch Strategy

```
# Branch naming
ticket/<id>-<short-slug>
# e.g. ticket/P1-2-age-declaration-gate

# Commit format: Conventional Commits
feat(consent): implement age-tier gate at data layer
fix(crisis): ensure teen_informed_at checked before notify
test(consent-flow): add revocation test for parent_consents
docs(architecture): add ADR-0003 age threshold decision
chore(deps): update zod to 4.4.3

# PR description must:
# 1. Reference the ticket ID
# 2. List the acceptance criteria from the ticket
# 3. Confirm each criterion is met, with test name or commit hash
```

---

## 8. Testing Requirements

### Required Test Categories

| Category | What to Cover | Minimum |
|---|---|---|
| **Unit** | Business logic: assessment scoring, disclosure gate, age-tier gate | 80% branch coverage |
| **Integration** | IPC flows end-to-end (React → Tauri → DB → back) | All happy paths + key error paths |
| **Consent-flow** | Every path: age declaration → disclosure → parental consent → account unlock → revocation | 100% path coverage |
| **Crisis-protocol** | All crisis steps; the guardian-notify-without-human-review-attempt MUST fail | 100% path coverage |
| **Data-layer** | Under-18 tracking flag attempt must fail at data layer, bypassing UI | Required |

### Non-Negotiable Tests
These specific tests **must exist and pass** before the corresponding feature can ship:

1. `test: under-18 behavioral_tracking=true attempt fails at data layer` (P1-2)
2. `test: session creation without disclosure_shown_id fails` (P2-1)
3. `test: guardian notification with null teen_informed_at fails` (P4-6) — **most important test in codebase**
4. `test: guardian notification with pending human_review_status fails` (P4-6)
5. `test: parent dashboard and teen mirror render from same data source` (P5-1)
6. `test: data delete — query after delete returns empty` (P5-2)

---

## 9. Code Review Checklist

Before approving any PR, the reviewer must confirm:

- [ ] Does this change introduce any code path that could set `behavioral_tracking` or `targeted_advertising` to non-FALSE for an `under_18` account? → **Reject if yes**
- [ ] Does this change touch crisis handling? → Verify Global Rule 0.3 is still enforced
- [ ] Does this change collect new data? → Verify there's a corresponding disclosure entry
- [ ] Does this change touch `docs/dpdp-compliance-mapping.md`? → It should if the change touches consent/data/crisis
- [ ] Are there PII values in any log statements? → **Reject if yes**
- [ ] Is this a human-review ticket being merged without documented human sign-off? → **Reject if yes**

---

## 10. What to Do When You're Unsure

**Simple heuristic:** Ask: "Would this feature need its own new disclosure to stay honest with the user?"

- If **yes** → add the disclosure before shipping, per Rule 0.2. This simple test catches most drift back toward the original design's problems.
- If it seems to require loosening any of Global Rules 0.1–0.4 → that is a signal for a **full design review**, not an incremental code change.
- If the next step requires clinical, legal, or linguistic judgment → mark the ticket `BLOCKED: awaiting external review` and prepare materials for the reviewer. Do not self-certify.

