# Guardian Formative Usability Protocol (Phase 4.1)

## Overview
This protocol evaluates whether parents/guardians can correctly predict PRERNA's privacy boundaries and understand the system's behavior, particularly regarding their limited access to their teen's data.

## 1. Study Setup
- **Environment**: Controlled usability testing environment (in-person or remote moderated).
- **Goal**: Measure guardian expectation vs. actual PRERNA architecture. It is crucial to determine if a guardian interprets PRERNA's privacy model as a "bug" or a feature.

## 2. Testing Disagreement Scenarios
Guardians will be presented with the prototype or interactive mockups covering specific scenarios, designed to test edge cases and potential disagreement.

**Scenario 1: Initial Access Expectation**
- *Prompt*: "You have successfully linked your account to your teen's. Where do you go to read their chat logs?"
- *Observation*: Observe if they expect full conversation access and how they react when the UI explains they cannot access it.

**Scenario 2: Boundary Discovery**
- *Prompt*: "Review the guardian dashboard. What information does the system provide to you?"
- *Observation*: Ensure they recognize that only high-level safety signals and consent records are shared.

**Scenario 3: Consent Revocation**
- *Prompt*: "You have decided you no longer want your teen using PRERNA. How do you revoke consent?"
- *Observation*: Test the discoverability of the revocation flow and their understanding of the resulting data deletion.

**Scenario 4: Safety Escalation**
- *Prompt*: "You receive an alert that PRERNA has detected a safety concern. What do you do?"
- *Observation*: Test their comprehension of the escalation notification and recommended actions.

**Scenario 5: Unauthorized Access Request**
- *Prompt*: "You are concerned about a specific topic and want to request more information from the reviewer. How does the system respond?"
- *Observation*: Test their understanding of why the system rejects unauthorized access to protected conversations.

## 3. Post-Task Comprehension Testing
- *Question*: "Why can't you read your child's private AI conversation?"
- *Success Criteria*: The guardian understands the clinical/privacy rationale for the boundary, even if they personally disagree with it. They correctly predict the system's privacy behavior.

## 4. Evaluation Criteria
- **Access Boundaries**: Guardian correctly predicts they cannot read raw chat logs.
- **Consent**: Guardian understands how to revoke consent and the consequences.
- **Safety Workflow**: Guardian understands their role in a safety escalation.
