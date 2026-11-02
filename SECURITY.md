# Security Policy

## Reporting a Vulnerability

The PRERNA project takes the security of adolescent and family psychological data seriously.
As a local-first application designed for adolescent wellbeing under India's Digital Personal Data Protection Act (DPDP Act 2023), our primary architectural commitment is zero unauthorized data exposure.

If you discover a security vulnerability, we appreciate your help in disclosing it responsibly.

### How to Report

Please report security issues directly to the maintainers via private channels:
- **Email:** `security@prerna.app` (or open a private security advisory on GitHub)
- **Grievance Officer:** Harshkumar G. (Founder / Lead Maintainer)

Please include:
1. Description of the vulnerability and its potential impact.
2. Step-by-step reproduction instructions or a minimal proof of concept.
3. Affected components (e.g. Tauri IPC boundary, SQLite/SQLCipher layer, encryption vault, client web bundle).

### Scope and Boundaries

- **Local Storage Security:** In release builds, persistent SQLite data is encrypted on device. Plaintext fallbacks to constant keys are prohibited.
- **Role Isolation:** Privileged roles (`reviewer`, `educator`, `admin`, `clinician`) must never be self-assignable from the client.
- **Child Privacy Safeguards:** Behavioral tracking of minors under 18 is strictly prohibited in compliance with DPDP Act Section 9(3).
- **Crisis Intervention Invariants:** Automated parental notifications upon crisis detection are strictly prohibited without clinician review and teen notification (Rule 0.3).

### Response SLA

- **Initial Triage:** Within 48 hours.
- **Status Update:** Within 7 business days with a remediation timeline.
- **Resolution:** Critical and High severity issues will be remediated and released as priority patch releases.

