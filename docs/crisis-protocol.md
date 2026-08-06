# Crisis Escalation Protocol (Framework)

> **[BLOCKED: REQUIRES HUMAN REVIEW]**
> This document must be co-authored with a qualified mental-health professional. 
> The engineering team has provided the structural requirements below. The clinical team must fill in the criteria.

## 1. Imminent Risk Indicators
*Define the specific, narrow set of indicators that trigger a `pending` case in the `crisis_events` table.*

- **Sustained Low Mood Signal**: [CLINICAL DEFINITION REQUIRED - e.g., N consecutive days of negative sentiment in Mood Mirror]
- **Concerning Language in Mentor**: [CLINICAL DEFINITION REQUIRED - e.g., explicit mention of self-harm, severe isolation]
- **Other Indicators**: [CLINICAL DEFINITION REQUIRED]

## 2. Human Review Process
*Define how a trained counselor reviews the `pending` queue.*

- **Reviewer Qualifications**: [CLINICAL DEFINITION REQUIRED]
- **SLA/Turnaround Time**: [CLINICAL DEFINITION REQUIRED]
- **Actions**:
  - `reviewed_no_action`: False positive.
  - `reviewed_resources_only`: Reiterate Step 1 resources to the teen.
  - `reviewed_guardian_notified`: Genuine imminent risk requiring adult intervention.

## 3. Disclosed Language
*Exact text shown to the teen and parent at consent time about this protocol.*

- **Teen Text**: "If you share something that suggests you are in immediate danger, a trained professional on our team will review it. If they agree you need immediate help, we will tell you, and then we will contact your parent/guardian to make sure you are safe."
- **Parent Text**: "If our systems detect an imminent risk to your child's safety, a trained professional will review the context. If the risk is confirmed, your child will be informed, and you will be immediately notified to intervene."
