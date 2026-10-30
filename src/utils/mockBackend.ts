import { invoke as tauriInvoke } from '@tauri-apps/api/core';

// Mock database in localStorage
const getMockDb = () => {
  const db = localStorage.getItem('prerna_mock_db');
  return db ? JSON.parse(db) : { users: [], profiles: {}, sessions: [], crisisEvents: [] };
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
      const id = 'mock-' + Math.random().toString(36).substring(2, 9);
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
      const targetId = args.userId || localStorage.getItem('prerna_last_user');
      const user = db.users.find((u: any) => u.id === targetId) || (db.users.length > 0 ? db.users[0] : null);
      if (user) {
        if (!user.pin || user.pin === args.pin) {
          return user as any;
        }
      }
      throw new Error("Incorrect PIN. Please try again.");
    }

    case 'resume_session': {
      const targetId = args?.userId || localStorage.getItem('prerna_last_user');
      const user = db.users.find((u: any) => u.id === targetId) || (db.users.length > 0 ? db.users[0] : null);
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
      const user = db.users.find((u: any) => u.username === username && u.password_hash === passwordInput);
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
      
      const mockSecret = "MOCK-SECRET-" + Math.random().toString(36).substring(2, 8).toUpperCase();
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
      const eventId = 'crisis-' + Math.random().toString(36).substring(2, 9);
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
      const evt = (db.crisisEvents || []).find((e: any) => e.id === args.eventId);
      if (evt) {
        evt.reviewer_id = 'mock-clinician-1';
        saveMockDb(db);
      }
      return undefined as any;
    }

    case 'resolve_crisis_event': {
      const evt = (db.crisisEvents || []).find((e: any) => e.id === args.eventId);
      const teenInformed = args.teen_informed_at ?? args.teenInformedAt;
      if (evt) {
        if (args.decision === 'GuardianNotified' && !teenInformed) {
          throw new Error('Cannot notify guardian: teen has not been informed yet. Violates Crisis Protocol.');
        }
        evt.state = args.decision === 'GuardianNotified' ? 'Escalate' : args.decision === 'ResourcesOnly' ? 'Monitor' : 'Cleared';
        evt.decision = args.decision;
        evt.teen_informed_at = teenInformed;
        evt.reviewer_credentials_ref = args.reviewer_credentials_ref || args.reviewerCredentialsRef;
        saveMockDb(db);
      }
      return undefined as any;
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
      const targetId = args.userId || 'current-user';
      const user = (db.users || []).find((u: any) => u.id === targetId) || (db.users && db.users[0]);
      const profile = db.profiles ? (db.profiles[targetId] || Object.values(db.profiles)[0]) : null;
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
          version: '1.0.0',
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

    case 'delete_user_data': {
      db.users = (db.users || []).filter((u: any) => u.id !== args.userId);
      delete db.profiles[args.userId];
      db.sessions = (db.sessions || []).filter((s: any) => s.userId !== args.userId);
      saveMockDb(db);
      return undefined as any;
    }

    case 'generate_llm_text': {
      // Simulate generating a self-discovery report based on the prompt
      return `Welcome to your inner world! Based on your responses, you show an incredible blend of curiosity and care. 
      
As someone with high Openness, you aren't afraid to explore uncharted territories—whether that's a new hobby, an unusual book, or a complex idea. Your empathy makes you a fantastic listener, a trait your friends deeply appreciate.

One challenge you might face is balancing your rich inner life with the demands of the outer world. But remember, your sensitivity isn't a weakness; it's the very thing that makes you so insightful.

Your path ahead is uniquely yours. Keep asking questions and never lose that spark of wonder!` as any;
    }

    default:
      console.warn(`[Mock Backend] Unhandled command: ${cmd}`);
      return null as any;
  }
}
