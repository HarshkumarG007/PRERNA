# 01. Research Protocol

**Status:** DRAFT — NOT APPROVED

This document outlines the step-by-step procedure for conducting the Phase 4 Formative Usability Study.

## 1. Study Setting
The study will be conducted in a controlled environment (in-person or secure remote video conference with screen sharing). The environment ensures privacy for the participant while allowing the moderator to observe interface interactions.

## 2. Participant Configuration
- Participants will use a provisioned PRERNA prototype build where external network calls are mocked.
- AI LLM inference is explicitly mocked (unavailable) to prevent unbounded generative responses during testing.
- Test accounts will be pre-provisioned or created dynamically using synthetic identifiers.

## 3. Study Flow
1. **Introduction & Assent:** Reviewing the study purpose and securing recorded assent/permission.
2. **Onboarding Walkthrough:** Observing the user complete the initial PRERNA setup.
3. **Task Navigation:** Asking the user to complete specific non-clinical tasks (e.g., viewing the Skill Arena, checking privacy settings).
4. **Teach-Back Assessment:** Verifying the user's comprehension of privacy boundaries.
5. **Debriefing:** Closing the session and answering questions.

---

## 8. Standardized Moderator Script

This script is strictly enforced to minimize leading questions, coercion, accidental therapeutic interaction, and moderator-dependent interpretation. **Moderators must not improvise around sensitive disclosures.**

### 8.1 Opening
> "Hello [Name]. Thank you for helping us test this new software prototype called PRERNA today. My job is to see how easy or confusing the app is to use. I didn't design the app, so you can't hurt my feelings. We want to know exactly what you think, especially when something doesn't make sense."

### 8.2 Consent/Assent Confirmation
> "Before we start, I want to remind you that your participation is completely voluntary. You can stop at any time, for any reason, and you don't have to explain why. Do you still want to participate?"

### 8.3 Privacy Teach-Back
> "Take a look at this privacy screen. In your own words, who do you think can see the information you type into this section?"
> *(If incorrect or unsure)*: "Let me clarify: [Correct explanation]. Does that make sense?"

### 8.4 Prototype Task Introduction
> "I am going to give you a few scenarios. Please interact with the app as if you were doing this at home. Please think out loud and tell me what you are trying to click on and why."

### 8.5 Neutral Probes
*(To be used exclusively instead of psychological or leading questions)*
- > "What, if anything, would you expect this screen to do next?"
- > "What is this page telling you?"
- > "How did you know to click there?"
- > "What are you looking for right now?"

### 8.6 Sensitive-Content Hard Stop
*(If a participant begins disclosing unexpected, real-life sensitive or distressing information not required by the UI task)*
> "Thank you for sharing that with me. I want to gently remind you that today we are just testing how the software buttons and screens work, and this isn't a counseling session. I want to make sure your personal information stays private. Let's return to the app's menu screen."

### 8.7 Unexpected Disclosure Procedure
*(If a participant discloses an active, imminent threat to life or safety)*
> "Because you've shared that you might be in immediate danger, I have to pause our software test. As we discussed in the consent form, my priority is your safety. I am going to connect with [Designated Safeguarding Lead / Guardian] right now so we can get you the right support." *(Follow adverse event reporting pathway in Protocol 06)*.

### 8.8 Closing/Debrief
> "That's all the tasks we have for today. Thank you so much for your help. Do you have any questions for me about the software or what we did today?"
