# ADR 0002: Human-Gated Crisis Routing

## Context
PRERNA analyzes mood logs and conversation transcripts to detect signs of severe distress or imminent risk (e.g., self-harm). When such a signal is detected, the easiest technical path is to automatically alert a parent or emergency service. However, automated detection is prone to false positives, and autonomous escalation breaks the teen's trust in the platform as a safe space. 

## Decision
We will enforce a **Human-Gated Crisis Protocol**.
- Automated systems (like the AI mentor or keyword scanners) can only flag an event as `pending` in the `crisis_events` table.
- A licensed mental health professional (LCSW/LPC) MUST review the context.
- If risk is confirmed, the teen MUST be notified before the guardian is notified.
- This invariant is strictly enforced at the Rust compiler level via `PolicyEngine::enforce_guardian_notification_invariant`.

## Consequences
**Positive:**
- Protects the therapeutic alliance between the teen and the software.
- Prevents false positives from causing unnecessary familial trauma.
- Adheres to clinical best practices for pediatric intervention.

**Negative:**
- Requires operational overhead (a 24/7 on-call review queue by licensed professionals).
- Introduces slight latency between detection and escalation, mitigated by strict SLAs (e.g., 30 mins for high-risk flags).
