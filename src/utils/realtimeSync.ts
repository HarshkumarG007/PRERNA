/**
 * PRERNA • Sovereign Real-Time Synchronization Engine
 * 
 * Manages local real-time synchronization for:
 * 1. Teen <-> Parent Shared Wellbeing Window (Local broadcast + E2EE)
 * 2. Partner <-> Partner Sanctuary (Local broadcast + E2EE)
 * 
 * Transport Layers:
 * - Local Layer: HTML5 BroadcastChannel + in-process bus (Zero-network, instant multi-tab sync)
 * - Cryptographic Layer: Authenticated E2EE via ECDH P-256 + AES-256-GCM (H-19 remediation)
 * - Cloud Relay Layer: Intentionally UNPLUGGED per Audit Addendum 1 (H-19) until
 *   authenticated private channels with verified access control are deployed.
 * - Sovereign Invariant: Zero minor journals, psychometrics, or private relationship
 *   events are ever broadcast in plaintext to unauthenticated public cloud channels.
 */

import { ParentSafeProfile } from '../parent/permissions';
import { 
  E2eeSession, 
  EncryptedSyncEnvelope, 
  encryptPayload, 
  decryptPayload 
} from './e2eeSync';

export interface SyncMessage<T = any> {
  type: 'teen_parent_sync' | 'partner_event_sync' | 'heartbeat' | 'e2ee_envelope';
  channelId: string;
  senderId: string;
  timestamp: string;
  payload: T;
}

export type SyncUnsubscribe = () => void;

class SovereignRealtimeSyncService {
  private localBus: BroadcastChannel | null = null;
  private listeners: Set<(msg: SyncMessage) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.localBus = new BroadcastChannel('prerna_sovereign_sync_bus');
        this.localBus.addEventListener('message', (event: MessageEvent) => {
          this.notifyListeners(event.data);
        });
      } catch {
        this.localBus = null;
      }
    }
  }

  // ============================================================================
  // TEEN <-> PARENT REAL-TIME SYNCHRONIZATION (UNENCRYPTED LOCAL FALLBACK)
  // ============================================================================

  /**
   * Teen device publishes a consent-screened wellbeing snapshot to the paired parent.
   */
  public publishTeenParentUpdate(teenId: string, profile: Partial<ParentSafeProfile>): void {
    const channelId = `sync_pair_${teenId.trim()}`;
    const message: SyncMessage<Partial<ParentSafeProfile>> = {
      type: 'teen_parent_sync',
      channelId,
      senderId: teenId,
      timestamp: new Date().toISOString(),
      payload: profile,
    };

    this.broadcastLocal(message);
  }

  /**
   * Parent device subscribes to live updates from their paired teen.
   */
  public subscribeToTeenParentUpdates(
    teenId: string, 
    onUpdate: (profile: Partial<ParentSafeProfile>) => void
  ): SyncUnsubscribe {
    const channelId = `sync_pair_${teenId.trim()}`;

    const handleMessage = (msg: SyncMessage) => {
      if (msg.channelId === channelId && msg.type === 'teen_parent_sync') {
        onUpdate(msg.payload);
      }
    };

    this.listeners.add(handleMessage);
    return () => {
      this.listeners.delete(handleMessage);
    };
  }

  // ============================================================================
  // END-TO-END ENCRYPTED (E2EE) CROSS-DEVICE SYNC (H-19 REMEDIATION)
  // ============================================================================

  /**
   * Publishes an end-to-end encrypted teen wellbeing snapshot.
   * Only the paired parent holding the negotiated ECDH session key can decrypt.
   * Zero plaintext psychometrics appear on the wire or any relay server.
   */
  public async publishEncryptedTeenParentUpdate(
    session: E2eeSession,
    profile: Partial<ParentSafeProfile>
  ): Promise<EncryptedSyncEnvelope> {
    const envelope = await encryptPayload(session.sharedKey, session.channelId, profile);
    const message: SyncMessage<EncryptedSyncEnvelope> = {
      type: 'e2ee_envelope',
      channelId: session.channelId,
      senderId: 'teen_e2ee_peer',
      timestamp: envelope.timestamp,
      payload: envelope,
    };

    this.broadcastLocal(message);
    return envelope;
  }

  /**
   * Subscribes to live end-to-end encrypted updates from the paired teen.
   * Decrypts payloads using authenticated AES-256-GCM. Malformed or tampered messages fail closed.
   */
  public subscribeToEncryptedTeenParentUpdates(
    session: E2eeSession,
    onUpdate: (profile: Partial<ParentSafeProfile>) => void,
    onError?: (error: Error) => void
  ): SyncUnsubscribe {
    const handleEnvelope = async (msg: SyncMessage) => {
      if (msg.channelId === session.channelId && msg.type === 'e2ee_envelope') {
        try {
          const decrypted = await decryptPayload<Partial<ParentSafeProfile>>(
            session.sharedKey,
            msg.payload,
            session.channelId
          );
          onUpdate(decrypted);
        } catch (err: any) {
          if (onError) onError(err);
        }
      }
    };

    this.listeners.add(handleEnvelope);
    return () => {
      this.listeners.delete(handleEnvelope);
    };
  }

  /**
   * Publishes an end-to-end encrypted partner sanctuary event.
   * Only the paired partner holding the shared ECDH key can decrypt.
   */
  public async publishEncryptedPartnerEvent(
    session: E2eeSession,
    eventType: string,
    eventData: any
  ): Promise<EncryptedSyncEnvelope> {
    const payload = { eventType, data: eventData };
    const envelope = await encryptPayload(session.sharedKey, session.channelId, payload);
    const message: SyncMessage<EncryptedSyncEnvelope> = {
      type: 'e2ee_envelope',
      channelId: session.channelId,
      senderId: 'partner_e2ee_peer',
      timestamp: envelope.timestamp,
      payload: envelope,
    };

    this.broadcastLocal(message);
    return envelope;
  }

  /**
   * Subscribes to live end-to-end encrypted partner sanctuary events.
   */
  public subscribeToEncryptedPartnerEvents(
    session: E2eeSession,
    onEvent: (eventType: string, data: any) => void,
    onError?: (error: Error) => void
  ): SyncUnsubscribe {
    const handleEnvelope = async (msg: SyncMessage) => {
      if (msg.channelId === session.channelId && msg.type === 'e2ee_envelope') {
        try {
          const decrypted = await decryptPayload<{ eventType: string; data: any }>(
            session.sharedKey,
            msg.payload,
            session.channelId
          );
          onEvent(decrypted.eventType, decrypted.data);
        } catch (err: any) {
          if (onError) onError(err);
        }
      }
    };

    this.listeners.add(handleEnvelope);
    return () => {
      this.listeners.delete(handleEnvelope);
    };
  }

  // ============================================================================
  // PARTNER <-> PARTNER REAL-TIME SYNCHRONIZATION (UNENCRYPTED LOCAL FALLBACK)
  // ============================================================================

  /**
   * Partner device publishes an interaction event (prompt answered, bucket item checked, etc.)
   */
  public publishPartnerEvent(pairingCode: string, eventType: string, eventData: any): void {
    const cleanCode = pairingCode.toUpperCase().replace(/[\s-]+/g, '');
    const channelId = `sync_partner_${cleanCode}`;

    const message: SyncMessage<{ eventType: string; data: any }> = {
      type: 'partner_event_sync',
      channelId,
      senderId: 'partner_peer',
      timestamp: new Date().toISOString(),
      payload: {
        eventType,
        data: eventData,
      },
    };

    this.broadcastLocal(message);
  }

  /**
   * Partner device subscribes to live interaction events from their soul companion.
   */
  public subscribeToPartnerEvents(
    pairingCode: string, 
    onEvent: (eventType: string, data: any) => void
  ): SyncUnsubscribe {
    const cleanCode = pairingCode.toUpperCase().replace(/[\s-]+/g, '');
    const channelId = `sync_partner_${cleanCode}`;

    const handleMessage = (msg: SyncMessage) => {
      if (msg.channelId === channelId && msg.type === 'partner_event_sync') {
        onEvent(msg.payload.eventType, msg.payload.data);
      }
    };

    this.listeners.add(handleMessage);
    return () => {
      this.listeners.delete(handleMessage);
    };
  }

  // ============================================================================
  // INTERNAL TRANSPORT HELPERS
  // ============================================================================

  private notifyListeners(message: SyncMessage): void {
    this.listeners.forEach(listener => {
      try {
        listener(message);
      } catch (err) {
        console.warn('[Sync] Listener error:', err);
      }
    });
  }

  private broadcastLocal(message: SyncMessage): void {
    // 1. In-process dispatch to local subscribers
    this.notifyListeners(message);

    // 2. Cross-tab dispatch via BroadcastChannel
    if (this.localBus) {
      try {
        this.localBus.postMessage(message);
      } catch (err) {
        console.warn('[Sync] Local broadcast failed:', err);
      }
    }
  }
}

export const sovereignSync = new SovereignRealtimeSyncService();
