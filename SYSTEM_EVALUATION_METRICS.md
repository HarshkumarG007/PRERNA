# PRERNA - System Self-Evaluation Metrics & KPIs

This document establishes the quantitative baseline for evaluating the performance, safety, and efficacy of the PRERNA platform. It provides objective targets (SLAs/KPIs) that Large Language Models (like Claude) and developers can use to measure the success of architectural or feature modifications.

---

## 1. Technical Performance Metrics

Given PRERNA's zero-knowledge, local-first constraint, technical efficiency is the primary bottleneck.

| Metric | Definition | Target SLA | Criticality |
| :--- | :--- | :--- | :--- |
| **Offline Inference Latency** | Time to first token (TTFT) when interacting with the AI Mentor using the bundled LLaMA model. | `< 800ms` | High |
| **Offline Inference Speed** | Generation speed of the local AI Mentor on consumer-grade hardware (e.g., M1 Mac / Ryzen 5). | `> 15 tokens/sec` | High |
| **Database Read/Write Latency** | Time to decrypt SQLCipher memory space, execute a schema query, and return JSON payload via Tauri IPC. | `< 40ms` | Medium |
| **Bundle Size Overhead** | The total size of the final `.msi` or `.dmg` installer without the LLM weights. | `< 35MB` | Medium |
| **RAM Utilization (Idle)** | Memory consumed by the Tauri Webview and Rust backend when the AI is not active. | `< 150MB` | High |
| **RAM Utilization (AI Active)**| Memory consumed during local LLM inference (assuming a 3B parameter quantized model). | `< 3.5GB` | Critical |

---

## 2. Clinical Safety & DPDP Compliance

These metrics evaluate the reliability of the `escalationRouter.ts` and the privacy firewall (`parent/permissions.ts`).

| Metric | Definition | Target SLA | Criticality |
| :--- | :--- | :--- | :--- |
| **Escalation SLA (Time-to-Alert)** | Time from the moment a user submits a log triggering a severe risk threshold to the moment the Guardian Dashboard is flagged. | `< 2.0 seconds` | Critical |
| **Crisis Detection Sensitivity** | The True Positive Rate (TPR) of the regex and heuristic NLP router identifying clinical distress signals (e.g., self-harm ideation). | `> 99.5%` | Critical |
| **Crisis False Positive Rate (FPR)**| How often normal teen venting is incorrectly flagged as an active crisis requiring escalation. | `< 10.0%` | Medium |
| **DPDP Breach Rate** | Number of instances where raw `UnifiedProfile` data leaks into the `ParentSafeProfile` payload without explicit teen consent. | `0 (Zero Tolerance)`| Critical |
| **K-Anonymity Compliance** | Verification that the `school_api.rs` correctly blocks queries if `N < k_threshold`. | `100% Pass Rate` | Critical |

---

## 3. Cognitive Efficacy (The Fusion Engine)

These metrics evaluate how successfully the Stealth Assessments (Mini-Games) map to clinical psychological models.

| Metric | Definition | Target SLA |
| :--- | :--- | :--- |
| **Trait Correlation Efficacy** | The statistical correlation coefficient (r) between a user's derived Big Five score in PRERNA vs. their score on a validated clinical survey (e.g., IPIP-NEO-120). | `r > 0.75` |
| **Algorithmic Volatility** | How much a user's underlying Big Five trait fluctuates day-over-day based on a single game session (should be low due to rolling averages). | `< 5% variance` |
| **RIASEC Discovery Rate** | Percentage of users whose top 2 RIASEC traits identified by PRERNA align with their self-reported dream career clusters. | `> 80% match` |
| **Assessment Completion Rate**| The percentage of teenagers who complete all 4 Skill Arena modules compared to those who drop out of a traditional 50-question survey. | `> 85% completion`|

---

## 4. User Engagement & Retention

These metrics define if the platform is actually engaging enough for a teenager to use voluntarily.

| Metric | Definition | Target SLA |
| :--- | :--- | :--- |
| **AI Mentor Chat Depth** | The average number of conversational turns (user message + AI response) per mentor session. | `> 6 turns` |
| **Mood Mirror MAU Retention** | Percentage of users who log their emotional state at least 4 times a week for a full month. | `> 40%` |
| **Stealth Assessment Replayability** | Average number of times a user voluntarily plays a `SkillArena` module after they have already completed it once. | `> 2.5 times` |

---

## 🔬 How LLMs Should Use This Document

When an AI agent is evaluating a proposed PR/Feature for PRERNA:
1. **Check Performance Limits**: Will this new feature push the Idle RAM above 150MB? If so, refactor.
2. **Verify Clinical Rules**: Does this code change affect the `escalationRouter.ts`? If so, verify it cannot cause the Sensitivity to drop below 99.5%.
3. **Assess DB Calls**: Does this feature add synchronous decryption overhead that breaches the 40ms IPC latency limit?
