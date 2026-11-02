# PRERNA — Data Flow Architecture & Lifecycle Specification

**Version:** 1.2.3  
**Classification:** Enterprise Engineering Architecture Document  
**Target:** Local-First Android ARM64 & Cross-Platform Desktop  
**Compliance Standard:** DPDP Act 2023 §9, §11, §12 · Zero Cloud Psychometrics  

---

## 1. Overview & Data Flow Principles

PRERNA operates on a **Closed Local Data Loop**: data originates on the user's input surface, is processed in local memory, and is committed to encrypted on-device storage. At no point in the standard adolescent lifecycle does sensitive data traverse external cloud networks.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              THE CLOSED LOCAL DATA LOOP                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  User Interaction (Voice / Touch / Key)                                                │
│         │                                                                              │
│         ▼                                                                              │
│  Tauri 2 Typed IPC Protocol (JSON-RPC)                                                 │
│         │                                                                              │
│         ▼                                                                              │
│  Native Policy & Invariant Engine (Rust)                                               │
│         │                                                                              │
│         ▼                                                                              │
│  Local SQLite Engine (AES-256 / FBE Sandbox chmod 0600)                                │
│         │                                                                              │
│         ▼                                                                              │
│  On-Device Self-Discovery Synthesis (Instant Local-First Feedback)                     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. End-to-End Data Flow Diagrams

### 2.1 Ingestion, Authentication & Persona Activation

```mermaid
sequenceDiagram
    autonumber
    actor User as Adolescent / Seeker
    participant UI as React 19 Frontend
    participant IPC as Tauri 2 Native Bridge
    participant Policy as PolicyEngine (Rust)
    participant Auth as ActiveSession & Argon2id
    participant DB as SQLite Storage

    User->>UI: Enters Token / Selects Persona
    UI->>IPC: invoke("create_user", { role, age, ... })
    IPC->>Policy: Validate Role Allow-List (teen | adult | parent)
    alt Privileged Role (reviewer / educator)
        Policy-->>IPC: Reject Unauthorized Self-Escalation (403)
        IPC-->>UI: Error: Privileged roles require out-of-band provisioning
    else Valid Consumer Role
        Policy->>Auth: Derive Argon2id Key (salt: CSPRNG 16B)
        Auth->>DB: Insert User & Initialize FBE Record
        Auth->>Auth: Transition to Authenticated(user_id)
        Auth-->>IPC: Return Session Token
        IPC-->>UI: UserProfile (PII / Keys scrubbed)
        UI->>UI: Render Sanctuary Dashboard
    end
```

---

### 2.2 Psychometric Scoring & Synthesis Flow

```mermaid
flowchart TD
    A[Adolescent Question Response] --> B{Item Bank Loader}
    B -->|IPIP 50 Factor Markers| C[Big Five Scoring Engine]
    B -->|O*NET Interest Profiler| D[RIASEC Scoring Engine]
    
    C --> E[Construct Normalizer]
    D --> E
    
    E --> F[Dynamic Confidence Engine]
    F -->|Formula: measuredDomains / 11 * 0.95| G[Confidence Score Output]
    
    E --> H[Higgins Self-Discrepancy Engine]
    H -->|Actual vs Improvised Self| I[Archetype & Superpower Matrix]
    
    G --> J[Life Blueprint Synthesis]
    I --> J
    
    J --> K[(On-Device SQLite)]
    J --> L[Local A4 PDF Vector Export]
    
    style A fill:#6366f1,color:#fff
    style G fill:#10b981,color:#fff
    style L fill:#ec4899,color:#fff
```

---

### 2.3 Crisis Detection & Offline Safeguard Flow

```mermaid
sequenceDiagram
    autonumber
    actor Teen as Teen Seeker
    participant Input as Chat / Reflection Input
    participant Detector as SafetyFilter & CrisisDetector (Rust)
    participant State as CrisisStateMachine
    participant Surface as On-Device Resource Surface
    participant Tel as Android Telephony Intent

    Teen->>Input: Submits message / journal entry
    Input->>Detector: evaluate_text(payload)
    Note over Detector: Step 1: Evaluate Severe Distress Patterns (Self-harm, ideation)
    Note over Detector: Step 2: Evaluate Slang Context Filters
    alt Severe Distress Detected
        Detector->>State: Transition to ActiveCrisis(event_id)
        State->>State: Enforce Rule 0.3 (Record teen_informed_at)
        State-->>Surface: Trigger Calming Emergency Surface
        Surface->>Teen: Display 112, Tele-MANAS (14416), Childline (1098)
        Teen->>Surface: Taps "Call Tele-MANAS (14416)"
        Surface->>Tel: tel:14416 (Direct native dialer)
    else Benign Slang / Baseline Reflection
        Detector-->>Input: Pass through to Reflection Journal / AI Mentor
    end
```

---

### 2.4 Parent Co-Reflection & Firewall Boundary

```mermaid
flowchart LR
    subgraph Adolescent Domain
        T_Data[Teen Psychometrics & Diary]
        T_Pref{Sharing Preferences}
    end

    subgraph Privacy Firewall
        FW[Default-Deny Filter]
    end

    subgraph Parent Portal Domain
        P_View[Parent Co-Reflection View]
    end

    T_Data --> T_Pref
    T_Pref -->|Explicit Teen Opt-In = TRUE| FW
    T_Pref -.->|Default / Error = FALSE| Block[Drop / Fail Closed]
    FW -->|Omit Raw Scores & Private Journal| P_View
    FW -->|High-Level Themes ONLY| P_View

    style T_Data fill:#6366f1,color:#fff
    style FW fill:#f59e0b,color:#fff
    style P_View fill:#10b981,color:#fff
    style Block fill:#ef4444,color:#fff
```

---

### 2.5 Institutional School Analytics ($k \ge 5$)

```mermaid
flowchart TD
    S1[Student 1 Device] -->|Pseudonymous Batch Token| Collector[School Analytics Bridge]
    S2[Student 2 Device] -->|Pseudonymous Batch Token| Collector
    S3[Student 3 Device] -->|Pseudonymous Batch Token| Collector
    S4[Student 4 Device] -->|Pseudonymous Batch Token| Collector
    S5[Student 5 Device] -->|Pseudonymous Batch Token| Collector

    Collector --> K_Gate{k-Anonymity Filter: Count >= 5?}
    K_Gate -->|YES| Aggregator[Differential & Averaging Engine]
    K_Gate -->|NO| Suppress[Suppress Output - Small Cell Protection]

    Aggregator --> AdminView[School Sanctuary Dashboard: Grade-Level Trends]

    style K_Gate fill:#f59e0b,color:#fff
    style Aggregator fill:#10b981,color:#fff
    style Suppress fill:#ef4444,color:#fff
```

---

## 3. Data Classification & Retention Table

| Data Category | Specific Fields | Storage Location | Encryption Standard | Retention Period | Purge Action |
|---|---|---|---|---|---|
| **Identity & Auth** | User ID, Username, Password Hash, PIN Salt | Native SQLite `users` table | Argon2id + AES-256 | Active account lifecycle | SQL DELETE + Zeroize memory |
| **Psychometrics** | Big Five traits, RIASEC vectors, confidence scores | Native SQLite `assessments` | AES-256-GCM authenticated | Lifetime of user account | Cascading SQL delete on erasure |
| **Wellbeing & Journal** | Somatic logs, strengths reflections, Maslow needs | Native SQLite `growth_journals` | AES-256-GCM / FBE sandbox | Until user edit/delete | Immediate overwrite + WAL truncate |
| **Crisis Records** | Event ID, classification, severity, escalation log | Native SQLite `crisis_events` | AES-256-GCM authenticated | Statutory audit requirements | Pseudonymized retention for compliance |
| **Parent Sharing** | Toggle flags (`wellbeingScore`, `themes`) | Native SQLite `sharing_preferences` | SQLite FBE | Active pairing session | Revoked instantly on teen toggle |
| **School Tokens** | Cryptographic batch identifiers (`SCH-BATCH-*`) | Ephemeral session state | In-memory only | Session duration | Purged on app exit |

---

## 4. Verification & Integrity Assertions

- **Zero-Network Invariant:** Network socket inspections confirm zero outbound requests during assessment completion, journal persistence, and crisis evaluation.
- **Erase-All Assertion:** Cold-start inspection after `delete_user_data` confirms zero database records and empty `localStorage`.
- **Identity Isolation Assertion:** Regression test `test_t15_7_cross_user_isolation` confirms that multiple user profiles on a shared device have zero cross-read capabilities.

