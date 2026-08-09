# ADR 0001: Local-First Encryption

## Status
Accepted

## Context
PRERNA deals with highly sensitive psychometric profiles, crisis escalation signals, and personal journal entries of adolescents. To comply with strict data minimization principles under the DPDP Act and ensure maximum trust, the application must process and store this data without relying on external cloud providers.

## Decision
We will use a local-first architecture powered by SQLCipher for encrypted local storage.
- All application data (profiles, traits, chat history) is stored in a locally encrypted SQLite database (`prerna.db`).
- The encryption key is derived using Argon2 from the user's password, augmented by an OS-level secure credential store (if available) or stored strictly in-memory during an active session.
- No data is transmitted to an external server unless explicit parental consent is given for a specific, time-bound disclosure event.

## Consequences
- **Positive:** Absolute data sovereignty for the user; zero risk of mass cloud data breaches.
- **Negative:** If a user loses their device and forgets their password, data recovery is mathematically impossible. This trade-off is accepted in favor of privacy.
