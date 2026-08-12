# Crisis Expectations Study (Phase 4.2)

## Overview
This study evaluates user (teen and guardian) expectations regarding emergency interventions, ensuring that they understand the limits and pathways of PRERNA's safety escalations.

## 1. Study Focus
**IMPORTANT**: This study evaluates *expectations* using synthetic scenarios described by the moderator. **No real crises will be induced or simulated by the teen participant.**

## 2. Teach-Back Evaluation Protocol

**Q1: Escalation Pathway**
- *Prompt*: "If PRERNA detects a serious safety concern from something you typed, what do you expect to happen next?"
- *Classification*: Correct (A human reviewer checks it, my parents might be told) / Incorrect (The police are called immediately / PRERNA ignores it).

**Q2: AI Calibration & Trust**
- *Prompt*: "Is the AI's safety score a clinical diagnosis?"
- *Classification*: Correct (No, it's just an algorithm) / Incorrect (Yes, the AI is a doctor).

**Q3: Reversibility / Disagreement**
- *Prompt*: "What happens if PRERNA thinks there is a safety concern, but it made a mistake?"
- *Classification*: Correct (The human reviewer will see it was a mistake) / Incorrect (Unsure / Guardian is automatically panicked).

## 3. Evaluation Criteria
- **Safety Expectation Mismatch**: If users consistently expect automated 911 dispatch or believe the AI is a licensed clinician, there is a severe trust calibration failure. The UI must explicitly clarify the role of the human reviewer and the limits of the AI. Mandatory review is required before proceeding.
