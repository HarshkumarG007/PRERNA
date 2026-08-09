import { invoke as tauriInvoke } from '@tauri-apps/api/core';

// Mock database in localStorage
const getMockDb = () => {
  const db = localStorage.getItem('prerna_mock_db');
  return db ? JSON.parse(db) : { users: [], profiles: {}, sessions: [] };
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
  console.log(`[Mock Backend] Invoking ${cmd}`, args);
  const db = getMockDb();

  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate latency

  switch (cmd) {
    case 'create_user': {
      const user = args.user;
      const id = 'mock-' + Math.random().toString(36).substring(2, 9);
      db.users.push({
        id,
        username: user.username,
        password_hash: user.password_hash,
        ageRange: user.age_range,
        region: user.region,
        language: user.language,
        createdAt: new Date().toISOString()
      });
      saveMockDb(db);
      return id as any;
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
      const user = db.users.find((u: any) => u.id === args.userId);
      if (user) return user as any;
      return null as any;
    }

    case 'get_unified_profile': {
      return db.profiles[args.userId] || null;
    }

    case 'save_session': {
      db.sessions.push({ ...args.session, id: Date.now().toString() });
      saveMockDb(db);
      return undefined as any;
    }
    
    case 'revoke_consent': {
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
