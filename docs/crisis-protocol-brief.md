# Clinical Technical Brief: Crisis Protocol & Safety Architecture
## PRERNA — Personalized Real-time Engagement & Neural Resource Assistant

**Status:** ⏳ TECHNICAL BRIEF PREPARED — 🚫 BLOCKED: Awaiting Qualified Clinical Reviewer Sign-off (Ticket H1)  
**Governance Invariant:** Global Rule 0.7 (Human judgment cannot be self-certified by an AI agent)  
**Target Collaborator:** Licensed Adolescent Clinical Psychologist / Child Psychiatrist (India-registered, RCI / NMC)  
**Date Prepared:** 2026-10-29  

---

## 1. Purpose of This Technical Brief

This brief is prepared by the engineering agent to outline the exact software, schema, and routing architecture governing crisis detection in PRERNA. 

The software **does not and must not autonomously contact parents or police**. Every safety indicator detected by PRERNA creates a pending item in a dedicated human clinical review queue. 

**This document specifies the technical boundaries. A licensed human clinician must independently draft and sign off on the clinical escalation protocol (`docs/crisis-protocol.md`).**

---

## 2. Technical Invariants Enforced in Code

The following invariants are implemented at the SQLite/SQLCipher and Rust backend layers (`src-tauri/src/commands/mod.rs` and `src/engine/crisis/patternDetection.ts`):

1. **Global Rule 0.1-3 (No Autonomous Notification Pipeline)**:
   - When distress language or a declining mood trajectory is detected, the only software action permitted is creating a `CrisisEvent` row with `state = 'HumanReview'`.
   - The software is structurally prohibited from firing external SMS, email, or parent notifications autonomously.
2. **Global Rule 0.1-3b (Teen-Informed Invariant)**:
   - A clinician cannot resolve an event with `decision = 'GuardianNotified'` unless the database record contains a valid timestamp `teen_informed_at`.
   - The teen must always be spoken with / informed first before any guardian notification can be dispatched, protecting adolescents in abusive or hostile households.
3. **Medical Credential Audit Logging**:
   - Every resolution action requires the reviewer's registration number (e.g. `RCI-CR-XXXXX` or `MCI-XXXXX`). This is logged permanently to the append-only `audit_logs` table.

---

## 3. Database Schema Requirements (`crisis_events`)

```sql
CREATE TABLE IF NOT EXISTS crisis_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    detected_at TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('high', 'medium')),
    state TEXT NOT NULL CHECK (state IN ('HumanReview', 'Escalate', 'Monitor', 'Cleared')),
    origin TEXT NOT NULL CHECK (origin IN ('CHAT', 'MOOD', 'EXTERNAL')),
    reviewer_id TEXT,
    reviewer_credentials_ref TEXT,
    decision TEXT CHECK (decision IN ('GuardianNotified', 'ResourcesOnly', 'NoAction', NULL)),
    teen_informed_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
```

---

## 4. Current Detection Capabilities (Pattern Detection Engine)

Implemented in [`src/engine/crisis/patternDetection.ts`](file:///c:/Users/Lenovo/Downloads/prerna/src/engine/crisis/patternDetection.ts):

1. **Text Distress Patterns**:
   - Severe self-harm & suicide ideation (English & Hinglish: `marna chahta hoon`, `mar jaunga`, `zeher`, `khudkushi`).
   - Physical abuse, threat, and extortion indicators (`touching me inappropriately`, `beat me`, `blackmail`, `pareshan kar raha hai`).
   - Substance misuse indicators (`overdose`, `weed`, `ganja`, `charas`).
2. **Negative Controls (Colloquialism Suppression)**:
   - Filters out benign adolescent slang: *"I'm dying of laughter"*, *"that math exam killed me"*, *"spicy food hurts"*, *"I am dead"*.
3. **Longitudinal Mood Trajectory**:
   - Detects severe chronic distress: 3 consecutive check-ins $\le 25$ on the 0-100 valence scale.
   - Detects precipitous collapse: $> 40$ point drop from baseline ending in $\le 25$.

---

## 5. Required Clinical Inputs from External Human Collaborator (H1 Ticket)

The licensed mental-health professional must independently author or review and approve:

| Required Clinical Input | Description | Status |
|---|---|---|
| **Imminent Risk Definitions** | Specific clinical criteria differentiating acute suicidal intent requiring immediate human contact vs passive distress. | ⏳ Pending H1 Collaborator |
| **Response SLA** | Maximum allowable latency (e.g. 15 minutes, 1 hour) for human review queue triage during operating hours. | ⏳ Pending H1 Collaborator |
| **Adolescent Disclosure Language** | Compassionate, non-punitive language shown to the adolescent when in-app mental health resources or counselor handoffs are initiated. | ⏳ Pending H1 Collaborator |
| **Emergency Escalation Protocol** | Clinical operating procedure if adolescent is actively unresponsive during an imminent-risk incident. | ⏳ Pending H1 Collaborator |
| **Emergency Helplines Verification** | Ongoing verification of national Indian adolescent helplines (KIRAN: `1800-599-0019`, Vandrevala Foundation: `9999-666-555`, NIMHANS). | ⏳ Pending H1 Collaborator |

---

## 6. Audit & Sign-off Gate

Per **Global Rule 0.7**, this technical brief remains in state `BLOCKED: awaiting external review` until a licensed professional reviews and signs off on the final clinical protocol (`docs/crisis-protocol.md`). No agent may self-certify this ticket.

