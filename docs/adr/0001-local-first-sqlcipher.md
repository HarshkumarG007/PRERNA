# ADR 0001: Local-First Architecture with SQLCipher

## Context
PRERNA collects highly sensitive psychological and behavioral data from minors (adolescents). Traditional web applications send this data to a centralized cloud database for processing and storage. Under India's DPDP Act, and general pediatric data safety principles, storing this data in a centralized honeypot creates unacceptable systemic risk. If a cloud provider is breached, the innermost thoughts, mood logs, and psychological profiles of millions of teenagers would be exposed.

## Decision
We will use a strictly **Local-First Architecture**. 
- Core psychological data will NEVER leave the user's device.
- We will use `SQLite` embedded on the device via the Rust `rusqlite` crate.
- We will strictly encrypt this database at rest using `SQLCipher` (AES-256), utilizing the `bundled-sqlcipher-vendored-openssl` feature in our Tauri backend.

## Consequences
**Positive:**
- Zero-knowledge by design: As the platform developers, we have no physical or technical ability to read a teenager's psychological profile or chat logs.
- DPDP Compliance: We drastically reduce our compliance burden because we are not a "Data Fiduciary" for the core behavioral data; the user holds their own data.
- Offline Capability: The app functions perfectly in low-bandwidth Indian environments.

**Negative:**
- Multi-device sync is complex and requires explicit, peer-to-peer or highly encrypted relay solutions (not built in Phase 1).
- If a user loses their device and the encryption key, their data is unrecoverable (addressed via explicit Backup UI).
