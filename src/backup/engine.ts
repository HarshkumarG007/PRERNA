/**
 * Offline Backup Engine
 * Zero-knowledge encrypted export/import
 */

import { invoke } from '@tauri-apps/api/core';
export interface BackupMetadata {
  version: string;
  createdAt: string;
  userId: string;
  dataHash: string; // Integrity verification
  encryptionSalt: string;
}

export interface BackupPackage {
  metadata: BackupMetadata;
  encryptedData: Uint8Array;
}

export class BackupEngine {
  private static readonly VERSION = '1.0';
  private static readonly MAGIC_BYTES = new Uint8Array([0x50, 0x52, 0x45, 0x52]); // "PRER"

  /**
   * Create encrypted backup of all user data
   */
  async createBackup(userId: string, password: string): Promise<BackupPackage> {
    // 1. Gather all user data from Rust backend
    const userData = await invoke<Record<string, unknown>>('export_all_user_data', {
      userId,
    });

    // 2. Serialize
    const jsonData = JSON.stringify(userData);
    const dataBytes = new TextEncoder().encode(jsonData);

    // 3. Generate salt
    const salt = window.crypto.getRandomValues(new Uint8Array(32));

    // 4. Derive encryption key from password
    const key = await this.deriveKey(password, salt);

    // 5. Encrypt (AES-256-GCM)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await this.encrypt(dataBytes, key, iv);

    // 6. Calculate hash for integrity
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', encrypted);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 7. Build package
    const metadata: BackupMetadata = {
      version: BackupEngine.VERSION,
      createdAt: new Date().toISOString(),
      userId,
      dataHash: hashHex,
      encryptionSalt: this.arrayToHex(salt),
    };

    const metadataBytes = new TextEncoder().encode(JSON.stringify(metadata));

    // 8. Assemble file: MAGIC + metadataLength + metadata + iv + encrypted
    const packageBuffer = this.assemblePackage(metadataBytes, iv, encrypted);

    return {
      metadata,
      encryptedData: packageBuffer,
    };
  }

  /**
   * Restore from backup
   */
  async restoreBackup(
    packageData: Uint8Array,
    password: string
  ): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      // 1. Verify magic bytes
      const magic = packageData.slice(0, 4);
      if (!this.arraysEqual(magic, BackupEngine.MAGIC_BYTES)) {
        return { success: false, error: 'Invalid backup file format' };
      }

      // 2. Parse metadata length
      const metaLength = new DataView(packageData.buffer, 4, 4).getUint32(0, true);

      // 3. Extract metadata
      const metaBytes = packageData.slice(8, 8 + metaLength);
      const metadata: BackupMetadata = JSON.parse(new TextDecoder().decode(metaBytes));

      // 4. Extract IV and encrypted data
      const iv = packageData.slice(8 + metaLength, 8 + metaLength + 12);
      const encrypted = packageData.slice(8 + metaLength + 12);

      // 5. Verify integrity
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', encrypted);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (hashHex !== metadata.dataHash) {
        return { success: false, error: 'Data integrity check failed - file may be corrupted' };
      }

      // 6. Derive key and decrypt
      const salt = this.hexToArray(metadata.encryptionSalt);
      const key = await this.deriveKey(password, salt);
      const decrypted = await this.decrypt(encrypted, key, iv);

      // 7. Parse data
      const jsonData = new TextDecoder().decode(decrypted);
      const userData = JSON.parse(jsonData);

      // 8. Import to database
      await invoke('import_user_data', { data: userData });

      return { success: true, userId: metadata.userId };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Decryption failed - wrong password?' 
      };
    }
  }

  // Private helpers
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    // Import password as key material
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      passwordData,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Derive AES key
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private async encrypt(data: Uint8Array, key: CryptoKey, iv: Uint8Array): Promise<Uint8Array> {
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    return new Uint8Array(encrypted);
  }

  private async decrypt(data: Uint8Array, key: CryptoKey, iv: Uint8Array): Promise<Uint8Array> {
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    return new Uint8Array(decrypted);
  }

  private assemblePackage(metadata: Uint8Array, iv: Uint8Array, encrypted: Uint8Array): Uint8Array {
    const metaLength = new ArrayBuffer(4);
    new DataView(metaLength).setUint32(0, metadata.length, true);

    const result = new Uint8Array(
      4 + // Magic
      4 + // Metadata length
      metadata.length +
      iv.length +
      encrypted.length
    );

    let offset = 0;
    result.set(BackupEngine.MAGIC_BYTES, offset);
    offset += 4;
    result.set(new Uint8Array(metaLength), offset);
    offset += 4;
    result.set(metadata, offset);
    offset += metadata.length;
    result.set(iv, offset);
    offset += iv.length;
    result.set(encrypted, offset);

    return result;
  }

  private arrayToHex(arr: Uint8Array): string {
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private hexToArray(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  private arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, i) => val === b[i]);
  }
}
