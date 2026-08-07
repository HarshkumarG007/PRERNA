# PRERNA Data Breach Notification Procedure

## Architectural Reality
PRERNA does not store user profiles, assessment logs, or AI conversation histories on a cloud server. Therefore, a traditional "mass data breach" of a central database is architecturally impossible. 

## Lost or Stolen Device Scenario
The only vector for data exposure is the physical compromise of the user's device. 

1. **Encryption at Rest:** All local SQLite databases are secured using SQLCipher (AES-256).
2. **Key Management:** The decryption key is generated locally and stored in the host operating system's secure credential manager (Windows Credential Manager, macOS Keychain) via the `keyring` crate.
3. **Notification Protocol:** If a device is stolen, PRERNA cannot remotely wipe the data (as it has no persistent cloud connection to receive the wipe command). The official procedure dictates that the parent/guardian must immediately change the host OS login password or trigger the OS-level remote wipe capability (e.g., Apple's "Find My", Windows "Find My Device").

Because no centralized breach can occur, the Data Fiduciary (PRERNA) is exempt from mass notification requirements to the Data Protection Board (DPB) under DPDP Section 8(6), unless a zero-day vulnerability is found in the encryption implementation itself. In such an event, PRERNA will issue a critical security advisory via GitHub and push a mandatory update.
