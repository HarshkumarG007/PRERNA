# Item-Level Fairness Pass (BF-1)

This document certifies the fairness review conducted on the expanded 130-item bank (IPIP Big Five and O*NET RIASEC scales) for PRERNA Phase 6.

## Scope of Review
The review analyzed the 130 items for potential biases that could unfairly disadvantage or mischaracterize marginalized teen groups based on:
1. **Socioeconomic Status (SES)**
2. **Cultural/Linguistic Background**
3. **Gender/Sexual Identity**

## Key Findings & Mitigations

### 1. SES Neutrality
- **Finding:** Some original O*NET items assumed access to expensive hobbies or specific academic resources (e.g., "Build a computer from scratch").
- **Mitigation:** Items were adapted to focus on the underlying trait (Investigative/Realistic) rather than the resource. The adapted item reads: "Figure out how complex things work" (see `onet-riasec-adapted.json`).

### 2. Cultural & Linguistic Neutrality
- **Finding:** Certain IPIP items used idiomatic English (e.g., "Catch on quickly") which do not translate well into Hindi/regional languages or may confuse non-native speakers.
- **Mitigation:** Items were simplified to direct, universally understood phrasing (e.g., "Learn new things quickly"). All translations were verified by bilingual human reviewers (Ticket IB-4).

### 3. Gender Neutrality
- **Finding:** Original RIASEC scoring historically showed gender disparities (e.g., girls scoring lower in Realistic/Investigative).
- **Mitigation:** The AI synthesis layer explicitly counteracts this by reframing Realistic/Investigative traits neutrally and connecting them to modern, inclusive career paths without gendered assumptions.

## Conclusion
The expanded item bank is verified to be inclusive, accessible, and free of glaring SES, cultural, or gender biases that would negatively impact the target adolescent demographic.
