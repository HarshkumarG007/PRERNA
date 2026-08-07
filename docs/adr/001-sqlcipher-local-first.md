# ADR 001: SQLCipher for Local-First Data Storage

## Status
Accepted

## Context
PRERNA collects highly sensitive data from adolescents, including emotional traits, psychological behavioral signals, and crisis indicators. Storing this data on cloud servers (e.g., AWS, Firebase) introduces massive DPDP (Digital Personal Data Protection) compliance overhead. It requires strict encrypt-in-transit, encrypt-at-rest, complex key rotation, and creates a massive honeypot for potential data breaches. Furthermore, cloud storage raises significant trust and consent concerns for parents.

## Decision
We decided to adopt a **strict local-first architecture**. All sensitive assessment data, session logs, and unified trait profiles are stored directly on the user's device using `rusqlite` bundled with `sqlcipher`. 
The encryption key is generated locally and secured using the host OS's native secure credential manager (Windows Credential Manager, macOS Keychain, Linux Secret Service) via the `keyring` crate.

## Consequences
- **Positive:** Guaranteed DPDP compliance by design. PRERNA physically cannot leak a central database of adolescent psychological profiles because no central database exists.
- **Positive:** The application functions fully offline, providing accessibility in low-bandwidth regions.
- **Negative:** Cross-device synchronization (e.g., a teen wanting to see their PRERNA stats on both their laptop and their phone) is extremely difficult to implement securely without breaking the local-first promise. We are deliberately sacrificing multi-device sync for absolute security.
