# Teen Formative Usability Protocol (Phase 4.1)

## Overview
This protocol evaluates a highly constrained vertical slice of the PRERNA experience for adolescent users (13-17). The primary goal is to assess comprehension of privacy boundaries, guardian visibility, and AI limitations.

## 1. Study Setup
- **Environment**: Controlled usability testing environment (in-person or remote moderated).
- **Safety**: An ethics/safeguarding gate MUST be cleared before conducting this session. The moderator must be trained in adolescent interviewing.
- **Scenario**: Participants will be guided through a *synthetic, non-sensitive* workflow. **Do not** ask participants to provide real emotional distress data.
- **Topic**: "Imagine you are choosing between three school subjects for next year, and you want PRERNA's help to decide."

## 2. Vertical Slice Workflow
The participant will interact with the prototype in the following order:
1. **Install & Identity**: Launch the app and create an account.
2. **Consent Explanation**: Review the data practices and verification requirement.
3. **Onboarding**: Complete the initial profile setup.
4. **Activity**: Complete one non-sensitive self-discovery activity (e.g., academic interests).
5. **AI Reflection**: Have a brief text-based conversation with the AI Mentor regarding the academic choice.
6. **Privacy Boundary**: Review the UI explaining what data is stored and what is shared with guardians.

## 3. Post-Task Comprehension Testing (Teach-Back Method)
Instead of asking "Do you understand?", the moderator will use teach-back questions. 

**3.1 Privacy Comprehension**
- *Question*: "Imagine you send a private message to PRERNA about a hobby. Who do you think can read that message?"
- *Success Criteria*: User correctly identifies that only they can read it (assuming no safety risk), and it is stored locally.

**3.2 Guardian Boundary Comprehension**
- *Question*: "What information do you think your parent/guardian can access from their view?"
- *Success Criteria*: User correctly distinguishes between high-level safety signals and private conversation history.

**3.3 AI Calibration**
- *Question*: "What do you think PRERNA remembers after you close the application?"
- *Success Criteria*: User correctly identifies that PRERNA remembers structured trait/profile data but the AI is not a human and may make mistakes.

**3.4 Safety Expectations**
- *Question*: "If PRERNA detects a serious safety concern, what do you expect to happen next?"
- *Success Criteria*: User correctly expects that a human reviewer may get involved and their guardian may be notified.

## 4. Evaluation Criteria
- **Task Completion**: Did they finish the vertical slice without critical assistance?
- **Misconception Threshold**: 
  - *Critical Privacy Misconception*: 0 allowed. (e.g., if any teen believes their parent can read all messages, the UI must be redesigned and re-tested).
