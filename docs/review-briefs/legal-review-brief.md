# PRERNA — DPDP Legal Review Brief

## Overview
PRERNA is a local-first AI application for Indian adolescents (ages 13–18). Because our target demographic consists of digital nagriks under the age of 18, we are building the application strictly around the constraints of the **Digital Personal Data Protection (DPDP) Act, 2023**. 

Before we can onboard our first Beta cohort, we require formal legal counsel to review our consent architecture and data processing flows.

## What We Need From You
Please review our compliance mapping document: `docs/dpdp-compliance-mapping.md`, as well as our application flow. We need your legal guidance on the following primary areas:

### 1. Verifiable Parental Consent Mechanism
Under the DPDP Act, processing data of individuals under 18 requires verifiable consent from a parent or lawful guardian. 
* **Current State:** Our current codebase uses a *simulated* mock-DigiLocker flow for demonstration purposes.
* **Your Task:** We need your guidance on what actual, implementable mechanism is legally sufficient for our Beta launch. Does it require full Aadhaar/DigiLocker integration? Is a verified email/SMS loop sufficient? We will build whatever mechanism you sign off on.

### 2. Behavioral Tracking & Targeted Advertising
The DPDP Act explicitly prohibits tracking and targeted advertising for users under 18.
* **Current State:** We have a mathematical invariant (a `PolicyEngine`) built into our core codebase that physically blocks the database from saving any user profile if `targeted_advertising` is set to `true` for an under-18 account. 
* **Your Task:** Please review our definition of "tracking" vs "assessment." We generate a psychometric `TraitProfile` (BigFive, RIASEC) to customize the app experience, but it never leaves the local device. Does this strictly avoid the definition of prohibited behavioral tracking under DPDP guidelines?

### 3. Data Sovereignty & Grievance Redressal
* **Current State:** We operate on a "local-first" architecture. SQLite databases are encrypted on the user's local device. We have built UI components (`DataDelete.tsx`, `DataExport.tsx`) that allow the user to instantly wipe all local data or export it in JSON format.
* **Your Task:** Are these mechanisms sufficient to satisfy the Right to Erasure and Right to Data Portability? Additionally, please review our `docs/governance/grievance-redressal.md` to ensure the reporting chain meets legal requirements.

## Next Steps & Logistics
- **Timeline:** [Insert expected turnaround time, e.g., 2 weeks]
- **Compensation:** [Insert compensation details, e.g., standard legal consulting rate]

1. Review `docs/dpdp-compliance-mapping.md`.
2. Provide a written response specifying the required changes to our consent flow and your recommended mechanism for verifiable parental consent.
3. Once we build the mechanism to your specifications, we will require your sign-off to proceed to the live Beta.
