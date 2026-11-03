/**
 * PRERNA • Sovereign Real-Time Synchronization Engine
 * 
 * Manages local real-time synchronization for:
 * 1. Teen <-> Parent Shared Wellbeing Window (Local broadcast)
 * 2. Partner <-> Partner Sanctuary (Local broadcast)
 * 
 * Transport Layers:
 * - Local Layer: HTML5 BroadcastChannel (Zero-network, instant multi-tab/same-device sync)
 * - Cloud Relay Layer: Intentionally UNPLUGGED per Audit Addendum 1 (H-19) until
 *   cryptographic device-to-device end-to-end encryption (E2EE) and authenticated
 *   private channels are implemented.
 * - Sovereign Invariant: Zero minor journals, psychometrics, or private relationship
 *   events are ever broadcast in plaintext to unauthenticated public cloud channels.
 */

import { ParentSafeProfile } from '../parent/permissions';

export interface SyncMessage<T = any> {
  type: 'teen_parent_sync' | 'partner_event_sync' | 'heartbeat';
  channelId: string;
  senderId: string;
  timestamp: string;
  payload: T;
}

export type SyncUnsubscribe = () => void;

class SovereignRealtimeSyncService {
  private localBus: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.localBus = new BroadcastChannel('prerna_sovereign_sync_bus');
      } catch {
        this.localBus = null;
      }
    }
  }

  // ============================================================================
  // TEEN <-> PARENT REAL-TIME SYNCHRONIZATION
  // ============================================================================

  /**
   * Teen device publishes a consent-screened wellbeing snapshot to the paired parent.
   * Broadcasts locally via BroadcastChannel. Cloud broadcast is kept unplugged per H-19.
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

    // 1. Broadcast locally (for same-device / multi-tab parent testing)
    this.broadcastLocal(message);

    // 2. Cloud broadcast is disabled per H-19 until authenticated E2EE is implemented
  }

  /**
   * Parent device subscribes to live updates from their paired teen.
   */
  public subscribeToTeenParentUpdates(
    teenId: string, 
    onUpdate: (profile: Partial<ParentSafeProfile>) => void
  ): SyncUnsubscribe {
    const channelId = `sync_pair_${teenId.trim()}`;

    // Handler for incoming messages
    const handleMessage = (msg: SyncMessage) => {
      if (msg.channelId === channelId && msg.type === 'teen_parent_sync') {
        onUpdate(msg.payload);
      }
    };

    // Listen on local BroadcastChannel
    const localHandler = (event: MessageEvent) => {
      try {
        handleMessage(event.data);
      } catch {}
    };

    if (this.localBus) {
      this.localBus.addEventListener('message', localHandler);
    }

    // Return cleanup function
    return () => {
      if (this.localBus) {
        this.localBus.removeEventListener('message', localHandler);
      }
    };
  }

  // ============================================================================
  // PARTNER <-> PARTNER REAL-TIME SYNCHRONIZATION
  // ============================================================================

  /**
   * Partner device publishes an interaction event (prompt answered, bucket item checked, etc.)
   * Broadcasts locally via BroadcastChannel. Cloud broadcast is kept unplugged per H-19.
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

    // 1. Broadcast locally
    this.broadcastLocal(message);

    // 2. Cloud broadcast is disabled per H-19 until authenticated E2EE is implemented
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

    const localHandler = (event: MessageEvent) => {
      try {
        handleMessage(event.data);
      } catch {}
    };

    if (this.localBus) {
      this.localBus.addEventListener('message', localHandler);
    }

    return () => {
      if (this.localBus) {
        this.localBus.removeEventListener('message', localHandler);
      }
    };
  }

  // ============================================================================
  // INTERNAL TRANSPORT HELPERS
  // ============================================================================

  private broadcastLocal(message: SyncMessage): void {
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
