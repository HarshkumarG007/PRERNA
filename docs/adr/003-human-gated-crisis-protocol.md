# ADR 003: Human-Gated Crisis Protocol Escalation

## Status
Accepted

## Context
When PRERNA detects an imminent threat of harm (suicidal ideation, severe self-harm), it must act to protect the user. However, autonomous AI systems are prone to hallucinations (false positives). More critically, automatically and instantly notifying a guardian without human context can trigger extreme danger if the guardian is the source of the abuse. 

## Decision
We rejected fully autonomous algorithmic escalation. Instead, crisis events trigger a "pending" state in a local Human Review Queue. A certified human clinician MUST review the context and make a clinical decision.
Furthermore, we enforce an invariant at the Rust IPC boundary (`PolicyEngine::enforce_guardian_notification_invariant`): the system will permanently block the dispatch of a guardian notification unless the teen has been explicitly informed first (`teen_informed_at` is not null).

## Consequences
- **Positive:** Prevents algorithmic harm and respects the adolescent's agency by ensuring they are never blindsided by a guardian notification.
- **Positive:** Introduces licensed clinical accountability to the escalation path.
- **Negative:** Introduces an SLA delay (e.g., 30-90 minutes) between detection and guardian notification, requiring robust operational staffing to monitor the human review queue.
