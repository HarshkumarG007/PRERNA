# DPDP Compliance Technical Mapping

This document maps the non-negotiable requirements of the DPDP Act (specifically concerning adolescents under 18) to the precise architectural implementation in the PRERNA codebase. It serves as an audit reference for external legal counsel.

## 1. Verifiable Parental Consent (Section 9)

**Requirement**: Verifiable consent from a parent or lawful guardian is mandatory before processing any personal data of a minor.

**Implementation**:
- `src/components/consent/AgeDeclaration.tsx`: Collects the user's age. If under 18, triggers the parent verification flow.
- `src/components/consent/ParentConsentFlow.tsx`: [SIMULATED — NOT PRODUCTION READY] Enforces that an adult must complete the verification loop (e.g., via DigiLocker ID) before the system generates a valid `consentId`.
- `src/engine/consent/ageTierGate.ts`: Middleware that permanently halts all functionality (returning a `403` equivalent) if a session attempt is made without a resolved `consentId`.

## 2. Prohibition on Behavioral Profiling / Targeted Ads (Section 9)

**Requirement**: Strict prohibition on tracking or behavioral monitoring for targeted advertising directed at children.

**Implementation**:
- `src/db/schema.sql`: Our schema entirely lacks any advertising-id tracking tables, third-party pixel ingestion endpoints, or cross-site tracking flags.
- **Architectural Guarantee**: PRERNA uses a "Transparent Assessment Engine" instead of stealth telemetry.

## 3. Disclosed Data Collection (Transparent Assessment)

**Requirement**: Every distinct data collection mechanism must provide explicit notice in plain language (Section 7 equivalent).

**Implementation**:
- `src/engine/assessment/disclosures.ts`: Central registry containing plain-language texts (in English and Hindi).
- `src/engine/consent/sessionGate.ts`: The `validateSessionCreation` function is the gatekeeper. **Global Rule 0.1-2** ensures that no component (e.g., `LifeQuests.tsx`, `SkillArena.tsx`, `MoodMirror.tsx`) can start an assessment session without providing a matching `disclosureShownId`. 

## 4. Safety Escalation & Teen Transparency

**Requirement**: If the system detects a threat to life/safety, the escalation must balance parental rights with the teen's right to be informed.

**Implementation**:
- `src/engine/crisis/patternDetection.ts`: Flags crisis events as `pending` strictly for human review. Takes no autonomous action.
- `src/components/crisis/HumanReviewQueue.tsx`: Admin dashboard where a clinician makes the final call.
- `src/engine/crisis/escalationRouter.ts`: Enforces **Global Rule 0.1-3**, strictly validating that no guardian is notified unless (1) the human reviewer explicitly approved it, and (2) the `teenInformedAt` timestamp is populated.

## 5. Data Subject Rights (Access & Erasure)

**Requirement**: The adolescent (or parent) must be able to view all collected data and request its deletion.

**Implementation**:
- `src/components/dashboard/SharedDashboardView.tsx`: Guarantees that the Parent and the Teen see the exact same trait profiles and activity history.
- `src/components/settings/DataExport.tsx`: Self-service tool generating a JSON blob of all local data.
- `src/components/settings/DataDelete.tsx`: Direct self-service wipe of the local SQLite database.
