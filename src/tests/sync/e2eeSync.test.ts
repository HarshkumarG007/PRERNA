import { describe, it, expect } from 'vitest';
import {
  generateE2eeKeyPair,
  importPeerPublicKey,
  deriveSharedSessionKey,
  generateE2eeChannelId,
  encryptPayload,
  decryptPayload,
  E2eeSession,
} from '../../utils/e2eeSync';
import { sovereignSync } from '../../utils/realtimeSync';

describe('Sovereign E2EE Cross-Device Sync Protocol (H-19)', () => {
  it('generates a valid ECDH P-256 keypair with 130-character uncompressed public key hex', async () => {
    const keyPair = await generateE2eeKeyPair();
    expect(keyPair.publicKeyHex).toBeDefined();
    expect(keyPair.publicKeyHex.length).toBe(130); // 65 bytes * 2
    expect(keyPair.publicKeyHex.startsWith('04')).toBe(true); // Uncompressed EC point format
    expect(keyPair.privateKey).toBeDefined();
    expect(keyPair.publicKey).toBeDefined();
  });

  it('imports raw peer public key hex correctly', async () => {
    const alice = await generateE2eeKeyPair();
    const importedAlicePub = await importPeerPublicKey(alice.publicKeyHex);
    expect(importedAlicePub.algorithm.name).toBe('ECDH');
  });

  it('rejects malformed peer public key hex', async () => {
    await expect(importPeerPublicKey('04abcdef')).rejects.toThrow(/Invalid P-256 raw public key length/);
  });

  it('derives identical AES-256-GCM symmetric session keys on both peers via ECDH + HKDF', async () => {
    const alice = await generateE2eeKeyPair();
    const bob = await generateE2eeKeyPair();

    const alicePeerBobKey = await importPeerPublicKey(bob.publicKeyHex);
    const bobPeerAliceKey = await importPeerPublicKey(alice.publicKeyHex);

    const aliceSharedKey = await deriveSharedSessionKey(alice.privateKey, alicePeerBobKey);
    const bobSharedKey = await deriveSharedSessionKey(bob.privateKey, bobPeerAliceKey);

    expect(aliceSharedKey.algorithm.name).toBe('AES-GCM');
    expect(bobSharedKey.algorithm.name).toBe('AES-GCM');

    // Test symmetric encryption interoperability
    const channelId = generateE2eeChannelId();
    const testData = { teenId: 'teen-001', wellbeingScore: 88, status: 'thriving' };

    const envelope = await encryptPayload(aliceSharedKey, channelId, testData);
    expect(envelope.version).toBe('prerna-e2ee-v1');
    expect(envelope.channelId).toBe(channelId);
    expect(envelope.ciphertext).toBeDefined();
    expect(envelope.iv).toBeDefined();

    // Bob decrypts Alice's envelope
    const decrypted = await decryptPayload<typeof testData>(bobSharedKey, envelope, channelId);
    expect(decrypted).toEqual(testData);
  });

  it('fails closed when ciphertext is tampered (AES-GCM authentication tag violation)', async () => {
    const alice = await generateE2eeKeyPair();
    const bob = await generateE2eeKeyPair();
    const aliceSharedKey = await deriveSharedSessionKey(
      alice.privateKey,
      await importPeerPublicKey(bob.publicKeyHex)
    );
    const bobSharedKey = await deriveSharedSessionKey(
      bob.privateKey,
      await importPeerPublicKey(alice.publicKeyHex)
    );

    const channelId = generateE2eeChannelId();
    const envelope = await encryptPayload(aliceSharedKey, channelId, { secret: 'sacred-affirmation' });

    // Tamper with base64 ciphertext
    const tamperedCiphertext = envelope.ciphertext.slice(0, -4) + 'AAAA';
    const tamperedEnvelope = { ...envelope, ciphertext: tamperedCiphertext };

    await expect(
      decryptPayload(bobSharedKey, tamperedEnvelope, channelId)
    ).rejects.toThrow();
  });

  it('fails closed when envelope channel ID does not match expected session channel', async () => {
    const alice = await generateE2eeKeyPair();
    const aliceSharedKey = await deriveSharedSessionKey(
      alice.privateKey,
      (await generateE2eeKeyPair()).publicKey
    );

    const channelId = generateE2eeChannelId();
    const envelope = await encryptPayload(aliceSharedKey, channelId, { ok: true });

    await expect(
      decryptPayload(aliceSharedKey, envelope, 'different-channel-id')
    ).rejects.toThrow(/Channel ID mismatch/);
  });

  it('transports end-to-end encrypted teen wellbeing profiles over realtimeSync service', async () => {
    const teen = await generateE2eeKeyPair();
    const parent = await generateE2eeKeyPair();

    const teenSessionKey = await deriveSharedSessionKey(
      teen.privateKey,
      await importPeerPublicKey(parent.publicKeyHex)
    );
    const parentSessionKey = await deriveSharedSessionKey(
      parent.privateKey,
      await importPeerPublicKey(teen.publicKeyHex)
    );

    const channelId = generateE2eeChannelId();

    const teenSession: E2eeSession = {
      channelId,
      sharedKey: teenSessionKey,
      peerPublicKeyHex: parent.publicKeyHex,
      createdAt: new Date().toISOString(),
    };

    const parentSession: E2eeSession = {
      channelId,
      sharedKey: parentSessionKey,
      peerPublicKeyHex: teen.publicKeyHex,
      createdAt: new Date().toISOString(),
    };

    let receivedProfile: any = null;
    const unsub = sovereignSync.subscribeToEncryptedTeenParentUpdates(
      parentSession,
      profile => {
        receivedProfile = profile;
      }
    );

    const teenUpdate = {
      wellbeing: {
        score: 92,
        trend: 'improving' as const,
        interpretation: 'Thriving - strong emotional foundation',
      },
      strengths: ['Creative Expression', 'Deep Focus'],
      concerns: [],
    };

    await sovereignSync.publishEncryptedTeenParentUpdate(teenSession, teenUpdate);

    // Allow broadcast delivery
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(receivedProfile).toEqual(teenUpdate);

    unsub();
  });
});

