import { describe, it, expect, beforeEach } from 'vitest';
import { BackupEngine, OfflineSyncQueue } from '../../backup/engine';

describe('BackupEngine Offline Cryptographic Backup and Restore', () => {
  const engine = new BackupEngine();
  const testUserId = 'test-teen-backup-01';
  const strongPassword = 'CorrectHorseBatteryStaple123!';

  beforeEach(() => {
    localStorage.clear();
  });

  it('creates an encrypted backup package with valid magic bytes and integrity hash', async () => {
    const backup = await engine.createBackup(testUserId, strongPassword);

    expect(backup).toBeDefined();
    expect(backup.metadata.userId).toBe(testUserId);
    expect(backup.metadata.version).toBe('1.0');
    expect(backup.metadata.dataHash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex
    expect(backup.metadata.encryptionSalt).toBeDefined();

    // Verify magic bytes "PRER" (0x50, 0x52, 0x45, 0x52)
    const magic = backup.encryptedData.slice(0, 4);
    expect(magic[0]).toBe(0x50);
    expect(magic[1]).toBe(0x52);
    expect(magic[2]).toBe(0x45);
    expect(magic[3]).toBe(0x52);
  });

  it('successfully restores data with the correct decryption password', async () => {
    const backup = await engine.createBackup(testUserId, strongPassword);
    const result = await engine.restoreBackup(backup.encryptedData, strongPassword);

    expect(result.success).toBe(true);
    expect(result.userId).toBe(testUserId);
    expect(result.error).toBeUndefined();
  });

  it('fails safely when an incorrect password is provided', async () => {
    const backup = await engine.createBackup(testUserId, strongPassword);
    const result = await engine.restoreBackup(backup.encryptedData, 'WrongPassword456!');

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/wrong password|Decryption failed/i);
  });

  it('detects file format corruption when magic bytes are invalid', async () => {
    const backup = await engine.createBackup(testUserId, strongPassword);
    const corrupted = new Uint8Array(backup.encryptedData);
    corrupted[0] = 0x00; // corrupt first magic byte

    const result = await engine.restoreBackup(corrupted, strongPassword);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid backup file format');
  });

  it('detects tampering and rejects corrupted ciphertext via SHA-256 integrity check', async () => {
    const backup = await engine.createBackup(testUserId, strongPassword);
    const tampered = new Uint8Array(backup.encryptedData);
    // Tamper with the last byte of ciphertext
    tampered[tampered.length - 1] ^= 0xff;

    const result = await engine.restoreBackup(tampered, strongPassword);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Data integrity check failed - file may be corrupted');
  });
});

describe('OfflineSyncQueue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('queues offline sync payloads and flushes when online', async () => {
    OfflineSyncQueue.push({
      action: 'UPDATE_TRAIT',
      data: { score: 85 },
      timestamp: new Date().toISOString(),
    });

    expect(OfflineSyncQueue.getQueue().length).toBe(1);

    // If offline, flush should not clear
    await OfflineSyncQueue.flush(false);
    expect(OfflineSyncQueue.getQueue().length).toBe(1);

    // If online, flush clears the queue
    await OfflineSyncQueue.flush(true);
    expect(OfflineSyncQueue.getQueue().length).toBe(0);
  });
});

