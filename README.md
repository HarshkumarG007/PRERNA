# PRERNA: Privacy-First Mental Health Platform for Teens

![PRERNA Logo](./public/vite.svg)

**PRERNA** is a privacy-first, secure, and mathematically robust mental health architecture designed specifically for Indian youth. It provides psychological assessments, AI-driven mentorship, and clinical escalation tools, all while adhering strictly to the **DPDP (Digital Personal Data Protection) Act of 2023**.

---

## 🌟 Key Features

1. **Age & Consent Gating (DPDP Compliant)**
   - Automatically intercepts users under 18.
   - Enforces verifiable parental consent via simulated Digilocker workflows before any data collection occurs.
   - Categorically prohibits behavioral profiling and targeted advertising for minors.

2. **Informed Consent Architecture (Zero-Dark-Patterns)**
   - Plain-language disclosures are mandatory before any new assessment or activity.
   - The UI physically blocks session initiation until explicit, timestamped consent is recorded.

3. **Secure Crisis Escalation Router**
   - Analyzes user inputs for signs of severe distress.
   - Flags cases for **Human-in-the-Loop Clinical Review**.
   - Ensures strict notification invariants: A guardian cannot be notified until a human professional has reviewed the case AND the teen has been explicitly informed.

4. **Tauri + Rust Secure Backend**
   - Built on a **Tauri desktop architecture** to allow secure, local-first data processing.
   - Critical data ingestion and safety invariants are enforced at the compiled Rust level via IPC, preventing client-side JavaScript tampering.
   - Built-in SQLCipher encryption support for local data at rest.

5. **Premium Glassmorphic UI**
   - Designed with React, TailwindCSS, and Lucide Icons.
   - Features a calming, modern, and engaging visual aesthetic using smooth gradients, glass panels, and micro-animations to put users at ease.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS
- **Backend/Desktop:** Tauri v2, Rust
- **Testing:** Vitest, React Testing Library (Full Unit & DOM Integration suites)
- **State Management:** Zustand, React Query

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Rust & Cargo ([Install Rust](https://rustup.rs/))
- Tauri CLI prerequisites (C++ Build Tools, Edge WebView2 on Windows)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HarshkumarG007/PRERNA.git
   cd PRERNA
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the Development Server:**
   ```bash
   # This will start the Vite server and the Tauri Rust backend simultaneously
   npm run tauri dev
   ```

4. **Run the Test Suite:**
   ```bash
   # Executes the rigorous DPDP invariant tests and UI integration tests
   npm test
   ```

5. **Build for Production (Desktop App):**
   ```bash
   # Compiles the standalone executable (.exe / .dmg / .AppImage)
   npm run tauri build
   ```

---

## 🔒 Security & Architecture Details

The system is designed with a **"Trust Nothing, Verify Everything"** approach.
- **Frontend Layer:** Provides the beautiful UI, but assumes all data can be tampered with.
- **IPC Bridge (Tauri):** Custom Rust commands (e.g., `insert_crisis_event`) validate all incoming JSON payloads.
- **Database:** SQLite is used locally, abstracted behind Tauri's SQL plugin.

For detailed documentation on the crisis escalation protocols, please read the [Crisis Protocol Doc](./docs/crisis-protocol.md).

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
