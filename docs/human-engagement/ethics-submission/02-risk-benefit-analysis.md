# 02. Risk-Benefit Analysis

**Status:** DRAFT — NOT APPROVED

## 1. Minimal Risk Classification
The Phase 4 Formative Usability Study is designed to meet the criteria for **minimal risk** research. The probability and magnitude of harm or discomfort anticipated in the research are not greater than those ordinarily encountered in daily life or during the performance of routine online application usage.

## 2. Potential Risks and Mitigations

| Identified Risk | Probability | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Privacy Misunderstanding**<br>Teenager believes their data is private when it is accessible to guardians, or vice versa. | Low-Medium | Moderate | Evaluated directly via the "Teach-Back" protocol in the moderator script. Study relies entirely on synthetic/mocked inputs rather than requiring real personal disclosures. |
| **Unexpected Sensitive Disclosure**<br>Participant shares real-life distress or clinical information with the moderator. | Low | High | Standardized script strictly limits psychological probing. Implementation of the **Sensitive-Content Hard Stop** (Protocol 01, Sec 8.6). Presence of a documented escalation pathway to a Designated Safeguarding Lead (DSL). |
| **Generative AI Hallucination/Harm**<br>The AI mentor provides inappropriate or harmful responses. | Zero | None | **AI Mentor is explicitly mocked/unavailable** for this phase. No live inference occurs. |
| **Data Breach**<br>Loss of participant study data. | Low | Moderate | Study is conducted on provisioned devices/accounts. PRERNA employs local-first SQLite/SQLCipher encryption. No PII is collected beyond the required consent/assent forms, which are stored separately in secured institutional drives. |
| **Coercion to Participate**<br>Teen feels obligated to participate due to parental or researcher pressure. | Low | High | Assent is reaffirmed verbally at the start of the session. The participant is explicitly told they may stop at any time without penalty or need for explanation. |

## 3. Potential Benefits
- **Direct Benefits to Participants:** There are no direct therapeutic or clinical benefits to the participants in this usability study. 
- **Benefits to Society/Science:** The insights gathered will directly inform the architectural privacy boundaries, consent mechanisms, and user-experience safeguards of digital mental wellbeing tools for adolescents in India. Iterative refinement based on teenager comprehension is critical before moving to efficacy or clinical evaluations.
