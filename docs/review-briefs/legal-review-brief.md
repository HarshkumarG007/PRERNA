# PRERNA Legal, Privacy & Consent Architecture Review Brief

**Document status:** For Independent Legal Review
**Project:** PRERNA — Personalized Real-time Engagement & Neural Resource Assistant
**Repository:** https://github.com/HarshkumarG007/PRERNA
**Primary jurisdiction:** India
**Review scope:** DPDP-aligned architecture, adolescent data handling, guardian consent, data minimization, retention, deletion, disclosure, and external-service boundaries
**Requested reviewer:** Qualified Indian legal/privacy counsel

---

## 1. Purpose of This Review

PRERNA is designed as a local-first desktop application for adolescent self-discovery and support.

The architecture intentionally minimizes external transmission of sensitive user information. However, the project does **not** claim legal compliance merely because technical controls exist.

This review requests qualified legal counsel to independently evaluate the architecture and determine the requirements necessary before real adolescent users are onboarded.

This document is an engineering-to-counsel handoff and **is not legal advice or a declaration of DPDP compliance**.

---

## 2. Materials for Review

Please review, at minimum:

* `docs/dpdp-compliance-mapping.md`
* `docs/parental-verification-architecture.md`
* `docs/disclosure-language-review.md`
* `docs/crisis-protocol.md`
* `docs/review-briefs/legal-review-brief.md`
* Consent-related frontend components
* Rust consent service and verification adapter
* Database schema concerning parent/teen relationships
* Data export and deletion implementation
* Relevant privacy/security architecture documentation

Counsel may request additional implementation evidence.

---

## 3. Core Architecture

PRERNA is designed around the following privacy principles:

### Local-First Processing

Core psychological profile information, assessment information, and AI mentor conversation state are intended to remain on the user's device.

### Encryption

Sensitive local information is stored using encrypted SQLite/SQLCipher storage.

### Data Minimization

The system attempts to avoid retaining unnecessary raw behavioral or conversational information.

### Explicit Disclosure

Assessment activities are intended to disclose what they measure before profile-relevant collection begins.

### Teen Visibility

The teen should be able to understand what information is visible to a guardian through the parent-facing experience.

### Backend Authorization

The renderer is treated as untrusted. Privileged authorization decisions are performed by the Rust backend.

---

## 4. Guardian Consent Architecture

The current technical design introduces a provider-independent abstraction:

```text
Parent/Guardian
      ↓
Verification Provider
      ↓
GuardianVerificationAdapter
      ↓
Normalized Consent Record
      ↓
ConsentService
      ↓
Encrypted Local Database
      ↓
Parent–Teen Relationship
```

The architecture deliberately separates:

1. identity/guardian verification;
2. consent capture;
3. consent record storage;
4. authorization to access permitted parent-facing functionality.

The development implementation includes a mock email verification adapter.

The mock adapter is intended for development/testing only and is guarded against production use.

**A simulated verification mechanism must not be used to establish consent for real adolescent users.**

---

## 5. Legal Questions Requiring Review

### A. Applicable Law and Regulatory Classification

Please determine which Indian laws, rules, regulations, contractual obligations, sectoral requirements, and child-data requirements apply to the proposed product and operating model.

Please specifically assess the applicability and implementation requirements arising under India's Digital Personal Data Protection framework and associated rules/guidance, as applicable at the time of review.

### B. Child / Adolescent Data

Please review:

* definition and treatment of child users;
* age verification requirements;
* guardian/parent consent requirements;
* responsibilities of the relevant data fiduciary;
* restrictions on processing children's data;
* behavioral monitoring and profiling considerations;
* targeted-content or advertising implications, if any.

### C. Consent Verification

Please determine what constitutes sufficient guardian verification for the intended product.

Potential mechanisms may include a suitable government identity/authorization provider or another legally acceptable verification mechanism.

The engineering team intentionally does **not** select a production provider without legal review.

Please specify:

* acceptable verification methods;
* required evidence;
* retention requirements;
* verification expiry;
* revocation behavior;
* audit requirements;
* third-party contractual requirements.

### D. Data Retention

Please review retention periods for:

* consent records;
* verification metadata;
* assessment information;
* psychological profile information;
* crisis events;
* audit logs;
* exported data.

Please identify any information that should not be retained or should have shorter retention periods.

### E. Parent/Guardian Visibility

PRERNA intentionally avoids exposing raw psychological profiles to guardians.

The proposed parent-facing experience provides limited, safety-appropriate information while ensuring that the teen can see what the guardian sees.

Please review whether this model is legally sufficient and identify any mandatory disclosures or access rights.

### F. Crisis Escalation

Please review the legal implications of:

```text
Detection
→ Human Review
→ Teen Notification
→ Guardian Notification
```

Please determine:

* when guardian notification may be permissible or required;
* whether additional consent or disclosure is necessary;
* what emergency exceptions may apply;
* what records must be retained;
* whether external emergency services introduce additional obligations.

### G. Data Export and Deletion

Please review the implementation and proposed user controls for:

* access;
* correction;
* withdrawal/revocation of consent;
* deletion;
* export;
* relationship termination;
* account closure.

Please identify statutory or regulatory exceptions to deletion where applicable.

---

## 6. Third-Party Service Boundary

The engineering architecture is designed so that a production verification provider can be integrated through an adapter rather than directly coupling the application to one vendor.

Before production integration, counsel should review:

* provider terms;
* data-processing terms;
* privacy policy;
* cross-border data flows;
* subprocessors;
* security obligations;
* breach notification requirements;
* data retention/deletion behavior;
* contractual allocation of responsibility.

No provider should be represented as legally approved merely because its API is technically compatible.

---

## 7. Consent Lifecycle

The intended lifecycle is:

```text
Pending
   ↓
Verification Initiated
   ↓
Verified / Active
   ↓
Expired
   ↓
Revoked
```

The database records the consent relationship and associated lifecycle metadata rather than treating consent as a permanent boolean.

Revocation is intended to immediately prevent subsequent parent-view authorization.

Please confirm whether this lifecycle sufficiently represents the legal requirements or whether additional states, timestamps, evidence, or audit records are required.

---

## 8. Development / Production Boundary

The following distinction must remain explicit:

| Capability                 | Development                        | Production                              |
| -------------------------- | ---------------------------------- | --------------------------------------- |
| Mock verification          | Allowed                            | **Not allowed**                         |
| Real guardian verification | Not required                       | Required                                |
| Legal review               | Not required for local development | **Required before real cohort**         |
| Clinical review            | Not required for engineering tests | **Required for crisis workflow**        |
| Synthetic crisis data      | Allowed                            | Allowed for testing                     |
| Real adolescent data       | Not permitted for unapproved beta  | Permitted only after required approvals |

---

## 9. Requested Legal Deliverable

Please provide one of the following outcomes:

### APPROVED

The proposed architecture may proceed for the defined scope, subject to any stated conditions.

### APPROVED WITH CONDITIONS

The architecture may proceed only after specified legal changes are implemented.

### NOT APPROVED

The architecture should not be used with real adolescent participants until specified deficiencies are addressed.

Please identify:

* applicable legal/regulatory framework;
* required changes;
* required operational policies;
* required contractual documents;
* required notices/consent language;
* acceptable guardian verification mechanism;
* retention requirements;
* breach/incident obligations;
* grievance/contact requirements;
* any restrictions on beta deployment.

---

## 10. Important Limitation

Passing automated security tests, implementing encryption, or maintaining local-first storage does **not** establish legal compliance.

Likewise, this document does not constitute legal advice.

Production onboarding remains blocked until qualified counsel has reviewed the actual implementation and provided the required approval or conditions.

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

**Required Legal / Compliance Changes:**

---

---

---

**Signature:** ______________________________________
