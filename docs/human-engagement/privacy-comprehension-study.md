# Privacy Comprehension Study (Phase 4.2)

## Overview
This study rigorously tests whether users (teens and guardians) actually comprehend PRERNA's architectural privacy guarantees, specifically local-first encryption and the exact boundaries of guardian access.

## 1. Study Focus
The study tests the actual deployment configuration, avoiding marketing interpretations like "your data is private."

## 2. Teach-Back Evaluation Protocol

**Q1: Storage Location**
- *Prompt*: "Where do you think your PRERNA conversation is stored?"
- *Classification*: Correct (On this device) / Incorrect (In a PRERNA database / Cloud)

**Q2: Access Boundaries**
- *Prompt*: "Who do you think can access the raw text of your conversation?"
- *Classification*: Correct (No one / Only me) / Incorrect (My parents / PRERNA staff)

**Q3: External AI Services**
- *Prompt*: "Does PRERNA send your conversation to an external AI service like OpenAI or Google?"
- *Classification*: Correct (No, it runs locally) / Incorrect (Yes). Note: If the deployment configuration changes to use remote services, this question and the expected answer must be updated to reflect the exact current truth.

## 3. Evaluation Criteria
- **Privacy Misconception**: If a user incorrectly identifies who can read their messages, this is a critical UX failure. The UI explaining privacy guarantees must be redesigned and re-tested until comprehension reaches an acceptable threshold.
