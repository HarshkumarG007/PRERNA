import { invoke as tauriInvoke } from '@tauri-apps/api/core';
import { deriveSixteenType, isCompleteSixteenType } from '../engine/assessment/sixteenPersonalities';
import { getSecureRandomString } from './cryptoVault';

const INITIAL_DEMO_USERS = [
  {
    id: 'demo-teen-001',
    username: 'aarav',
    password_hash: 'demo123',
    ageRange: '16-17',
    region: 'India - Delhi',
    language: 'en',
    name: 'Aarav Sharma',
    gender: 'male',
    dateOfBirth: '2009-08-15',
    pin: '1234',
    role: 'teen',
    hasCompletedQuestionnaire: true,
    createdAt: '2026-10-31T00:00:00.000Z'
  },
  {
    id: 'demo-user-001',
    username: 'demo',
    password_hash: 'demo123',
    ageRange: '16-17',
    region: 'India',
    language: 'en',
    name: 'Explorer Demo',
    gender: 'prefer-not-to-say',
    dateOfBirth: '2009-05-10',
    pin: '1234',
    role: 'teen',
    hasCompletedQuestionnaire: true,
    createdAt: '2026-10-31T00:00:00.000Z'
  },
  {
    id: 'demo-adult-001',
    username: 'priya',
    password_hash: 'demo123',
    ageRange: '18+',
    region: 'India - Maharashtra',
    language: 'en',
    name: 'Priya Verma',
    gender: 'female',
    dateOfBirth: '1998-04-20',
    pin: '1234',
    role: 'adult',
    hasCompletedQuestionnaire: true,
    createdAt: '2026-10-31T00:00:00.000Z'
  },
  {
    id: 'demo-parent-001',
    username: 'rajesh',
    password_hash: 'demo123',
    ageRange: '18+',
    region: 'India - Delhi',
    language: 'en',
    name: 'Rajesh Sharma',
    gender: 'male',
    dateOfBirth: '1979-11-12',
    pin: '1234',
    role: 'parent',
    hasCompletedQuestionnaire: true,
    createdAt: '2026-10-31T00:00:00.000Z'
  },
  {
    id: 'demo-educator-001',
    username: 'meenakshi',
    password_hash: 'demo123',
    ageRange: '18+',
    region: 'India - Tamil Nadu',
    language: 'en',
    name: 'Dr. Meenakshi Sundaram',
    gender: 'female',
    dateOfBirth: '1982-03-15',
    pin: '1234',
    role: 'educator',
    hasCompletedQuestionnaire: true,
    createdAt: '2026-10-31T00:00:00.000Z'
  },
  {
    id: 'demo-reviewer-001',
    username: 'clinician',
    password_hash: 'demo123',
    ageRange: '18+',
    region: 'India - Delhi',
    language: 'en',
    name: 'Dr. Kavita Nair',
    gender: 'female',
    dateOfBirth: '1980-06-18',
    pin: '1234',
    role: 'reviewer',
    hasCompletedQuestionnaire: true,
    createdAt: '2026-10-31T00:00:00.000Z'
  }
];

const AARAV_BIG_FIVE = { openness: 78, conscientiousness: 72, extraversion: 68, agreeableness: 80, neuroticism: 34 };

const INITIAL_DEMO_PROFILES: Record<string, any> = {
  'demo-teen-001': {
    userId: 'demo-teen-001',
    generatedAt: '2026-10-31T00:00:00.000Z',
    personality: {
      bigFive: AARAV_BIG_FIVE,
      riasec: { realistic: 52, investigative: 82, artistic: 76, social: 74, enterprising: 60, conventional: 50 },
      emotional: { resilience: 78, empathy: 84, emotionalAwareness: 80, impulseControl: 72, socialIntuition: 75 },
    },
    cognition: {
      logicalReasoning: 78,
      verbalFluency: 74,
      spatialIntelligence: 68,
      creativeDivergence: 82,
      processingSpeed: 72,
      workingMemory: 74,
      learningStyle: 'mixed',
    },
    archetype: {
      name: 'The Navigator',
      description: 'An agile, empathetic explorer driven by curiosity and purposeful insight.',
      traits: ['Curious', 'Empathetic', 'Insightful']
    },
    sixteenType: deriveSixteenType(AARAV_BIG_FIVE),
    topCareer: {
      role: 'Game Designer & Systems Thinker',
      matchScore: 92,
      description: 'Combines creative storytelling, algorithmic thinking, and human psychology.'
    },
    wellbeingScore: 85,
    strengths: ['Emotional Intuition', 'Curious Exploration', 'Adaptive Problem-Solving'],
    growthAreas: ['Focus Consistency', 'Pacing & Rest'],
    llmSelfDiscoveryReport: 'Aarav possesses exceptional intellectual curiosity balanced by deep emotional empathy.'
  }
};
INITIAL_DEMO_PROFILES['demo-user-001'] = INITIAL_DEMO_PROFILES['demo-teen-001'];

// Mock database in localStorage
const getMockDb = () => {
  const raw = localStorage.getItem('prerna_mock_db');
  let db = raw ? JSON.parse(raw) : null;
  if (!db || !db.users || db.users.length === 0) {
    db = {
      users: [...INITIAL_DEMO_USERS],
      profiles: { ...INITIAL_DEMO_PROFILES },
      sessions: [],
      crisisEvents: [],
      deliveryRecords: []
    };
    saveMockDb(db);
  } else {
    // Migration: self-heal any cached profile with partial or invalid sixteenType
    let updated = false;
    if (db.profiles) {
      for (const key of Object.keys(db.profiles)) {
        const p = db.profiles[key];
        if (p && p.personality?.bigFive) {
          if (!isCompleteSixteenType(p.sixteenType)) {
            try {
              p.sixteenType = deriveSixteenType(p.personality.bigFive);
              updated = true;
            } catch {}
          }
        }
      }
    }
    if (!db.profiles['demo-teen-001'] || !isCompleteSixteenType(db.profiles['demo-teen-001'].sixteenType)) {
      db.profiles['demo-teen-001'] = { ...INITIAL_DEMO_PROFILES['demo-teen-001'] };
      updated = true;
    }
    if (updated) {
      saveMockDb(db);
    }
  }
  return db;
};

const saveMockDb = (db: any) => {
  localStorage.setItem('prerna_mock_db', JSON.stringify(db));
};

export async function safeInvoke<T>(cmd: string, args?: any): Promise<T> {
  // Check if we are running inside Tauri
  const isTauri = typeof window !== 'undefined' && ((window as any).__TAURI_INTERNALS__ !== undefined || (window as any).__TAURI_IPC__ !== undefined);
  
  if (isTauri) {
    return tauriInvoke<T>(cmd, args);
  }

  // Fallback to Mock Backend for browser (npm run dev)
  const isTest = typeof process !== 'undefined' && (process.env?.NODE_ENV === 'test' || Boolean((process.env as any)?.VITEST));
  
  if (!isTest) {
    // Sanitize credentials before logging to console to protect DPDP compliance
    let safeArgs = args;
    if (args && typeof args === 'object') {
      safeArgs = { ...args };
      if ('passwordInput' in safeArgs) safeArgs.passwordInput = '***';
      if ('pin' in safeArgs) safeArgs.pin = '***';
      if (safeArgs.user && typeof safeArgs.user === 'object') {
        safeArgs.user = { ...safeArgs.user, password_hash: '***', pin: '***' };
      }
    }
    console.log(`[Mock Backend] Invoking ${cmd}`, safeArgs);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate latency in dev
  }

  const db = getMockDb();

  switch (cmd) {
    case 'create_user': {
      const user = args.user;
      const id = 'mock-' + getSecureRandomString(8).toLowerCase();
      db.users.push({
        id,
        username: user.username,
        password_hash: user.password_hash,
        ageRange: user.age_range,
        region: user.region || 'India',
        language: user.language || 'en',
        name: user.name,
        gender: user.gender,
        dateOfBirth: user.date_of_birth,
        pin: user.pin,
        role: user.role,
        hasCompletedQuestionnaire: false,
        createdAt: new Date().toISOString()
      });
      saveMockDb(db);
      return id as any;
    }

    case 'update_user_role': {
      const targetId = args?.userId || localStorage.getItem('prerna_last_user');
      const user = db.users.find((u: any) => u.id === targetId) || (db.users.length > 0 ? db.users[0] : null);
      if (user) {
        user.role = args.role;
        saveMockDb(db);
      }
      return undefined as any;
    }

    case 'authenticate_pin': {
      const targetId = args.userId || localStorage.getItem('prerna_last_user') || 'demo-teen-001';
      let user = db.users.find((u: any) => u.id === targetId || u.username === targetId);
      if (!user && (args.pin === '1234' || args.pin === '0000')) {
        user = db.users[0];
      }
      if (user) {
        if (!user.pin || user.pin === args.pin || args.pin === '1234') {
          return user as any;
        }
      }
      throw new Error("Incorrect PIN. Please try again.");
    }

    case 'resume_session': {
      const targetId = args?.userId || localStorage.getItem('prerna_last_user') || 'demo-teen-001';
      const user = db.users.find((u: any) => u.id === targetId || u.username === targetId) || (db.users.length > 0 ? db.users[0] : null);
      if (user) return user as any;
      throw new Error("User not found");
    }

    case 'complete_questionnaire': {
      const userId = args?.userId || localStorage.getItem('prerna_last_user');
      const user = db.users.find((u: any) => u.id === userId) || (db.users.length > 0 ? db.users[0] : null);
      if (user) {
        user.hasCompletedQuestionnaire = true;
        saveMockDb(db);
      }
      return undefined as any;
    }

    case 'authenticate_user': {
      const { username, passwordInput } = args;
      const isDevBypass = Boolean(import.meta.env.DEV && passwordInput === 'demo123');
      const isDemoAlias = Boolean(import.meta.env.DEV && username === 'demo');
      const user = db.users.find((u: any) => 
        (u.username === username || (isDemoAlias && (u.id === 'demo-user-001' || u.id === 'demo-teen-001'))) && 
        (u.password_hash === passwordInput || isDevBypass)
      );
      if (user) {
        if (user.mfaEnabled) {
          return { mfaRequired: true, userId: user.id } as any;
        }
        return user as any;
      }
      return null as any;
    }

    case 'generate_mfa_secret': {
      const user = db.users.find((u: any) => u.id === args.userId);
      if (!user) return null as any;
      
      const mockSecret = "MOCK-SECRET-" + getSecureRandomString(6);
      user.tempMfaSecret = mockSecret;
      saveMockDb(db);
      
      // A mock SVG representing a QR code
      const mockQrCodeSvg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#ffffff" />
        <rect x="20" y="20" width="160" height="160" fill="none" stroke="#6d28d9" stroke-width="10" />
        <rect x="50" y="50" width="40" height="40" fill="#6d28d9" />
        <rect x="110" y="50" width="40" height="40" fill="#6d28d9" />
        <rect x="50" y="110" width="100" height="40" fill="#6d28d9" />
        <text x="100" y="100" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#6d28d9">MOCK QR CODE</text>
      </svg>`;
      
      return { secret: mockSecret, qr_code_svg: mockQrCodeSvg } as any;
    }

    case 'verify_mfa_setup': {
      const user = db.users.find((u: any) => u.id === args.userId);
      if (!user) return false as any;
      
      // In mock mode, any 6-digit number is accepted to simplify testing
      if (/^\d{6}$/.test(args.token)) {
        user.mfaEnabled = true;
        saveMockDb(db);
        return true as any;
      }
      return false as any;
    }

    case 'verify_login_mfa': {
      const user = db.users.find((u: any) => u.id === args.userId);
      if (!user || !user.mfaEnabled) return null as any;
      
      // In mock mode, any 6-digit number is accepted
      if (/^\d{6}$/.test(args.token)) {
        return user as any;
      }
      throw new Error("Invalid 2FA code");
    }

    case 'get_user': {
      const targetId = args?.userId || localStorage.getItem('prerna_last_user');
      const user = db.users.find((u: any) => u.id === targetId) || (db.users.length > 0 ? db.users[0] : null);
      if (user) return user as any;
      return null as any;
    }

    case 'get_unified_profile': {
      const targetId = args.userId || localStorage.getItem('prerna_last_user') || 'current-user';
      return db.profiles[targetId] || null;
    }

    case 'save_unified_profile': {
      const targetId = args.userId || localStorage.getItem('prerna_last_user') || 'current-user';
      try {
        const parsed = typeof args.profileData === 'string' ? JSON.parse(args.profileData) : args.profileData;
        db.profiles[targetId] = parsed;
        saveMockDb(db);
        return 'profile-saved' as any;
      } catch {
        db.profiles[targetId] = args.profileData;
        saveMockDb(db);
        return 'profile-saved' as any;
      }
    }

    case 'save_session': {
      if (!args.session?.disclosure_version?.trim()) {
        throw new Error('Cannot save session: no disclosure was recorded. Violates DPDP Section 9(3).');
      }
      db.sessions.push({ ...args.session, id: Date.now().toString() });
      saveMockDb(db);
      return undefined as any;
    }

    case 'save_skill_session': {
      if (!args.disclosure_version?.trim()) {
        throw new Error('Cannot save skill session: no disclosure was recorded. Violates DPDP Section 9(3).');
      }
      const sessionObj = {
        id: Date.now().toString(),
        session_type: 'skill_arena',
        raw_choices: JSON.stringify({ score: args.score, game_type: args.game_type }),
        derived_traits: args.cognitive_data,
        disclosure_version: args.disclosure_version,
        disclosure_shown_at: args.disclosure_shown_at,
      };
      db.sessions.push(sessionObj);
      saveMockDb(db);
      return sessionObj.id as any;
    }

    case 'save_trait_snapshot': {
      if (!db.traitSnapshots) db.traitSnapshots = [];
      const snapshot = {
        ...args.snapshot,
        id: 'snapshot-' + Date.now(),
        snapshot_date: new Date().toISOString(),
      };
      db.traitSnapshots.push(snapshot);
      saveMockDb(db);
      return snapshot.id as any;
    }

    case 'get_latest_snapshot': {
      if (!db.traitSnapshots || db.traitSnapshots.length === 0) return null as any;
      return db.traitSnapshots[db.traitSnapshots.length - 1] as any;
    }
    
    case 'revoke_consent': {
      return undefined as any;
    }

    case 'logout': {
      return undefined as any;
    }

    case 'create_crisis_event': {
      const eventId = 'crisis-' + getSecureRandomString(8).toLowerCase();
      if (!db.crisisEvents) db.crisisEvents = [];
      db.crisisEvents.push({
        id: eventId,
        user_id: args.userId || 'current-user',
        detected_at: args.detectedAt || Date.now(),
        severity: args.severity || 'high',
        state: 'HumanReview',
        origin: 'EXTERNAL',
        reviewer_id: null,
        decision: null,
        teen_informed_at: null,
      });
      saveMockDb(db);
      return eventId as any;
    }

    case 'get_pending_crisis_events': {
      const events = (db.crisisEvents || []).filter((e: any) => e.state === 'HumanReview');
      return events as any;
    }

    case 'claim_crisis_event': {
      const targetEventId = args.eventId || args.event_id;
      const evt = (db.crisisEvents || []).find((e: any) => e.id === targetEventId);
      if (!evt) {
        throw new Error('AlreadyAssigned or event does not exist / not pending');
      }
      if (!evt.reviewer_id) {
        evt.reviewer_id = 'mock-clinician-1';
        saveMockDb(db);
      }
      return undefined as any;
    }

    case 'resolve_crisis_event': {
      const targetEventId = args.eventId || args.event_id;
      const evt = (db.crisisEvents || []).find((e: any) => e.id === targetEventId);
      const teenInformed = args.teen_informed_at ?? args.teenInformedAt;
      if (args.decision === 'GuardianNotified' && !teenInformed) {
        throw new Error('Cannot notify guardian: teen has not been informed yet. Violates Crisis Protocol.');
      }
      if (evt) {
        evt.state = args.decision === 'GuardianNotified' ? 'Notified' : args.decision === 'ResourcesOnly' ? 'Monitor' : 'Cleared';
        evt.decision = args.decision;
        evt.teen_informed_at = teenInformed;
        evt.reviewer_credentials_ref = args.reviewer_credentials_ref || args.reviewerCredentialsRef;

        if (args.decision === 'GuardianNotified') {
          if (!db.deliveryRecords) db.deliveryRecords = [];
          const recipientId = (evt.user_id === 'demo-teen-001' || evt.user_id === 'demo-user-001' || evt.user_id === 'current-user')
            ? 'demo-parent-001'
            : `guardian_${evt.user_id}`;
          const nowIso = new Date().toISOString();
          db.deliveryRecords.unshift({
            id: 'deliv-' + getSecureRandomString(8).toLowerCase(),
            crisis_event_id: evt.id,
            recipient_id: recipientId,
            notification_type: 'CRISIS_ESCALATION',
            status: 'Delivered',
            provider: 'SovereignEmergencyAlertProvider',
            provider_reference: `sovereign-alert-${evt.id}`,
            created_at: nowIso,
            updated_at: nowIso,
            error_message: null,
          });
        }

        saveMockDb(db);
      }
      return undefined as any;
    }

    case 'get_crisis_delivery_records': {
      const crisisId = args?.crisisId || args?.crisis_id;
      const records = (db.deliveryRecords || []).filter((r: any) => r.crisis_event_id === crisisId);
      return records as any;
    }

    case 'get_guardian_emergency_alerts': {
      const callerId = localStorage.getItem('prerna_last_user') || 'demo-parent-001';
      const user = (db.users || []).find((u: any) => u.id === callerId);
      if (user && user.role !== 'parent' && user.role !== 'admin') {
        throw new Error('Unauthorized: Only parents and administrators can view guardian emergency alerts');
      }
      const alerts = (db.deliveryRecords || []).filter(
        (r: any) => r.recipient_id === callerId || (callerId === 'demo-parent-001' && r.recipient_id === 'demo-parent-001')
      );
      return alerts as any;
    }

    case 'chat_with_mentor': {
      const msg = args.request?.message?.toLowerCase() || '';
      const convId = args.request?.conversation_id || 'conv-' + Date.now();
      const userProfile = db.profiles ? Object.values(db.profiles)[0] as any : null;
      const bigFive = args.request?.user_context?.bigFive || userProfile?.personality?.bigFive;

      // 1. Crisis Safety Filter
      if (/\b(suicide|kill myself|end my life|die|self harm|hurt myself|cutter|cutting)\b/i.test(msg)) {
        return {
          response: "It sounds like you are going through a really painful moment right now. Please know that you are not alone and help is available. Would you be willing to speak with someone who can support you? You can call KIRAN (1800-599-0019) or Vandrevala Foundation (9999-666-555) 24/7 for free, confidential guidance.",
          conversation_id: convId,
          sentiment: 'distress',
          suggested_actions: ['Call KIRAN Helpline (1800-599-0019)', 'Connect with a trusted adult'],
        } as any;
      }

      // 2. Explicit AI Self-Identification Check (P3-1 Acceptance Criteria)
      if (/\b(are you (a )?(real (person|human)|human|real)|who are you|are you real)\b/i.test(msg)) {
        return {
          response: "I am PRERNA's AI Mentor. I am an artificial intelligence, not a real human or licensed therapist. I am here to safely help you reflect on your goals, strengths, and self-discovery journey.",
          conversation_id: convId,
          sentiment: 'neutral',
          suggested_actions: ['Explore my strengths', 'Discuss career pathways'],
        } as any;
      }

      // 3. Self-Evolution, Friction & Mitigation Strategy guidance
      if (/\b(better version|procrastinat|overthink|perfection|friction|habit|evolv|growth|weakness|self.?image)\b/i.test(msg)) {
        return {
          response: "Becoming a better version of yourself is not about self-criticism—it is about honoring your current foundation and applying micro-mitigations when friction happens. For example, using the '5-Minute Micro-Start' cuts through task avoidance, while the 'Thought vs. Fact Detangler' quiets overthinking. You can track these anytime in your Self-Evolution Sanctuary.",
          conversation_id: convId,
          sentiment: 'empowering',
          suggested_actions: ['Open Self-Evolution Sanctuary', 'Try 5-Minute Micro-Start', 'Log a Superpower Win'],
        } as any;
      }

      // 4. Maslow's Hierarchy, Wants vs. Needs & Distraction Guidance
      if (/\b(maslow|want.*need|desire|distract|craving|urge|impulse|scroll|bedrock|belonging)\b/i.test(msg)) {
        return {
          response: "According to Maslow's Hierarchy of Needs, sudden urges to scroll, snack, or avoid work are rarely failures of willpower—they are usually disguised signals that your biological foundation (sleep, sensory rest) or emotional safety is starved. When you nourish the root need, fleeting distractions lose their power. Would you like to explore your Needs & Desires Compass?",
          conversation_id: convId,
          sentiment: 'empowering',
          suggested_actions: ['Open Needs & Desires Compass', 'Check Maslow Foundation', 'Try 10-Minute Sensory Reset'],
        } as any;
      }

      // 3. Trait Context Reflection (P3-2 Acceptance Criteria)
      let traitRef = '';
      if (bigFive) {
        const { openness, conscientiousness, extraversion } = bigFive;
        if (openness >= 70) {
          traitRef = `Given your high Openness (${openness}%), your natural curiosity will serve you well in exploring this.`;
        } else if (conscientiousness >= 70) {
          traitRef = `With your strong Conscientiousness (${conscientiousness}%), planning this methodically can give you real confidence.`;
        } else if (extraversion >= 70) {
          traitRef = `Your social energy and Extraversion (${extraversion}%) can be a great strength here.`;
        }
      }

      const responseText = traitRef
        ? `I hear you. ${traitRef} Taking one step at a time helps turn big thoughts into clear action. How would you like to approach this next?`
        : "I hear you. Taking time to pause and reflect on your thoughts is a valuable strength. What feels like the most important part of this for you right now?";

      return {
        response: responseText,
        conversation_id: convId,
        sentiment: 'reflective',
        suggested_actions: ['Reflect on my strengths', 'Set a small daily goal'],
      } as any;
    }

    case 'export_all_user_data':
    case 'export_user_data': {
      const targetId = args?.userId;
      const user = targetId ? (db.users || []).find((u: any) => u.id === targetId) : ((db.users || [])[0] || null);
      const profile = (targetId && db.profiles) ? (db.profiles[targetId] || null) : null;
      const sessions = (db.sessions || []).filter((s: any) => s.userId === targetId);
      const crisisEvents = (db.crisisEvents || []).filter((c: any) => c.user_id === targetId);

      return {
        export_timestamp: new Date().toISOString(),
        user: user ? {
          id: user.id,
          username: user.name || user.username,
          role: user.role,
          ageTier: user.ageTier,
          createdAt: user.createdAt,
        } : null,
        profile: profile || null,
        sessions: sessions || [],
        crisis_events_log: crisisEvents || [],
        compliance_meta: {
          dpdp_section_9_compliant: true,
          behavioral_tracking: false,
          storage_mode: 'local_encrypted_sqlite',
          version: '1.2.3',
        },
      } as any;
    }

    case 'get_access_audit_log': {
      const logs = [
        {
          id: 'log-1',
          accessedBy: 'self',
          dataScope: 'Unified Profile & Assessments',
          accessedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 'log-2',
          accessedBy: 'system_process',
          dataScope: 'Exponential Moving Average Scoring (EMA)',
          accessedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'log-3',
          accessedBy: 'parent_dashboard',
          dataScope: 'ParentSafeProfile (Filtered Strengths & Career Fit)',
          accessedAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ];
      return logs as any;
    }

    case 'get_sharing_preferences': {
      return {
        userId: args?.userId || 'current-user',
        lastUpdated: new Date().toISOString(),
        shares: {
          wellbeingScore: true,
          careerInterests: true,
          strengths: true,
          dailyCheckIn: true,
          concerns: false,
        },
        requiresApproval: {
          fullProfile: true,
          chatHistory: true,
          riskAlerts: true,
        },
      } as any;
    }

    case 'update_sharing_preferences': {
      return undefined as any;
    }

    case 'insert_audit_log': {
      return undefined as any;
    }

    case 'get_model_status': {
      return {
        loaded: true,
        model_name: 'PRERNA-Mentor-7B-Q4_K_M',
        vram_usage_mb: 4120,
        temperature: 0.7,
      } as any;
    }

    case 'get_parent_view': {
      const profile = db.profiles ? Object.values(db.profiles)[0] as any : null;
      if (!profile) {
        return {
          has_access: true,
          profile: {
            wellbeing_score: 75,
            career_interests: ['Technology', 'Creative Arts', 'Science'],
            strengths: ['Curiosity', 'Empathy', 'Creative Problem Solving'],
            last_active: new Date().toISOString(),
          },
        } as any;
      }

      return {
        has_access: true,
        profile: {
          wellbeing_score: profile.wellbeingScore || 75,
          career_interests: (profile.careerMatches || []).slice(0, 3).map((c: any) => c.field || c.role || 'Exploration'),
          strengths: profile.strengths || ['Curiosity', 'Resilience'],
          last_active: profile.generatedAt || new Date().toISOString(),
        },
      } as any;
    }

    case 'import_user_data': {
      if (args?.data?.user) {
        db.users = db.users || [];
        const existingIdx = db.users.findIndex((u: any) => u.id === args.data.user.id);
        if (existingIdx >= 0) {
          db.users[existingIdx] = args.data.user;
        } else {
          db.users.push(args.data.user);
        }
      }
      if (args?.data?.profile && args?.data?.user?.id) {
        db.profiles = db.profiles || {};
        db.profiles[args.data.user.id] = args.data.profile;
      }
      saveMockDb(db);
      return { success: true } as any;
    }

    case 'delete_user_data': {
      db.users = (db.users || []).filter((u: any) => u.id !== args.userId);
      delete db.profiles[args.userId];
      db.sessions = (db.sessions || []).filter((s: any) => s.userId !== args.userId);
      saveMockDb(db);
      return undefined as any;
    }

    case 'get_school_students': {
      return [
        'vp-student-001', 'vp-student-002', 'vp-student-003', 'vp-student-004',
        'vp-student-005', 'vp-student-006', 'vp-student-007', 'vp-student-008'
      ] as any;
    }

    case 'generate_school_report': {
      const studentPool = [
        { id: 'vp-student-001', grade: 'Grade 10', wellbeing: 84, riasec: { investigative: 85, artistic: 72, social: 65, realistic: 40, enterprising: 55, conventional: 35 }, strengths: ['Creativity', 'Reliability'] },
        { id: 'vp-student-002', grade: 'Grade 10', wellbeing: 78, riasec: { investigative: 75, artistic: 80, social: 70, realistic: 35, enterprising: 60, conventional: 40 }, strengths: ['Creativity', 'Leadership'] },
        { id: 'vp-student-003', grade: 'Grade 10', wellbeing: 82, riasec: { investigative: 88, artistic: 60, social: 75, realistic: 45, enterprising: 50, conventional: 30 }, strengths: ['Reliability', 'Creativity'] },
        { id: 'vp-student-004', grade: 'Grade 11', wellbeing: 72, riasec: { investigative: 90, artistic: 65, social: 55, realistic: 50, enterprising: 65, conventional: 45 }, strengths: ['Reliability', 'Leadership'] },
        { id: 'vp-student-005', grade: 'Grade 11', wellbeing: 76, riasec: { investigative: 60, artistic: 55, social: 80, realistic: 30, enterprising: 85, conventional: 65 }, strengths: ['Leadership', 'Reliability'] },
        { id: 'vp-student-006', grade: 'Grade 11', wellbeing: 80, riasec: { investigative: 65, artistic: 70, social: 85, realistic: 35, enterprising: 80, conventional: 60 }, strengths: ['Leadership', 'Creativity'] },
        { id: 'vp-student-007', grade: 'Grade 9', wellbeing: 85, riasec: { investigative: 70, artistic: 75, social: 70, realistic: 40, enterprising: 60, conventional: 35 }, strengths: ['Creativity', 'Reliability'] },
        { id: 'vp-student-008', grade: 'Grade 9', wellbeing: 88, riasec: { investigative: 72, artistic: 82, social: 78, realistic: 38, enterprising: 58, conventional: 32 }, strengths: ['Creativity', 'Leadership'] },
      ];

      const studentIds: string[] = args?.student_ids && args.student_ids.length > 0 
        ? args.student_ids 
        : studentPool.map(s => s.id);

      const uniqueIds = Array.from(new Set(studentIds));

      // 1. K-Anonymity Guard (k >= 5)
      if (uniqueIds.length < 5) {
        return {
          cohort_size: uniqueIds.length,
          average_wellbeing: 0,
          top_career_clusters: [],
          top_cognitive_strengths: [],
          k_anonymity_threshold_met: false,
          differential_privacy_applied: false,
          privacy_epsilon: 1.0,
          remaining_query_budget: (window as any).__MOCK_PRIVACY_BUDGET__ ?? 10,
        } as any;
      }

      let currentBudget = (window as any).__MOCK_PRIVACY_BUDGET__ ?? 10;
      if (currentBudget <= 0) {
        throw new Error('Privacy budget exhausted: Maximum cohort analytics queries reached for this educator session to prevent reconstruction attacks.');
      }

      const pastQueries: Set<string>[] = (window as any).__MOCK_PAST_QUERIES__ ?? [];
      const currentQuery = new Set(uniqueIds);

      // 2. Differencing attack prevention (|symmetric difference| >= 5)
      for (const past of pastQueries) {
        let intersection = 0;
        for (const id of currentQuery) {
          if (past.has(id)) intersection++;
        }
        if (intersection > 0) {
          let diffNew = 0;
          for (const id of currentQuery) {
            if (!past.has(id)) diffNew++;
          }
          let diffPast = 0;
          for (const id of past) {
            if (!currentQuery.has(id)) diffPast++;
          }
          const symmetricDiff = diffNew + diffPast;
          if (symmetricDiff > 0 && symmetricDiff < 5) {
            throw new Error(`Privacy violation (differencing attack detected): The requested cohort overlaps with a previous query and differs by only ${symmetricDiff} individual(s), which is below the safe threshold of 5. Query blocked.`);
          }
        }
      }

      currentBudget -= 1;
      (window as any).__MOCK_PRIVACY_BUDGET__ = currentBudget;
      pastQueries.push(currentQuery);
      (window as any).__MOCK_PAST_QUERIES__ = pastQueries;

      const matched = studentPool.filter(s => currentQuery.has(s.id));
      const rawAvg = matched.reduce((acc, s) => acc + s.wellbeing, 0) / (matched.length || 1);

      // Laplace noise with b = (100 / N) / 1.0
      const n = Math.max(matched.length, 5);
      const sensitivity = 100 / n;
      const b = sensitivity / 1.0;
      const u = Math.random() - 0.5;
      const sgn = u < 0 ? -1 : 1;
      const p = Math.max(1 - 2 * Math.abs(u), 1e-10);
      const noise = -b * sgn * Math.log(p);
      const noisedAvg = Math.min(100, Math.max(0, Math.round(rawAvg + noise)));

      const careerScores: Record<string, number> = {
        'Technology & Research': 0,
        'Design & Creative Arts': 0,
        'Helping & Healthcare': 0,
        'Business & Leadership': 0,
        'Engineering & Practical': 0,
      };
      matched.forEach(s => {
        if (s.riasec.investigative > 60) careerScores['Technology & Research'] += 1;
        if (s.riasec.artistic > 60) careerScores['Design & Creative Arts'] += 1;
        if (s.riasec.social > 60) careerScores['Helping & Healthcare'] += 1;
        if (s.riasec.enterprising > 60) careerScores['Business & Leadership'] += 1;
        if (s.riasec.realistic > 40) careerScores['Engineering & Practical'] += 1;
      });

      const topCareers = Object.entries(careerScores)
        .filter(([_, count]) => count >= 3)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name);

      const strengthScores: Record<string, number> = {};
      matched.forEach(s => {
        s.strengths.forEach(st => {
          strengthScores[st] = (strengthScores[st] || 0) + 1;
        });
      });
      const topStrengths = Object.entries(strengthScores)
        .filter(([_, count]) => count >= 3)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name);

      return {
        cohort_size: matched.length,
        average_wellbeing: noisedAvg,
        top_career_clusters: topCareers.length > 0 ? topCareers : ['Technology & Research', 'Design & Creative Arts', 'Helping & Healthcare'],
        top_cognitive_strengths: topStrengths.length > 0 ? topStrengths : ['Creativity', 'Reliability', 'Leadership'],
        k_anonymity_threshold_met: true,
        differential_privacy_applied: true,
        privacy_epsilon: 1.0,
        remaining_query_budget: currentBudget,
      } as any;
    }

    case 'generate_llm_text': {
      // Simulate generating a self-discovery report based on the prompt
      return `Welcome to your inner world! Based on your responses, you show an incredible blend of curiosity and care. 
      
As someone with high Openness, you aren't afraid to explore uncharted territories—whether that's a new hobby, an unusual book, or a complex idea. Your empathy makes you a fantastic listener, a trait your friends deeply appreciate.

One challenge you might face is balancing your rich inner life with the demands of the outer world. But remember, your sensitivity isn't a weakness; it's the very thing that makes you so insightful.

Your path ahead is uniquely yours. Keep asking questions and never lose that spark of wonder!` as any;
    }

    case 'unload_model': {
      return undefined as any;
    }

    default:
      console.warn(`[Mock Backend] Unhandled command: ${cmd}`);
      return null as any;
  }
}
