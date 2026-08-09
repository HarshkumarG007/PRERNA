# Production Hardening & CI/CD Security Guide

This document outlines the mandatory security steps required for preparing the PRERNA binary for production deployment. These steps involve external infrastructure (CI/CD, Certificates) and must be implemented before public release.

## 1. Code Signing & Binary Tamper Resistance

To prevent malicious actors from modifying the local executable or the user's OS from flagging the app as malware:

### Windows (Authenticode)
1. Procure an Extended Validation (EV) Code Signing Certificate.
2. In your GitHub Actions workflow, configure `tauri-action` to sign the `.exe` and `.msi` installers.
3. Supply the certificate and password via GitHub Secrets.

### macOS (Gatekeeper / Notarization)
1. Procure an Apple Developer ID Application certificate.
2. Configure the macOS build matrix to sign the `.app` bundle.
3. Implement the Apple Notarization workflow so the app runs on target devices without triggering Gatekeeper security blocks.

## 2. Supply-Chain Audits

Because PRERNA relies heavily on npm packages (frontend) and cargo crates (backend), we must enforce supply-chain security:

1. **GitHub Dependabot**: Enable Dependabot alerts and automated security updates.
2. **Cargo Audit**: Add `cargo install cargo-audit && cargo audit` to the CI pipeline to fail the build if a crate with a known vulnerability is used.
3. **NPM Audit**: Add `npm audit --audit-level=high` to the frontend build step.

## 3. Secure Update Mechanism (Tauri Updater)

Tauri provides a built-in updater, but it requires a secure endpoint.
1. Generate an ECDSA signature key pair using the Tauri CLI (`tauri signer generate`).
2. Store the private key in GitHub Secrets and configure the CI to sign all update bundles (`.zip.sig`, `.tar.gz.sig`).
3. Embed the public key in `tauri.conf.json`.
4. Host the update JSON manifest on a secure, HTTPS-only server. The app will reject any unsigned or tampered updates.

## 4. Addressing Local Admin Exploits (Threat Model)

We use `zeroize` in memory and SQLCipher for at-rest storage. However, if an attacker has `sudo` or Administrator privileges on the physical device, they can read the OS Keychain where the SQLCipher key is stored.

**Mitigation:** 
For maximum clinical security, implement an "App Lock" pattern. Require the user to enter a 6-digit PIN upon app launch. Use this PIN (with Argon2 key derivation) to encrypt the SQLCipher key before storing it in the OS Keychain. This guarantees zero-knowledge even if the physical device is stolen and the OS keychain is dumped.
