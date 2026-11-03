/**
 * PRERNA • Sovereign End-to-End Encryption (E2EE) Sync Protocol
 * 
 * Provides hardware-grade, zero-cloud plaintext confidentiality for cross-device synchronization:
 * - ECDH P-256 key exchange bootstrapped over sovereign QR camera scan
 * - HKDF-SHA256 session key derivation with domain separation
 * - AES-256-GCM authenticated encryption (128-bit tag, 96-bit CSPRNG IV per message)
 * - 128-bit unguessable channel IDs eliminating channel-name probing (H-19)
 * - Strict fail-closed message authentication: forged or unauthenticated messages are dropped
 * 
 * Complies with India DPDP Act 2023 §9 (zero minor psychometrics or relationship data leave the device unencrypted).
 */

import { getSecureRandomBytes, getSecureRandomString } from './cryptoVault';

export interface E2eeKeyPair {
  publicKeyHex: string;
  privateKey: CryptoKey;
  publicKey: CryptoKey;
}

export interface E2eeSession {
  channelId: string;       // 128-bit random hex
  sharedKey: CryptoKey;     // AES-256-GCM symmetric key
  peerPublicKeyHex: string;
  createdAt: string;
}

export interface EncryptedSyncEnvelope {
  version: 'prerna-e2ee-v1';
  channelId: string;       // 128-bit random channel identifier
  iv: string;              // Base64 96-bit (12-byte) CSPRNG nonce
  ciphertext: string;      // Base64 AES-256-GCM ciphertext + 16-byte auth tag
  timestamp: string;       // ISO 8601 string
}

const HKDF_SALT = new TextEncoder().encode('PRERNA_SOVEREIGN_E2EE_SALT_V1');
const HKDF_INFO = new TextEncoder().encode('prerna-cross-device-sync-session');

/**
 * Generates an ephemeral ECDH P-256 keypair for QR pairing handshake.
 */
export async function generateE2eeKeyPair(): Promise<E2eeKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  );

  const rawPub = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const pubBytes = new Uint8Array(rawPub);
  const publicKeyHex = Array.from(pubBytes, b => b.toString(16).padStart(2, '0')).join('');

  return {
    publicKeyHex,
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey,
  };
}

/**
 * Imports an uncompressed P-256 raw public key hex string into a CryptoKey.
 */
export async function importPeerPublicKey(publicKeyHex: string): Promise<CryptoKey> {
  const cleanHex = publicKeyHex.trim();
  if (cleanHex.length !== 130) {
    throw new Error(`Invalid P-256 raw public key length: expected 130 hex chars (65 bytes), got ${cleanHex.length}`);
  }

  const bytes = new Uint8Array(65);
  for (let i = 0; i < 65; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }

  return await crypto.subtle.importKey(
    'raw',
    bytes,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  );
}

/**
 * Derives a 256-bit AES-GCM session key from local private key and peer public key using HKDF-SHA256.
 */
export async function deriveSharedSessionKey(
  localPrivateKey: CryptoKey,
  peerPublicKey: CryptoKey
): Promise<CryptoKey> {
  // 1. Compute ECDH shared secret bits (256 bits)
  const sharedSecretBits = await crypto.subtle.deriveBits(
    {
      name: 'ECDH',
      public: peerPublicKey,
    },
    localPrivateKey,
    256
  );

  // 2. Import shared bits as HKDF master key material
  const hkdfKey = await crypto.subtle.importKey(
    'raw',
    sharedSecretBits,
    { name: 'HKDF' },
    false,
    ['deriveKey']
  );

  // 3. Derive AES-256-GCM symmetric session key with domain separation info
  return await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: HKDF_SALT,
      info: HKDF_INFO,
    },
    hkdfKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generates an unguessable 128-bit random channel ID for E2EE routing.
 */
export function generateE2eeChannelId(): string {
  return getSecureRandomString(32); // 128 bits of cryptographic hex entropy
}

/**
 * Encrypts arbitrary serializable payload into an authenticated E2EE envelope.
 */
export async function encryptPayload<T>(
  sharedKey: CryptoKey,
  channelId: string,
  payload: T
): Promise<EncryptedSyncEnvelope> {
  const jsonString = JSON.stringify(payload);
  const plaintextBytes = new TextEncoder().encode(jsonString);

  // Generate 96-bit (12-byte) random CSPRNG IV for AES-GCM
  const ivBytes = getSecureRandomBytes(12);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes,
      tagLength: 128,
    },
    sharedKey,
    plaintextBytes
  );

  // Base64 encoding
  const ivBase64 = btoa(String.fromCharCode(...ivBytes));
  const ciphertextBytes = new Uint8Array(ciphertextBuffer);
  let binaryString = '';
  for (let i = 0; i < ciphertextBytes.length; i++) {
    binaryString += String.fromCharCode(ciphertextBytes[i]);
  }
  const ciphertextBase64 = btoa(binaryString);

  return {
    version: 'prerna-e2ee-v1',
    channelId,
    iv: ivBase64,
    ciphertext: ciphertextBase64,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Decrypts an authenticated E2EE envelope, failing closed if tampered or mismatched.
 */
export async function decryptPayload<T>(
  sharedKey: CryptoKey,
  envelope: EncryptedSyncEnvelope,
  expectedChannelId?: string
): Promise<T> {
  if (envelope.version !== 'prerna-e2ee-v1') {
    throw new Error(`Unsupported E2EE envelope version: ${envelope.version}`);
  }

  if (expectedChannelId && envelope.channelId !== expectedChannelId) {
    throw new Error(`Channel ID mismatch: envelope channel ${envelope.channelId} != expected ${expectedChannelId}`);
  }

  // Base64 decode IV
  const ivBinary = atob(envelope.iv);
  const ivBytes = new Uint8Array(ivBinary.length);
  for (let i = 0; i < ivBinary.length; i++) {
    ivBytes[i] = ivBinary.charCodeAt(i);
  }

  // Base64 decode Ciphertext
  const ciphertextBinary = atob(envelope.ciphertext);
  const ciphertextBytes = new Uint8Array(ciphertextBinary.length);
  for (let i = 0; i < ciphertextBinary.length; i++) {
    ciphertextBytes[i] = ciphertextBinary.charCodeAt(i);
  }

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes,
      tagLength: 128,
    },
    sharedKey,
    ciphertextBytes
  );

  const decryptedJson = new TextDecoder().decode(decryptedBuffer);
  return JSON.parse(decryptedJson) as T;
}

