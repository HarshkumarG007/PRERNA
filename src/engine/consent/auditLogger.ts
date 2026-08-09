// src/engine/consent/auditLogger.ts

import { AuditLogEntry } from '../../components/settings/AuditTrailViewer';
import { invoke } from '@tauri-apps/api/core';

/**
 * Records an entry into the access_audit_log.
 * In a real environment, this makes an IPC call to the Tauri Rust backend to insert a row into the SQLite DB.
 */
export async function logDataAccess(
  userId: string,
  accessedBy: 'self' | 'parent_dashboard' | 'system_process',
  dataScope: string
): Promise<void> {
  const entry: Omit<AuditLogEntry, 'id'> = {
    accessedBy,
    dataScope,
    accessedAt: new Date(),
  };
  
  console.log(`[AUDIT LOG] User ${userId} data scope '${dataScope}' accessed by ${accessedBy} at ${entry.accessedAt.toISOString()}`);
  
  try {
    await invoke('insert_audit_log', { 
      action: accessedBy, 
      details: `User ${userId} accessed scope: ${dataScope}` 
    });
  } catch (err) {
    console.error("Failed to write to audit_log table", err);
  }
}
