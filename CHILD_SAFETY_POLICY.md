# PRERNA — Child Safety Policy & Clinical Governance Framework

**Version:** 1.2.3  
**Classification:** Enterprise Clinical Governance & Safety Specification  
**Governing Standard:** India Protection of Children from Sexual Offences (POCSO) Act, Mental Healthcare Act 2017, DPDP Act 2023 §9  
**Target Audience:** Adolescents (13–17 Years), Guardians, Clinical Collaborators, Institutional Partners  

---

## 1. Safety Philosophy & Clinical Purpose

Adolescents experience profound biological, neurological, and emotional transitions. In an era dominated by hyper-stimulating algorithmic feeds, surveillance advertising, and digital social comparison, vulnerable youth frequently experience isolation, academic anxiety, and identity distress.

PRERNA is built as a **Sovereign Sanctuary** rooted in gentle self-compassion (*Atma-Jnana*). It rejects manipulative engagement mechanics and pathologizing labels.

---

## 2. The Seven Inviolable Child Safety Invariants

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              PRERNA CLINICAL SAFETY INVARIANTS                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Rule 0.1: Non-Pathologizing  │ Strictly no psychiatric diagnoses or medical labels.     │
│ Rule 0.2: Anti-Addiction     │ No infinite feeds; designed for 5-10 minute clarity.     │
│ Rule 0.3: Informed Trust     │ No covert parental alerts; adolescent informed first.    │
│ Rule 0.4: Ungated Helplines  │ Emergency numbers always accessible without login.       │
│ Rule 0.5: Severe-First Logic │ Severe ideation patterns evaluated before slang checks. │
│ Rule 0.6: Vernacular Depth   │ Devanagari & Hinglish distress markers supported.        │
│ Rule 0.7: Human Resolution   │ Algorithms cannot clear crises; human sign-off required.│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Rule 0.1 — Non-Diagnostic Boundary
PRERNA explicitly refuses to diagnose clinical mental health disorders (such as Major Depressive Disorder, Generalized Anxiety Disorder, PTSD, or Bipolar Disorder). It does not substitute for psychiatric or medical evaluation. All assessments are educational and strength-oriented reflections based on validated psychometric constructs (IPIP Big Five and O*NET RIASEC).

### Rule 0.2 — Respect for Real-World Living (Anti-Addiction Design)
The application employs zero dark patterns, no continuous notification cascades, no dopamine-chasing leaderboards, and no algorithmic recommendation feeds. The sanctuary is designed to help adolescents achieve somatic calm and mental clarity within 5 to 10 minutes, empowering them to return to their real lives.

### Rule 0.3 — Inviolable Trust & No Covert Parental Reporting
Decades of adolescent psychology confirm that covert surveillance destroys therapeutic alliance, driving distressed teenagers into hiding. Under Rule 0.3:
- Automated systems **never trigger covert parental notifications** behind the adolescent's back.
- If a high-severity crisis signal is detected, the protocol surfaces immediate support to the teen first.
- The invariant check `test_crisis_invariant_guardian_notification_blocked` mathematically enforces that no notification may be dispatched unless the adolescent's acknowledgement timestamp (`teen_informed_at`) is cryptographically recorded.

### Rule 0.4 — Always-On, Ungated Emergency Access
Emergency resources must never depend on user authentication, completed assessments, or algorithmic classification. The emergency helpline entry point (the Heart icon) is permanently anchored in the navigation header across every screen of the application.

### Rule 0.5 — Severe-Distress-First Pattern Evaluation
To eliminate clinical false negatives, the crisis pattern detector evaluates high-severity suicide, self-harm, and abuse patterns **before** executing benign colloquial slang filters. Compound phrases (such as *"that exam killed me, I want to kill myself"*) are strictly classified as high-severity distress events.

### Rule 0.6 — Vernacular & Cultural Linguistic Inclusivity
Adolescent distress expressions in India rarely occur exclusively in academic English. The crisis detection engine includes native Devanagari Hindi and phonetic Hinglish expressions (e.g., `"mujhe jeena nahi hai"`, `"मैं मरना चाहता हूँ"`, `"आत्महत्या करना चाहता हूँ"`).

### Rule 0.7 — Human-Only Crisis Event Resolution
Automated artificial intelligence models are strictly prohibited from declaring a crisis event resolved. Once an event transitions to `ActiveCrisis`, the backend state machine enforces that only an authenticated human reviewer possessing verified clinical credentials can claim and resolve the record (`test_ai_cannot_clear_crisis`).

---

## 3. Verified National Helplines Directory & Freshness SLA

All crisis resources in PRERNA are centralized in [`src/data/helplines.ts`](file:///c:/Users/Lenovo/Downloads/prerna/src/data/helplines.ts) and backed by statutory verification:

| Organization | Service Scope | Contact Number | Operating Hours | Government Authority | Source Verified Date |
|---|---|---|---|---|---|
| **National Emergency** | Pan-India Immediate Response | **`112`** | 24/7 (Toll-Free) | Ministry of Home Affairs | 2026-11-01 |
| **Tele-MANAS** | National Mental Health Helpline | **`14416`** / **`1800-891-4416`** | 24/7 (Toll-Free, 20+ Languages) | MoHFW / NIMHANS | 2026-11-01 |
| **Childline India** | Child Protection & Distress | **`1098`** | 24/7 (Toll-Free) | Ministry of Women & Child Dev. | 2026-11-01 |
| **KIRAN** | Mental Health Rehabilitation | **`1800-599-0019`** | 24/7 (Toll-Free) | DEPwD, Ministry of Social Justice | 2026-11-01 |
| **Vandrevala Foundation** | Suicide Prevention & Counseling | **`9999 666 555`** | 24/7 (Free Counseling) | Cyrus & Priya Vandrevala Fdn. | 2026-11-01 |
| **iCall Psychosocial** | Free Psychosocial Counseling | **`9152987821`** | Mon–Sat (10:00 AM – 8:00 PM) | Tata Institute of Social Sciences | 2026-11-01 |
| **NIMHANS Center** | Psychosocial Support & Care | **`080-46110007`** | 24/7 (Toll-Free) | National Institute of Mental Health | 2026-11-01 |

### Freshness SLA:
The automated test suite `src/tests/crisis/helplinesData.test.ts` runs on every CI build. It parses the ISO verification timestamps of all directory entries and **fails the build** if any contact number has not been re-verified against official government notices within **180 calendar days**.

---

## 4. Truthful Safety Disclosures (Unstaffed Operating Mode)

In accordance with Directive §4 and Audit Finding H-07:

1. **On-Device Coping & Direct Hotline Referral:**
   In its current sovereign local-first release, PRERNA provides immediate evidence-based somatic grounding exercises (4-7-8 Somatic Vagal Reset, Box Breathing, 3-Second Active Pause) and one-touch direct phone dialer integration to certified government helplines.
2. **No False Tele-Clinician Claims:**
   The product does **not** claim to provide live 24/7 in-house clinical monitoring or direct dispatch of emergency personnel. Marketing and UI copy has been rigorously sanitized to reflect truthful on-device safety planning.
3. **Emergency Escalation Activation:**
   Live cloud dispatch channels and institutional counselor queues remain pending formal clinical team onboarding and human-review gate completion (Tickets H1 & H2).

