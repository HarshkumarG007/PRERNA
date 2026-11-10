# PRERNA — Google Play Store Submission & Data Safety Compliance Dossier

**Target Release:** v1.2.3  
**Package Namespace:** `com.prerna.sanctuary`  
**Target SDK:** 35 (Android 15) &bull; **Min SDK:** 24 (Android 7.0)  
**Binary Artifact:** `PRERNA-v1.2.3-arm64.apk` (14.04 MB) / Android App Bundle (`.aab`)  
**Statutory Alignment:** Digital Personal Data Protection (DPDP) Act 2023, Google Play Families Policy, COPPA  

---

## 1. Google Play Store Listing Metadata

### App Details
- **App Name:** `PRERNA: Self-Discovery` *(22 / 30 characters)*
- **Short Description:** `A local-first, culturally-grounded self-discovery sanctuary for Indian youth.` *(78 / 80 characters)*
- **Category:** Education / Health & Fitness
- **Tags:** Education, Personal Growth, Self-Improvement, Mental Wellbeing, Parenting
- **Content Rating Target:** Everyone / Teen (ESRB) / 12+ (PEGI / IARC)

---

### Full Description *(Copy-Paste into Google Play Console &mdash; 2,850 / 4,000 characters)*

```markdown
PRERNA (Personalized Real-time Engagement & Neural Resource Assistant) is an edge-native, culturally-grounded self-discovery sanctuary designed specifically for Indian adolescents, emerging adults, and families.

Unlike traditional profiling platforms, PRERNA is built on a transparent, consent-first architectural foundation: we believe that self-discovery should feel empowering, engaging, and honest—never deceptive, stigmatizing, or commercialized.

🌟 CORE HIGHLIGHTS & ACTIVITIES:

• Life Quests: Interactive decision-making journeys that highlight values, agency, and ethical clarity in authentic Indian contexts.
• Skill Arena: Cognitive agility games (reaction pacing, spatial rotation, and pattern flow) that reveal unique cognitive strengths.
• Mood Mirror: A reflective emotional space with Sant Kabir Das’s Atma-Jnana grounding for self-awareness and balance.
• Social Compass & Somatic Sanctuary: Practical conflict-resolution frameworks (OFNR) and 432 Hz guided diaphragmatic pacing for grounding and tranquility.
• Holistic Insights: Transparent synthesis mapped across adapted IPIP Big Five and O*NET RIASEC dimensions with dynamic confidence metrics.

🛡️ RADICAL PRIVACY & DATA SOVEREIGNTY:

PRERNA is architected to exceed India's Digital Personal Data Protection (DPDP) Act 2023 standards with an edge-native zero-telemetry architecture:

1. 100% On-Device Encrypted Storage: Your reflections, assessments, and growth milestones are encrypted using SQLCipher (AES-256) and never leave your physical device.
2. Zero Tracking & Zero Profiling: In accordance with DPDP Section 9(3), accounts for users under 18 have zero behavioral tracking, zero advertising trackers, and zero cross-app profiling.
3. Completely Ad-Free: PRERNA has zero ads and does not access Android Advertising ID (AD_ID).
4. Verifiable Parental Consent: Designed with explicit consent gates, transparent disclosures, and an instant one-click Right to Permanent Erasure.
5. Sovereign Portability: Export your entire journey into an offline, machine-readable JSON archive at any time.

🤝 MULTI-PERSONA SANCTUARY:

• Teen Mode: Private, transparent self-discovery with default-deny data isolation.
• Parent Portal: Verifiable consent management, mutual pairing via secure offline QR codes, and supportive parenting guidance.
• Adult Sanctuary: Advanced life-mastery modules, emotional calibration, and partnership dynamics.
• VidyaPeeth School Dashboard: Aggregated, k-anonymous cohort growth insights with strict small-cell suppression.

🆘 CLINICAL SAFETY & CRISIS PROTOCOL:

PRERNA provides 24/7 access to verified national crisis resources:
• Tele-MANAS (14416 / 1800-891-4416)
• Childline (1098)
• KIRAN (1800-599-0019)
• Vandrevala Foundation (9999 666 555)

In accordance with our child safety invariants, guardian notifications are never triggered by automated algorithms; emergency coordination requires human clinical review and adolescent notification.

Join PRERNA to experience self-discovery that honors your dignity, privacy, and inner potential.
```

---

## 2. Google Play Data Safety Form Questionnaire

Navigate to **Policy and programmes &rarr; App content &rarr; Data safety** in the Google Play Console and use the exact responses below:

### Section A: Data Collection & Security
| Question | Answer | Reason / Invariant |
|---|---|---|
| **Does your app collect or share any of the required user data types?** | **YES** | User ID/token for private beta activation; voluntary opt-in feedback. |
| **Is all of the user data collected by your app encrypted in transit?** | **YES** | HTTPS / TLS 1.3 for token activation and feedback API. |
| **Do you provide a way for users to request that their data be deleted?** | **YES** | In-app one-click Right to Erasure in Settings, plus grievance email. |
| **Do you allow users to delete their account and associated data?** | **YES** | Permanent erasure purges all 13 SQLite tables and unlinks relationships. |
| **Provide a link to your data deletion request page:** | `https://harshkumarg007.github.io/PRERNA/privacy.html` | Public privacy policy with DPDP Section 12 instructions. |

---

### Section B: Data Types Questionnaire

| Data Type | Collected? | Shared? | Purpose | Ephemeral? | Required or Optional? |
|---|---|---|---|---|---|
| **Personal Info &rarr; Name** | **YES** *(Local)* | **NO** | App functionality (display name in local dashboard). | No (Local) | Optional |
| **Personal Info &rarr; Email address** | **NO** | **NO** | N/A | N/A | N/A |
| **Personal Info &rarr; User IDs** | **YES** | **NO** | App functionality & Account management (closed beta authorization token check). | No | Required |
| **Financial Info** *(Payment/Bank/Card)* | **NO** | **NO** | N/A (UPI deep links trigger external UPI apps via `upi://pay`). | N/A | N/A |
| **Health and Fitness &rarr; Health info** | **NO** | **NO** | N/A (Reflections & assessments remain 100% on-device in SQLCipher). | N/A | N/A |
| **Photos and Videos &rarr; Photos / Videos** | **NO** | **NO** | N/A | N/A | N/A |
| **Camera Access** | **YES** *(Runtime)* | **NO** | App functionality: Scanning QR codes for device-to-device pairing. Zero photo frames saved. | **YES** | Optional |
| **Location &rarr; Approximate / Precise** | **NO** | **NO** | N/A (PRERNA never requests location permissions). | N/A | N/A |
| **App Activity & Analytics** | **NO** | **NO** | N/A (Zero third-party analytics trackers, zero telemetry). | N/A | N/A |
| **Device or other IDs** | **NO** | **NO** | N/A (Android Advertising ID `AD_ID` not requested or used). | N/A | N/A |

---

## 3. Target Audience & Content Settings

Navigate to **App content &rarr; Target audience and content**:

1. **Target Age Group:**
   - Check: **13–15**, **16–17**, and **18 and over**.
2. **Appeal to Children:**
   - Answer: **NO** (App is designed for adolescents, teenagers, and adults; it is not targeted at children under 13).
3. **Neutral Age Screen:**
   - Answer: **YES** (The app presents a neutral age declaration screen (`AgeDeclaration.tsx`) prior to role and assessment configuration).
4. **Families Policy Compliance:**
   - Zero ads integrated.
   - Zero transmission of personal data from minors to third parties.
   - Complies with DPDP Section 9, COPPA, and Google Play Families Policy.

---

## 4. Ads Declaration & Financial Features

1. **Ads:**
   - Select: **No, my app does not contain ads.**
2. **Government Apps:**
   - Select: **No**, PRERNA is an independent, non-governmental educational sanctuary.
3. **Financial Features:**
   - Select: **My app doesn't provide any financial features** (UPI donations/subscriptions use standard deep linking to system UPI apps).

---

## 5. Privacy Policy URL

- **Public URL:** `https://harshkumarg007.github.io/PRERNA/privacy.html`
- **Hosted Source:** [`public/privacy.html`](file:///c:/Users/Lenovo/Downloads/prerna/public/privacy.html) (bundled into `dist/` upon build).

---

## 6. Internal Testing Track Setup Guide

### Step 1: Open Google Play Console
1. Log in to [Google Play Console](https://play.google.com/console).
2. Select your application (`PRERNA: Self-Discovery` or create app with package `com.prerna.sanctuary`).

### Step 2: Navigate to Internal Testing
1. In the left-hand navigation pane, select **Testing &rarr; Internal testing**.
2. Click **Create new release** in the top right corner.

### Step 3: Upload Artifact
- **For APK upload:** Upload `PRERNA-v1.2.3-arm64.apk` (14.04 MB) located at:
  `c:\Users\Lenovo\Downloads\prerna\PRERNA-v1.2.3-arm64.apk`
- **For Android App Bundle (.aab) upload:**
  Download the `PRERNA-Android-AAB` artifact directly from the GitHub Actions **Build Android APK & Play Store AAB** workflow run, or run locally:
  ```powershell
  npx tauri android build --aab --target aarch64
  ```
  The generated `.aab` will be located in:
  `src-tauri/gen/android/app/build/outputs/bundle/**/*.aab`
  For Play Store release signing in CI, set repository secrets `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`.

### Step 4: Release Name and Release Notes
- **Release name:** `1.2.3 (10203) - Closed Beta Sanctuary Activation`
- **Release notes (en-IN / en-US):**
  ```text
  PRERNA v1.2.3 Closed Beta Release:
  - Local-first self-discovery sanctuary with transparent psychometric assessments (adapted IPIP Big Five & O*NET RIASEC).
  - Enhanced DPDP Section 12 Right-to-Erasure verification.
  - Hardened server-authoritative closed beta token activation with single-use device binding.
  - Multi-persona support: Teen Sanctuary, Parent Portal, Adult Sanctuary, and VidyaPeeth School Counselor analytics.
  - 24/7 Always-On Indian Mental Health Helpline integration (Tele-MANAS, Childline, KIRAN).
  ```

### Step 5: Tester Distribution & Cohort Tokens
1. Under **Testers**, create an email list named `PRERNA Closed Beta Cohort 1`.
2. Add the email addresses of your closed beta testers (mapping to the 78 tokens provisioned in `docs/cohort-distribution-roster.csv`).
3. Click **Save** and **Review release**, then **Start rollout to Internal testing**.
4. Copy the **Join on Android** opt-in URL generated by Google Play Console and share it with your cohort participants alongside their respective beta token (e.g. `PRN-TEEN-*`).

