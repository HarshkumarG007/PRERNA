# PRERNA Cognitive Architecture Contract

This document defines the strict constitutional boundaries for PRERNA's AI and cognitive subsystems. These invariants must be enforced by the Rust type system and database schema, not merely by LLM prompts. 

If integrating a new LLM or AI capability requires violating these boundaries, the architecture has failed.

## The Core Philosophy
**The system must never confuse what it observed, what it inferred, and what it believes.**

- **Evidence** is observation. It is immutable and governed by strict disclosure limits.
- **Inference** is deduction. It depends completely on evidence and must be revoked if evidence expires.
- **Hypothesis** is possibility. It is the structured generation of ideas.
- **Critique** is adversarial evaluation. It exists to invalidate bad hypotheses.
- **Decision** is authorization. It is the explicit, gated transition to an action.

## AI Authority Boundaries

The AI operates under a principle of least privilege. It acts as an orchestrator of possibilities, not a decider of consequences.

| Action | AI Authority | Enforced By |
| :--- | :--- | :--- |
| **Observe** | ✓ (Within explicit consent) | `RawEvidence` tracking |
| **Infer** | ✓ | `DerivedInference` generation |
| **Hypothesize** | ✓ | `HypothesisGenerator` |
| **Criticize** | ✓ | `KillCritic` (Independent prompt/model) |
| **Recommend** | ✓ | Un-authorized `Decision` proposals |
| **Authorize** | ✗ | `Decision::new_authorized` & `PolicyGate` |
| **Escalate** | ✗ | `CrisisState` transition limits |
| **Notify** | ✗ | Backend-owned `RecipientResolver` |
| **Change Identity** | ✗ | Tauri IPC Authentication Context |
| **Bypass Policy** | ✗ | Hard-coded Rust `GateStatus` |

## The Crisis Invariant
The Crisis Escalation workflow is the most dangerous path in the system. The AI may detect signals and request a human review, but **it may not unilaterally escalate a crisis or dispatch a notification**.

1. AI cannot transition a crisis state from `HUMAN_REVIEW` to `ESCALATE`.
2. No notification may be dispatched without a persisted, authorized escalation decision.
3. Notification infrastructure failures must never revert the state of an authorized escalation.
4. Duplicate crisis signals cannot generate duplicate notifications.
5. God Mode cannot silently bypass the crisis state machine or audit logs.
