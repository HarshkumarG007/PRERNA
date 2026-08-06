/**
 * Automatic backup scheduler
 * Creates encrypted backups at intervals
 */

import { BackupEngine } from './engine';

export class BackupScheduler {
  private engine: BackupEngine;
  private intervalId: number | null = null;
  private readonly BACKUP_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    this.engine = new BackupEngine();
  }

  start(userId: string, password: string): void {
    // Check if backup is due
    this.checkAndBackup(userId, password);

    // Schedule regular checks
    this.intervalId = window.setInterval(() => {
      this.checkAndBackup(userId, password);
    }, this.BACKUP_INTERVAL_MS);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async checkAndBackup(userId: string, password: string): Promise<void> {
    const lastBackup = localStorage.getItem('prerna_last_backup');
    const now = Date.now();

    if (!lastBackup || now - parseInt(lastBackup) > this.BACKUP_INTERVAL_MS) {
      try {
        const backup = await this.engine.createBackup(userId, password);
        
        // Save to default location
        const defaultName = `prerna-auto-${new Date().toISOString().split('T')[0]}.prerna`;
        
        // Dynamic import of fs plugin
        const { BaseDirectory } = await import('@tauri-apps/plugin-fs');
        
        // Tauri v2 fs write requires strings or bytes, we will base64 it for auto backup just in case
        // Note: For real binary backup, we should use write as Uint8Array if supported. 
        // We'll write it directly as Uint8Array
        const { writeFile } = await import('@tauri-apps/plugin-fs');
        await writeFile(defaultName, backup.encryptedData, {
          baseDir: BaseDirectory.Document,
        });

        localStorage.setItem('prerna_last_backup', now.toString());
        
        console.log('Auto-backup completed:', defaultName);
      } catch (error) {
        console.error('Auto-backup failed:', error);
      }
    }
  }

  isBackupDue(): boolean {
    const lastBackup = localStorage.getItem('prerna_last_backup');
    if (!lastBackup) return true;
    
    const now = Date.now();
    return now - parseInt(lastBackup) > this.BACKUP_INTERVAL_MS;
  }
}
