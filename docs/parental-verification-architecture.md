# Production Guardian Verification Architecture

> **LEGAL DISCLAIMER:** This document describes the technical architecture and interface for guardian verification. **It does not assert that any specific provider or flow is legally sufficient under the DPDP Act or other regulations.** The final implementation and selection of verification providers are strictly subject to qualified legal review and provider availability.

## 1. Overview and Design Philosophy

PRERNA requires verifiable parental or guardian consent before enabling core assessment and conversational features for adolescents. To future-proof the application against regulatory changes and varying provider availability (e.g., Aadhaar APIs, DigiLocker, credit card verification flows), the verification architecture is intentionally designed as a **provider-independent interface**.

### 1.1 Provider-Independent Interface

```text
PRERNA Consent Service
        │
        ▼
Guardian Verification Adapter
        │
 ┌──────┼─────────┐
 ▼      ▼         ▼
Provider A   Provider B   Future Provider
```

The core backend only interacts with the `GuardianVerificationAdapter`, which normalizes the output of downstream providers into a standard `ConsentRecord`.

## 2. Requirements & Specification

### 2.1 Identity & Relationship Verification
* **Guardian Identity Verification Requirements:** The provider must assert that the individual granting consent is a verified adult (18+). The adapter must not store government IDs directly; it should only store the cryptographic assertion (token/reference ID) provided by the identity provider.
* **Age/Relationship Verification Requirements:** Where possible, the provider must assert a parental or guardianship relationship to the adolescent. If the provider only verifies age, the system must securely log the self-attested relationship alongside the verified age token.

### 2.2 Consent Capture
* **Consent Capture:** The system must present a clear, plain-language disclosure of what data is collected, why it is collected, and how it is processed (Section 7 DPDP). 
* **Consent Timestamp:** The exact UTC timestamp of the consent action must be recorded and signed.
* **Consent Version:** The `disclosure_version` (e.g., `v1.0`) must be explicitly tied to the consent record. Changes to the disclosure require re-consent.
* **Purpose of Processing:** Consent must be explicitly tied to the PRERNA operational requirements (telemetry, AI processing) and must not bundle unrelated processing.
* **Data Minimisation:** The adapter must request only the minimum required claims (e.g., `is_adult`, `relationship`) and discard any excess data returned by the provider (e.g., address, full date of birth).

### 2.3 Lifecycle Management
* **Revocation:** The architecture must support soft-revocation. If consent is revoked, the system transitions to `consent_status = 'revoked'`, halting all data collection and locking the teen's profile, but preserving the audit trail.
* **Expiration/Re-consent:** Consent tokens may have a time-to-live (TTL). If the provider specifies an expiration, or if PRERNA pushes a new privacy policy (new `disclosure_version`), the consent transitions to `expired`, requiring re-verification.
* **Deletion/Retention:** If a user exercises their right to be forgotten, the `ConsentRecord` is scrubbed of PII, leaving only an anonymized cryptographic hash to prove historical compliance without retaining identity data.

### 2.4 Error Handling & Fallbacks
* **Failed Verification:** If a provider returns a failed verification, the attempt is logged securely for rate-limiting, and the teen is denied access to gated features.
* **Provider Failure:** If a provider API is unreachable, the adapter must fail closed. No "grace period" or offline consent is permitted.

### 2.5 Security & Trust
* **Verification Evidence Retention:** The system must retain the provider's transaction ID, the timestamp, and the consent schema version. It must **not** retain the raw identity documents.
* **Audit Trail:** All consent state changes (granted, revoked, expired) must be written to an append-only audit log in the local SQLite database.
* **Third-Party Data Sharing:** The PRERNA backend will not share generated profile telemetry with the verification provider. The data flow is strictly one-way (Provider -> PRERNA).
* **Encryption:** The `ConsentRecord`, like all sensitive database tables, is encrypted at rest using the user's local application key.
* **Backend Trust Boundary:** The `ConsentService` operating within the Rust backend is the ultimate source of truth. The frontend cannot arbitrarily set `consent_granted = true`; it can only pass the provider's token to the Rust backend for cryptographic validation.
* **Threat Model:** The primary threats are (1) adolescents bypassing the gate using synthetic/forged provider tokens, and (2) unauthorized data extraction. The adapter mitigates (1) by validating the token directly against the provider's public keys (where applicable) and (2) by avoiding the storage of raw PII.
