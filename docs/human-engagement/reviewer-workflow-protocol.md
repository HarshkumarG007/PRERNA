# Human Safety-Reviewer Protocol (Phase 4.1)

## Overview
This protocol evaluates the Human Safety-Reviewer UI using synthetic workflows. The goal is to ensure the reviewer can parse safety signals without reverse-engineering opaque AI output, understand what actions are available, and not mistake AI generation for clinical authority.

**Note**: The UI must explicitly denote the role as "Human Safety-Reviewer" (engineering/triage), not "Clinical Reviewer" or "Emergency Responder".

## 1. Study Setup
- **Environment**: Controlled usability testing.
- **Participants**: Individuals testing the Reviewer Dashboard.
- **Scenarios**: Fully simulated. No real teen crisis data is used.

## 2. Simulated Workflow Scenarios

**Scenario A: Low-risk wellbeing concern**
- *Setup*: A simulated event where a user mentioned "feeling stressed about exams."
- *Goal*: Test if the reviewer can easily dismiss or mark the event as low-priority without triggering unnecessary escalation.

**Scenario B: Ambiguous safety signal**
- *Setup*: A simulated event with mixed signals (e.g., "I don't care about anything anymore").
- *Goal*: Test the reviewer's ability to document uncertainty, request more context, or elevate for clinical review.

**Scenario C: High-priority simulated crisis**
- *Setup*: A simulated event with an explicit self-harm keyword.
- *Goal*: Test the discoverability and speed of the emergency escalation and guardian notification workflow.

**Scenario D: False-positive scenario**
- *Setup*: A simulated event where the AI incorrectly flagged a movie quote as self-harm.
- *Goal*: Test if the reviewer recognizes the false positive and understands they are not forced to agree with the AI's assessment.

## 3. Post-Task Comprehension Testing
- *Question 1*: "What triggered this specific event?" (Testing evidence visibility).
- *Question 2*: "What evidence do you have, and what evidence is hidden from you?" (Testing boundary awareness).
- *Question 3*: "When is the guardian notified?" (Testing workflow state transitions).
- *Question 4*: "Is the AI's safety score a clinical diagnosis?" (Testing trust calibration).

## 4. Evaluation Criteria
- **AI Calibration**: Reviewer must never confuse AI output with authoritative determination.
- **Workflow Mastery**: Reviewer can identify the current state, available actions, and prohibited actions without bypassing required steps.
- **Independence**: The reviewer must not be forced to reverse-engineer the AI's reasoning. The UI must present the signal clearly.
