# PRERNA Clinical Safety & Crisis Protocol Review Brief

**Document status:** For Independent Clinical Review
**Project:** PRERNA — Personalized Real-time Engagement & Neural Resource Assistant
**Repository:** https://github.com/HarshkumarG007/PRERNA
**Review scope:** Crisis detection, escalation, human-review workflow, teen notification, guardian notification, and safety boundaries
**Requested reviewer:** Licensed mental-health professional / appropriately qualified clinical reviewer

---

## 1. Purpose of This Review

PRERNA is a privacy-first adolescent self-discovery and support application. It is **not a diagnostic system, medical device, psychotherapy platform, or substitute for professional care**.

This review is requested to independently evaluate whether the proposed crisis-safety architecture, terminology, detection criteria, escalation workflow, and user-facing communications are clinically appropriate for the intended adolescent context.

The engineering team has implemented technical enforcement mechanisms, but **technical implementation must not be interpreted as clinical validation**.

Clinical approval remains an external human decision.

---

## 2. Materials for Review

The reviewer is requested to examine, at minimum:

* `docs/crisis-protocol.md`
* `docs/synthetic-crisis-drill-runbook.md`
* `docs/review-briefs/clinical-review-brief.md`
* Crisis-related Rust backend and policy-engine implementation
* Teen-facing crisis notifications
* Guardian escalation workflow
* Relevant assessment and AI-mentor safety disclosures
* Automated crisis invariant tests

The reviewer may request additional source files, test evidence, screenshots, or demonstrations.

---

## 3. Clinical Questions Requiring Review

Please evaluate the following:

### A. Crisis Detection Criteria

Are the proposed risk indicators:

* clinically meaningful;
* appropriately conservative;
* understandable in an adolescent context;
* sufficiently bounded to avoid treating ordinary distress as a crisis;
* sufficiently sensitive to avoid obvious dangerous omissions?

Please identify any indicators that should be removed, added, renamed, weighted differently, or restricted to human review.

### B. False Positives and False Negatives

Please assess the potential consequences of:

* incorrectly flagging an adolescent as high risk;
* failing to flag an adolescent who may require urgent support;
* repeated low-confidence flags;
* ambiguous or contradictory signals.

Please recommend appropriate safeguards where necessary.

### C. Human Review Requirement

PRERNA is designed so that automated detection **does not independently authorize guardian notification**.

The intended workflow is:

```text
Signal Detection
      ↓
Pending Crisis Event
      ↓
Qualified Human Reviewer
      ↓
Reviewer Claims Event
      ↓
Clinical/Safety Assessment
      ↓
Resolution
      ↓
Teen Notification
      ↓
Guardian Notification, where authorized and appropriate
```

Please evaluate whether this workflow is clinically appropriate and whether additional human decision points are required.

### D. Teen Notification

Please review whether the proposed notification language:

* avoids unnecessary alarm;
* avoids implying a diagnosis;
* preserves dignity and autonomy;
* clearly communicates what happened;
* explains what information may be shared;
* provides appropriate next steps.

### E. Guardian Notification

Please evaluate the proposed circumstances under which guardian notification may occur.

In particular, please assess whether the architecture appropriately balances:

* adolescent safety;
* confidentiality;
* informed participation;
* parental/guardian involvement;
* severity and immediacy of risk.

### F. AI Mentor Safety Boundary

PRERNA's local AI mentor is intended as a supportive conversational interface.

It must not:

* diagnose mental-health conditions;
* represent itself as a clinician;
* independently determine that an adolescent is safe;
* replace emergency or professional services;
* independently authorize crisis escalation.

Please review the relevant safety language and escalation boundaries.

---

## 4. Technical Safety Invariants

The engineering implementation currently intends to enforce the following invariants:

1. A crisis event begins in a pending state.
2. A reviewer must claim the event before resolving it.
3. An unclaimed event cannot be resolved.
4. Guardian notification cannot occur before the required teen-notification state.
5. Guardian notification cannot bypass the required human-review state.
6. Authentication and authorization are enforced by the Rust backend rather than trusting renderer-supplied identity.
7. Crisis-related state transitions are subject to backend policy enforcement.
8. Synthetic tests exercise both permitted and prohibited state transitions.

These are **engineering invariants**. The reviewer is specifically asked to determine whether the underlying clinical workflow represented by those invariants is appropriate.

---

## 5. Review Deliverable Requested

Please provide one of the following outcomes:

### APPROVED

The clinical design is acceptable for the defined scope, subject to any listed conditions.

### APPROVED WITH CONDITIONS

The architecture may proceed only after specified clinical changes are completed.

### NOT APPROVED

The current design should not be used with real adolescent participants until specified deficiencies are addressed.

Please include:

* reviewer name;
* professional qualification;
* organization, if applicable;
* date of review;
* sections reviewed;
* findings;
* required changes;
* optional recommendations;
* explicit approval status;
* signature or equivalent verifiable approval.

---

## 6. Important Limitation

This document does **not** request the reviewer to certify PRERNA as a medical device, diagnostic system, or clinical treatment platform.

The requested review is limited to the safety and clinical appropriateness of the proposed adolescent-support and crisis-escalation mechanisms.

No real adolescent beta cohort should be represented as clinically validated solely because the engineering tests pass.

---

## 7. Engineering Evidence

Automated tests and security controls demonstrate implementation behavior; they do not establish clinical efficacy.

The engineering team will preserve the test results and reviewer's findings as separate evidence.

**Clinical sign-off remains an external human dependency.**

---

## Reviewer Sign-Off

**Reviewer:** ______________________________________

**Qualification:** __________________________________

**Organization:** __________________________________

**Date:** __________________________________________

**Decision:**

* [ ] APPROVED
* [ ] APPROVED WITH CONDITIONS
* [ ] NOT APPROVED

**Conditions / Required Changes:**

---

---

---

**Signature:** ______________________________________
