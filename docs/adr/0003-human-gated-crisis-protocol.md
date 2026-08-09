# ADR 0003: Human-Gated Crisis Protocol

## Status
Accepted

## Context
When the system detects a potential self-harm or crisis signal from a minor (via NLP pattern matching on chat/journal inputs), there is a tension between immediate intervention (notifying a guardian automatically) and the risk of false positives that could breach the minor's trust or out them in an unsafe environment.

## Decision
We implement a strictly **Human-Gated Crisis Escalation Protocol**. The system is mechanically prohibited from autonomously notifying a guardian.
- The `CrisisRouter` enforces that a valid `reviewer_credentials_ref` (proof of clinical/school authority review) is provided to resolve an event.
- The system enforces a mandatory `teen_informed_at` timestamp, proving the minor was notified of the disclosure intent *before* any data is released to a guardian.
- Only upon human reviewer validation and teen notification is the `decision = 'escalate'` permitted to execute the disclosure.

## Consequences
- **Positive:** Protects minors from algorithmic false positives and unauthorized disclosures. Maintains therapeutic trust.
- **Negative:** Introduces latency into the crisis response pipeline. We rely on the designated clinical/educational reviewer (configured by the tenant) to act promptly.
