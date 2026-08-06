# PRERNA — Critical Fixes & Build Guide (Mapped to Your Actual Files)

This maps directly onto the real structure you've now shared (`src/`, `src-tauri/`) rather than generic advice. Two blocking fixes come first; everything else is sequenced after them.

---

## FIX 1: Remove "stealth" from the design, not just the docs

**Files affected:** `src/components/activities/*` (SkillArena.tsx, MoodMirror.tsx, LifeQuests.tsx), `src/engine/assessment/disclosures.ts`, `src/engine/synthesis/fusionEngine.ts`, any code comments/READMEs using the word "stealth."

**What's wrong:** the design as documented collects psychometric data from a minor while they believe they're "just playing a game," with no disclosure step shown before `fusionEngine.ts` maps telemetry to Big Five/RIASEC traits. This is deceptive-by-design and is what DPDP Section 9(3) prohibits.

**Exact fix:**

1. **Rename the concept everywhere.** `activities/` folder comment changes from "Stealth Assessments" to "Transparent Gamified Assessments." Search the whole repo (`grep -ri stealth`) and remove every instance — including code comments, commit messages going forward, and any variable/function names that encode the concept (e.g., if anything is named `stealthScore` or similar, rename it). This matters more than it sounds like it should: the word in your own comments will keep steering future decisions, including an AI coding agent's, back toward hiding things.

2. **`disclosures.ts` becomes load-bearing, not decorative.** Right now it's described only as "rules for how game actions map to traits" — that's `fusionEngine.ts`'s job. `disclosures.ts` needs to own the actual **user-facing text** shown before each activity type, e.g.:
   ```typescript
   // src/engine/assessment/disclosures.ts
   export const DISCLOSURES: Record<ActivityType, Disclosure> = {
     skill_arena: {
       version: "v1",
       text: "These games help us understand how you think and learn best.",
       reviewedBy: null, // must be set before this ships — see Fix 1, step 4
     },
     mood_mirror: {
       version: "v1",
       text: "This helps you notice patterns in how you're feeling over time.",
       reviewedBy: null,
     },
     // ...
   };
   ```

3. **Gate session creation on disclosure having been shown.** In `commands.rs`, the Rust command that inserts a `Session` row (whatever it's currently called — likely near `save_trait_snapshot`) should **require** a `disclosure_version` and `disclosure_shown_at` field, and reject the insert if either is missing. Do this in Rust, not just React — the same reasoning that makes your crisis invariants Rust-enforced applies here: a JS-only check is trivially bypassed by a future component that forgets to call it.
   ```rust
   // src-tauri/src/commands.rs
   #[tauri::command]
   fn save_session(user_id: String, activity_type: String, disclosure_version: String, disclosure_shown_at: i64, /* ... */) -> Result<(), String> {
       if disclosure_version.is_empty() {
           return Err("Cannot save session: no disclosure was recorded".into());
       }
       // proceed with insert
   }
   ```

4. **Get the disclosure text human-reviewed before any activity using it ships** — this was Ticket P1-3 / Global Rule 0.1-4 in the original spec, and it still applies. `reviewedBy: null` in the data structure above should be a visible, greppable signal of what's still pending.

---

## FIX 2: Rebuild `escalationRouter.ts` with the human-review gate — this is not optional

**Files affected:** `src/engine/crisis/escalationRouter.ts`, `src-tauri/src/commands.rs` (crisis-related commands), `docs/crisis-protocol.md`.

**What's wrong:** as documented, detection directly triggers guardian notification. There is no `crisis_events` table with a `pending` status, no human reviewer, and no `teen_informed_at` gate. This is the exact "algorithmic surveillance" failure mode we designed against — a regex false-positive, or a genuine crisis in an unsafe household, both currently produce the same unreviewed, un-disclosed-to-the-teen outcome.

**Exact fix — the router's job changes from "notify" to "flag for review":**

```typescript
// src/engine/crisis/escalationRouter.ts — CORRECTED
export async function checkForCrisisIndicators(input: MoodLogOrChatMessage): Promise<void> {
  const indicators = detectIndicators(input); // per docs/crisis-protocol.md's criteria
  if (indicators.matched) {
    // This is the ONLY thing this function is allowed to do on a match.
    // No notification. No guardian contact. No autonomous action beyond this write.
    await invoke('create_crisis_event', {
      userId: input.userId,
      detectedAt: Date.now(),
      severity: indicators.severity,
      // human_review_status defaults to 'pending' in Rust/DB — never set here
    });
  }
}
```

```rust
// src-tauri/src/commands.rs — the invariant that makes this safe
#[tauri::command]
fn resolve_crisis_event(
    event_id: String,
    reviewer_id: String,          // must reference a real reviewer record — no anonymous resolution
    decision: CrisisDecision,     // enum: NoAction | ResourcesOnly | GuardianNotified
    teen_informed_at: Option<i64>,
) -> Result<(), String> {
    if decision == CrisisDecision::GuardianNotified && teen_informed_at.is_none() {
        return Err("Cannot notify guardian: teen has not been informed yet".into());
    }
    // proceed — and this is the ONLY code path that may call the actual
    // guardian-notification function. `checkForCrisisIndicators` above
    // must never call it directly, and there should be no second function
    // anywhere in the codebase capable of sending that notification.
}
```

**The single test worth writing before anything else in this module:** a test that calls whatever function actually sends the guardian SMS/email, directly, with `teen_informed_at: None`, and asserts it fails — regardless of what `decision` is passed. If that test doesn't exist yet, write it before touching any other crisis-related code.

**On `docs/crisis-protocol.md` specifically:** until this is genuinely reviewed by a licensed professional, keep the router's detection criteria intentionally conservative and clearly marked as provisional in code comments (`// PROVISIONAL — pending clinical review, see docs/crisis-protocol.md status`). Don't let unreviewed criteria quietly harden into "how the system works" just because it's been running for a while without complaint — that's a false sense of validation, not real validation.

---

## Everything else, sequenced after Fix 1 and Fix 2 land

Your file structure already covers most of what's needed — this is really about finishing and connecting what's scaffolded, in this order:

1. **`store/index.ts` + `useDatabase.ts`**: confirm `login()` → `get_unified_profile` round-trip actually enforces the age-tier/consent gate before returning a profile (i.e., an under-18 profile with no valid `parent_consents` record shouldn't be fetchable at all, not just filtered client-side).
2. **`parent/permissions.ts`**: this is a genuinely strong piece already (raw-vs-`ParentSafeProfile` firewall, default to conversation-starters not raw data) — the one addition worth making is letting the *teen* see the same `ParentSafeProfile` view their parent sees, per the "teen-visible mirror" principle, so there's no gap between what's shared and what the teen knows is shared.
3. **`ai/llmClient.ts` + `mentor/AiMentorChat.tsx`**: confirm the model is prompted to always self-identify as AI if asked directly — worth a specific test, not just a system-prompt assumption.
4. **`school_api.rs`**: the K=5 anonymity guard is good; make sure it also can't be bypassed by repeated queries with overlapping-but-shifted cohorts (a classic k-anonymity attack — querying students 1-5, then 2-6, then 3-7 can sometimes isolate an individual through set intersection). Worth a specific test case for this.
5. **`backup/engine.ts`**: confirm exported backups are encrypted with a key the export mechanism doesn't also bundle in plaintext next to the file — a common mistake in "encrypted export" features.
6. **`security.yml`**: good that `cargo audit`/`npm audit` run weekly — consider adding a dedicated CI job that greps for the word "stealth" and fails the build if it reappears, as a lightweight guardrail against Fix 1 regressing again.

Once Fix 1 and Fix 2 are done and tested, you have a genuinely defensible, well-architected system — the Rust-level invariant enforcement pattern you're already using for other things is exactly the right tool for both fixes above. This isn't a rebuild; it's closing the gap between what the code currently does and what your own `docs/crisis-protocol.md` and consent architecture claim it does.
