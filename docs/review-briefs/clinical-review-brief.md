# PRERNA — Clinical Review Brief

## Overview
PRERNA is a local-first AI application designed to support self-discovery and emotional awareness for Indian adolescents (ages 13–18). It includes an offline Large Language Model (LLM) that users can converse with. 

While the system is strictly **non-diagnostic** and focuses on emotional regulation (e.g., grounding exercises, yoga philosophy), it inevitably faces the risk of users disclosing self-harm or suicidal ideation during chat sessions. 

We have engineered a **Crisis Escalation Protocol**, but **we require a licensed mental health professional (LCSW, LPC, Clinical Psychologist, or equivalent)** to review and approve the protocol before we can launch our beta.

## What We Need From You
Please review our internal protocol document: `docs/crisis-protocol.md`. Specifically, we need your clinical judgement on the following:

1. **Trigger Criteria:** Are the keywords and semantic matches we use to flag an "imminent crisis" appropriate? What are we missing?
2. **SLA and Human-in-the-Loop:** When a crisis is flagged, the system freezes the chat and places the event in a secure queue for human review. Is our proposed SLA (response time) appropriate?
3. **Disclosure Language:** When the system detects a crisis, it displays a hardcoded message providing the KIRAN Mental Health Helpline (1800-599-0019). Is the tone, language, and referral appropriate for adolescents in India?
4. **Guardian Notification:** We have a strict invariant: A guardian *cannot* be automatically notified by the system until a human reviewer confirms the crisis *and* the teen has been informed that their guardian is being contacted. Is this flow clinically sound?

## System Capabilities (Context for the Reviewer)
To help you understand what the system *can* and *cannot* do, please note:
* **The AI does NOT generate crisis responses.** Once a crisis is detected (either by keyword or by our AI safety filter), the generative AI is entirely locked out. The response is a hardcoded, static string that you have the power to edit and approve.
* **We have a Reviewer Dashboard.** Human reviewers (like yourself or clinical moderators) have an interface where they can view the flagged message and make one of three decisions:
  - `Dismissed` (False positive)
  - `Reviewed_ResourcesOnly` (Sub-clinical distress; nudges the teen to Coping Skills modules)
  - `GuardianNotified` (True crisis; triggers guardian alert).
* **We track `reviewer_credentials_ref`.** The system technically enforces that no crisis can be resolved without logging the credentials of the human who reviewed it.

*Note: Please do not take the above capabilities on faith. We are happy to provide a live demo of the application or share the mathematical test outputs (unit tests) proving these invariants cannot be bypassed.*

## Next Steps & Logistics
- **Timeline:** [Insert expected turnaround time, e.g., 2 weeks]
- **Compensation:** [Insert compensation details, e.g., standard hourly clinical consulting rate]

1. Read `docs/crisis-protocol.md`.
2. Provide a list of required changes, edits to the disclosure language, or structural feedback on the escalation flow.
3. Once your changes are implemented, we will require a formal sign-off (with your name and date) to unblock our Beta launch.

Thank you for helping us ensure PRERNA is a safe environment for adolescents.
