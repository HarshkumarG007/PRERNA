# 05. Data Management and Privacy

**Status:** DRAFT — NOT APPROVED

> **Regulatory/ethical alignment:** This document identifies relevant Indian legal and ethical frameworks for institutional review. It does not assert that PRERNA, the prototype, the study protocol, or the investigators are legally compliant or that ethics approval has been granted. Applicability and final interpretation remain subject to the reviewing institution/IEC and qualified legal/privacy review.

## 1. Relevant Frameworks
This protocol acknowledges and references the following frameworks governing data protection and research ethics in India:
- **Digital Personal Data Protection Act, 2023 (DPDP Act)** (Regarding notice, consent, verifiable parental consent for children's data, security safeguards, and data principal rights).
- **Digital Personal Data Protection Rules, 2025** (G.S.R. 846(E), notified 13 November 2025).

> [!WARNING]
> **DPDP Commencement & Schedule IV Blockers:**
> 1. The project uses the enacted DPDP Act and notified Rules as a design and risk-analysis framework. Applicability, commencement, exemptions, and obligations for the proposed research arrangement must be confirmed by qualified legal counsel based on the actual Data Fiduciary, processing activities, institutional arrangement, and study dates. The phased commencement provisions are **not treated as a blanket exemption/safe harbor**.
> 2. **Schedule IV applicability unresolved:** PRERNA must not rely on any Schedule IV exemption unless qualified legal counsel determines that the relevant Data Fiduciary, processing purpose, and conditions actually satisfy the final Rule 12/Schedule IV text. Exemptions are **not assumed to apply**, and PRERNA must not be redesigned to exploit an exemption. No exemption is being relied upon for recruitment or operation unless legal review establishes applicability.

- **ICMR National Ethical Guidelines for Biomedical and Health Research Involving Human Participants (2017)**.
- **ICMR National Ethical Guidelines for Biomedical Research Involving Children (2017)**.
- **ICMR Ethical Guidelines for Application of Artificial Intelligence in Biomedical Research and Healthcare (2023)**.

## 2. Data Inventory
During the Formative Usability Study, the following data types will be handled:
1. **Administrative Data:** Names and contact information of guardians for recruitment and consent (Stored separately from study data).
2. **Prototype Data:** Synthetic or mock inputs entered into the PRERNA interface during the usability tasks. 
3. **Observational Data:** Researcher notes on usability, comprehension, and UI friction.

## 3. Data Lifecycle & Local-First Architecture
- **In the Prototype:** The PRERNA application is built on a local-first architecture utilizing an encrypted SQLite/SQLCipher database. Data entered during the usability test remains on the local device.
- **Mocked Components:** The AI LLM inference is explicitly mocked (unavailable) for this study to prevent uncontrolled data generation or transmission. Guardian verification mechanisms (e.g., external identity providers) are similarly mocked.
- **In the Study:** Observational notes will not contain direct identifiers (names, emails). Participants will be assigned a randomized Study ID.

## 4. Deletion and Retention (Crisis Events)
- **Current Prototype State:** The system currently hard-deletes user data and associated crisis events upon account deletion via `ON DELETE CASCADE`. 
- **Pending Policy:** Whether future production deployments should retain de-identified safety-event records is an unresolved governance decision and is not determined by this prototype.

## 5. Withdrawal Handling
If a participant withdraws consent:
1. The study session immediately terminates.
2. The local database on the provisioned test device is wiped.
3. Any observational notes linked to the participant's Study ID are destroyed prior to aggregation.
