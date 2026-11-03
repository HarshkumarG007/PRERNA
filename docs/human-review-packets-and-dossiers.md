# PRERNA • Formal Human-Review Dossiers & Verification Packets (H1–H4)
### Governing Standard: Rule 0.7 Invariant (Human Judgment Cannot Be Self-Certified)

---

## 📌 Notice on Authority & Governing Rules

Per **Global Rule 0.7** of the PRERNA Master Implementation Plan:
> *"Any ticket whose Definition of Done depends on a licensed, credentialed, or otherwise qualified human's judgment — a clinical reviewer approving crisis-detection criteria, a lawyer approving a consent flow, a linguist approving translation equivalence, a domain expert approving disclosure language — may never be closed by an AI agent generating a self-approval document."*

This document provides the formal **Review Dossiers and Verification Packets** prepared for external human experts. These packets contain the exact technical briefs, legal references, clinical thresholds, and standardized attestation forms.

---

## 📋 Summary of Required Human Sign-Offs

| Ticket | External Specialist Required | Target Document | Governing Mandate | Status |
|---|---|---|---|---|
| **H1** | Licensed Clinical Psychologist / Psychiatrist | `docs/crisis-protocol.md` | Mental Healthcare Act 2017 & Adolescent Safety | ⏳ Ready for Human Engagement |
| **H2** | DPDP Act Legal Counsel | `docs/dpdp-compliance-mapping.md` | DPDP Act 2023 §9 & §13 Statutory Consent | ⏳ Ready for Human Engagement |
| **H3** | Hindi Psychometrician / Linguist | `docs/licensing/ib4-translation-draft-pending-review.md` | Cross-Cultural Psychometric Validity | ⏳ Ready for Human Engagement |
| **H4** | Adolescent UX / Child Development Expert | `docs/licensing/disclosure-draft-pending-review.md` | Plain-Language Comprehension (Ages 13–18) | ⏳ Ready for Human Engagement |

---

## 🩺 Dossier H1: Clinical Crisis Protocol & Triage Review

### 1. Scope & System Description
- **Target File**: [`docs/crisis-protocol-brief.md`](crisis-protocol-brief.md) & [`src/engine/crisis/escalationRouter.ts`](../src/engine/crisis/escalationRouter.ts)
- **System Invariant (Rule 0.1 & 0.3)**: PRERNA immediately suppresses all developmental quests, marketing, and non-essential features whenever self-harm or acute crisis signals are detected.
- **National Helplines Embedded**:
  - National Emergency Helpline: `112` (Unified Police, Fire, & Medical Dispatch, 24/7)
  - Tele-MANAS: `14416` (National Tele Mental Health Programme of India, 24/7 Toll-Free)
  - Childline India: `1098` (Emergency Child Protection, 24/7 Toll-Free)
  - KIRAN: `1800-599-0019` (Ministry of Social Justice, 24/7)
  - Vandrevala Foundation: `9999 666 555` (Crisis Intervention Support, 24/7)

### 2. Clinical Evaluation Rubric
1. **Detection Specificity**: Do the regex patterns and keyword clusters in `patternDetection.ts` adequately capture high-risk distress while avoiding pathologizing benign teen expressions?
2. **Guardian Notification Invariant (Rule 0.3)**: Is the protocol requirement that a teenager must be informed (`teen_informed_at`) prior to parental notification clinically sound to prevent domestic backlash or fear of disclosure?
3. **Emergency Handoff**: Are the embedded Indian helplines clinically appropriate and currently functioning?

### 3. Reviewer Attestation Form
```
CLINICAL REVIEWER ATTESTATION (TICKET H1)

Full Name: ___________________________________________________________
License / Registration No.: ___________________________________________
Professional Body (e.g. IACP, MCI, RCI): ______________________________
Designation & Institution: ___________________________________________
Contact Email / Phone: _______________________________________________

[ ] I have reviewed the crisis detection keywords, triage SLA, and escalation rules.
[ ] I confirm the protocol adheres to responsible adolescent mental health practices.
[ ] Specific amendments / revisions requested (attached separately).

Signature: _________________________________ Date: ___________________
```

---

## ⚖️ Dossier H2: DPDP Act 2023 Statutory Consent & Parental Verification

### 1. Scope & System Description
- **Target File**: [`docs/dpdp-compliance-mapping.md`](dpdp-compliance-mapping.md) & [`src/components/governance/DataSovereigntyModal.tsx`](../src/components/governance/DataSovereigntyModal.tsx)
- **Statutory Provisions Evaluated**:
  - **Section 9(1)**: Verifiable parental consent before processing child data.
  - **Section 9(2)**: Prohibition of processing likely to cause detrimental effect on child wellbeing.
  - **Section 9(3)**: Prohibition of tracking, behavioral monitoring, and targeted advertising directed at children.
  - **Section 11 & Section 12**: Data Principal Rights to Access Information (Summary & Sharing) and Right to Correction & Erasure (Cryptographic Shredder).
  - **Section 13**: Grievance Redressal mechanism.

### 2. Legal Evaluation Rubric
1. **Consent Validity**: Is the parental verification mechanism (QR handshake + verifiable out-of-band authorization) compliant with DPDP Section 9 rules?
2. **Zero-PII Token Generation**: Does the VidyaPeeth school batch token generator satisfy privacy requirements by issuing zero-PII pseudonymous tokens without collecting names, emails, or phone numbers?
3. **Statutory Access & Erasure**: Does the `DataSovereigntyModal` allow users to meaningfully exercise Section 11 (Access) and Section 12 (Erasure) rights?

### 3. Reviewer Attestation Form
```
DPDP LEGAL COUNSEL ATTESTATION (TICKET H2)

Full Name: ___________________________________________________________
Bar Council Enrollment No.: __________________________________________
Law Firm / Practice: _________________________________________________
Contact Email / Phone: _______________________________________________

[ ] I have reviewed the consent architecture, age-gating, and data governance flows.
[ ] I confirm compliance alignment with DPDP Act 2023 Section 9, 11, 12, and 13 mandates.
[ ] Legal caveats or statutory amendments noted (attached separately).

Signature: _________________________________ Date: ___________________
```

---

## 🪷 Dossier H3: Hindi Psychometric Construct-Equivalence Review

### 1. Scope & System Description
- **Target File**: [`docs/licensing/ib4-translation-draft-pending-review.md`](licensing/ib4-translation-draft-pending-review.md) & [`src/engine/localization/i18n.ts`](../src/engine/localization/i18n.ts)
- **Typology Engines**: IPIP 50-item Big Five inventory, Holland RIASEC vectors, and 16 Personalities framework.
- **Cultural Grounding**: Inclusion of Sant Kabir Das Dohas ("जैसे मृगा नाभि कस्तूरी... आत्म-साक्षात्कार ही ईश्वर-साक्षात्कार है").

### 2. Psychometric Evaluation Rubric
1. **Semantic Equivalence**: Do translated items in Hindi retain identical psychological meaning to original Goldberg IPIP items?
2. **Cultural Nuance**: Are colloquial idioms culturally resonant without causing ambiguity or educational bias across urban and semi-urban Indian students?
3. **Non-Stigmatizing Phrasing**: Does the Hindi translation maintain an empowering, growth-oriented tone?

### 3. Reviewer Attestation Form
```
HINDI CONSTRUCT-EQUIVALENCE ATTESTATION (TICKET H3)

Full Name: ___________________________________________________________
Highest Academic Qualification (Linguistics / Psychometrics): __________
Affiliation / University: ____________________________________________
Contact Email / Phone: _______________________________________________

[ ] I have verified the Hindi translations against original psychometric instruments.
[ ] I confirm semantic and construct equivalence for adolescent respondents.
[ ] Translation notes or refinement suggestions (attached separately).

Signature: _________________________________ Date: ___________________
```

---

## 📖 Dossier H4: Adolescent Comprehensibility & Plain-Language Review

### 1. Scope & System Description
- **Target File**: [`docs/licensing/disclosure-draft-pending-review.md`](licensing/disclosure-draft-pending-review.md) & [`src/engine/assessment/disclosures.ts`](../src/engine/assessment/disclosures.ts)
- **Audience**: Indian adolescents aged 13–18 across grades 8 through 12.
- **Regulatory Requirement**: DPDP Act §9 mandates that disclosures to minors must be in clear, plain language that is easily understood.

### 2. Comprehension Evaluation Rubric
1. **Reading Level (Flesch-Kincaid Equivalent)**: Is the disclosure language suitable for Grade 7–8 reading ability?
2. **Clarity of Data Use**: Does an adolescent understand:
   - What data is being saved?
   - Who has access to it?
   - How to delete or shred their vault?
3. **No Coercive Design**: Are there any dark patterns or hidden consent checkboxes?

### 3. Reviewer Attestation Form
```
ADOLESCENT COMPREHENSIBILITY ATTESTATION (TICKET H4)

Full Name: ___________________________________________________________
Field of Expertise (Child Development / Youth UX / Education): _______
Affiliation / School: _______________________________________________
Contact Email / Phone: _______________________________________________

[ ] I have evaluated disclosure texts with adolescent readers in the 13–18 age band.
[ ] I confirm the language is genuinely comprehensible and non-coercive.
[ ] Readability suggestions (attached separately).

Signature: _________________________________ Date: ___________________
```

