# Crisis Escalation Protocol (Clinical Specification)

> **[DRAFT — PENDING CLINICAL REVIEW]**
> *Provenance Note: Drafted on 2026-08-06 as a provisional specification. The thresholds and criteria outlined below are proposals awaiting formal review and sign-off by a licensed mental health professional (LCSW/LPC or equivalent).*

## 1. Imminent Risk Indicators
*A case is flagged as `pending` in the `crisis_events` table if ANY of the following strict criteria are met.*

### CRISIS-001: Explicit Ideation with Intent/Plan
Status: PROVISIONAL
Clinical reviewer: NONE
Last reviewed: —

**Definition:** Natural language processing detects specific phrases indicating active suicidal ideation with a plan or intent (e.g., "I can't do this anymore and I know how to end it", "I want to die today"). Passive ideation (e.g., "I wish I wasn't here") triggers a resource nudge, but not an immediate human review escalation.

### CRISIS-002: Active Severe Self-Harm
Status: PROVISIONAL
Clinical reviewer: NONE
Last reviewed: —

**Definition:** Explicit disclosure of recent, severe self-injurious behavior requiring medical attention.

### CRISIS-003: Sustained Severe Depressive Signal (PHQ-9 equivalent)
Status: PROVISIONAL
Clinical reviewer: NONE
Last reviewed: —

**Definition:** 14 consecutive days of the lowest possible valence score in the Mood Mirror, combined with a total absence of engagement in PRERNA's proactive activities.

### CRISIS-004: Imminent Threat to Others
Status: PROVISIONAL
Clinical reviewer: NONE
Last reviewed: —

**Definition:** Explicit language indicating a planned, immediate threat of violence against specific individuals or a school.

## 2. Human Review Process
*The protocol for counselors reviewing the `pending` queue.*

- **Reviewer Qualifications**: Must be a Licensed Clinical Social Worker (LCSW), Licensed Professional Counselor (LPC), or equivalent, with specific training in pediatric crisis intervention.
- **SLA/Turnaround Time**:
  - **High Severity (Ideation/Threat)**: Reviewed within 30 minutes of generation, 24/7.
  - **Moderate Severity (Sustained Low Mood)**: Reviewed within 4 hours during local business hours.
- **Actions**:
  - `reviewed_no_action`: False positive (e.g., teen is discussing a fictional story).
  - `reviewed_resources_only`: Sub-clinical distress. App seamlessly nudges the teen toward the Coping Skills module.
  - `reviewed_guardian_notified`: Confirmed imminent risk. The escalation protocol is triggered immediately.

## 3. Escalation Protocol (`reviewed_guardian_notified`)
1. **Teen Notification**: An un-dismissible, compassionate modal appears in the teen's app informing them that a counselor is concerned for their safety and is contacting their guardian. Provides immediate crisis hotline numbers (e.g., KIRAN: 1800-599-0019, Vandrevala Foundation, iCall).
2. **Guardian Notification**: An automated, high-priority alert (SMS and Email) is sent to the verified parent/guardian containing the specific reason for escalation and recommended immediate steps.
3. **School Notification (If applicable)**: If the teen is part of a school deployment and the threat involves the school environment, the designated school counselor is simultaneously alerted.

## 4. Disclosed Language
*Exact text shown to the teen and parent at consent time about this protocol.*

- **Teen Text**: "PRERNA is a safe space, but it's not a secret space if you're in danger. If you tell us something that suggests you are in immediate danger of hurting yourself or someone else, a trained counselor on our team will review it. If they agree you need immediate help, we will tell you, and then we will contact your parent/guardian to make sure you are safe."
- **Parent Text**: "To protect your child, PRERNA utilizes an automated safety net. If our systems detect an imminent risk to your child's safety (such as explicit threats of self-harm), a licensed mental health professional will review the context. If the risk is confirmed, your child will be informed, and you will be immediately notified via SMS and Email to intervene. PRERNA is an early-warning system, not a replacement for emergency medical services."
