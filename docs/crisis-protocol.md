# PRERNA • Clinical Crisis Escalation Protocol

> **[DRAFT — PENDING INDEPENDENT CLINICAL REVIEW]**  
> **Governance Invariant:** Global Rule 0.7 (Human judgment cannot be self-certified by an AI agent)  
> **Associated Ticket:** H1 (`docs/task.md`)  
> **Technical Architecture Brief:** [`docs/crisis-protocol-brief.md`](crisis-protocol-brief.md)  
> **Clinical Dossier & Attestation:** [`docs/human-review-packets-and-dossiers.md#packet-h1`](human-review-packets-and-dossiers.md)  
> **Target Reviewer Profile:** Licensed Adolescent Clinical Psychologist / Child Psychiatrist (India-registered, RCI / NMC)  

---

## 1. Executive Summary & Clinical Boundaries

PRERNA (प्रेरणा) is a local-first adolescent self-discovery and wellbeing platform engineered for Indian youth aged 13–19. 

PRERNA **is not a diagnostic tool, clinical triage service, or emergency dispatch service**. The platform adheres to strict clinical boundaries:
1. **Zero Autonomous External Notification**: The software is structurally prohibited from autonomously dispatching external SMS, emails, or law enforcement notices.
2. **Immediate Safety Overrides**: When acute distress or self-harm signals are detected, the app immediately halts all gamified activities, challenges, and AI mentor conversations, presenting verified national crisis helplines.
3. **Teen-Informed Invariant (Rule 0.3)**: An adolescent must always be informed (`teen_informed_at`) prior to any guardian notification, protecting youth from domestic retaliation in hostile or abusive home environments.

---

## 2. Imminent Risk Indicators & Triage Categories

| Code | Risk Category | Operational Definition | System Action |
|---|---|---|---|
| **CRISIS-001** | Explicit Ideation with Intent or Plan | Natural language processing or regex detection of active suicide or self-harm intent (e.g. *"I want to end it today"*, *"mar jaunga"*, *"khudkushi"*). | Triggers safety overlay, presents 24/7 helplines, queues review event. |
| **CRISIS-002** | Severe Self-Injurious Behavior | Explicit disclosure of recent or ongoing severe self-harm requiring medical intervention. | Halts activities, displays somatic soothing and emergency contacts. |
| **CRISIS-003** | Chronic Precipitous Valence Collapse | 14 consecutive daily check-ins at lowest valence ($\le 25/100$) or a sudden $>40$ point plunge ending at $\le 25/100$. | Displays supportive check-in prompt and confidential counseling resources. |
| **CRISIS-004** | Imminent Threat to Others | Language indicating planned physical violence, weapons, or harm directed at others or school environments. | Halts activities, creates high-priority review item. |

---

## 3. Verified Indian Crisis Helplines (24/7 & Offline-Accessible)

The following national helplines are permanently embedded in the on-device client and remain accessible even without an active internet connection:

- **Unified Emergency Dispatch**: `112` (Police, Fire, Ambulance — Government of India)
- **Tele-MANAS**: `14416` or `1800-891-4416` (National Tele Mental Health Programme of India, 24/7 Toll-Free, 20+ Languages)
- **Childline India**: `1098` (Ministry of Women & Child Development, Emergency Child Protection, 24/7 Toll-Free)
- **KIRAN Mental Health Helpline**: `1800-599-0019` (Ministry of Social Justice & Empowerment, 24/7 Toll-Free)
- **Vandrevala Foundation**: `9999 666 555` (Crisis Intervention & Mental Health Support, 24/7)

---

## 4. Human Review Queue & Reviewer Qualifications

To satisfy the Definition of Done for Ticket H1, the human-in-the-loop review workflow requires:

1. **Reviewer Qualifications**:
   - Must hold a recognized clinical qualification (MPhil Clinical Psychology / MD Psychiatry / RCI / NMC registered).
   - Must be independently verified with active registration credentials recorded in the audit log.
2. **Review Triage Options**:
   - `reviewed_no_action`: Benign slang, fictional expression, or false positive (logged with reason).
   - `reviewed_resources_only`: Sub-clinical distress; non-intrusive coping skills and helplines surfaced.
   - `reviewed_guardian_notified`: Verified imminent danger; requires active confirmation that the teenager was informed first (`teen_informed_at`).

---

## 5. Reviewer Sign-Off Block (Ticket H1)

*This protocol remains in provisional draft status until signed by an independent licensed professional.*

```
CLINICAL REVIEWER SIGN-OFF (TICKET H1)

Clinician Name: _______________________________________________________
Registration / License No.: ___________________________________________
Professional Body (RCI / NMC / Other): ________________________________
Institution / Hospital: _______________________________________________
Contact Email / Phone: ________________________________________________

[ ] I have reviewed the crisis thresholds, triage SLA, and escalation rules.
[ ] I confirm this protocol aligns with Indian adolescent mental health standards.
[ ] Revisions or conditions attached (Yes / No).

Signature: ____________________________________ Date: _________________
```

