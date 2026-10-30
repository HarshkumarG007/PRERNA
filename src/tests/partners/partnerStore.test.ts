import { describe, it, expect, beforeEach } from 'vitest';
import { usePartnerStore } from '../../store/partnerStore';
import { useAppStore } from '../../store';

describe('PartnerStore Ecosystem & Isolation', () => {
  beforeEach(() => {
    localStorage.clear();
    usePartnerStore.setState({
      profile: {
        nickname: 'My Beloved',
        pronouns: 'They/Them',
        mode: 'lovers',
        relationshipType: 'romantic_partner',
        anniversaryDate: undefined,
        primaryLoveLanguage: 'words_of_affirmation',
        loveLanguageScores: {
          wordsOfAffirmation: 85,
          qualityTime: 90,
          receivingGifts: 50,
          actsOfService: 75,
          physicalTouch: 80,
        },
        emotionalNeeds: ['Unconditional acceptance', 'Safe space for tears'],
        comfortBoundaries: ['Need 30 mins quiet time after work'],
        visibility: {
          loveLanguages: 'shared_partner',
          emotionalNeeds: 'shared_partner',
          boundaries: 'shared_partner',
        },
      },
      connection: {
        isActivated: false,
        isGateLocked: true,
        secretPasscode: null,
        status: 'unpaired',
        pairedPartnerName: undefined,
        pairedSince: undefined,
      },
      conversationPrompts: [
        {
          id: 'p_1',
          category: 'connection',
          question: 'What is a small, quiet moment with me this week that brought you unexpected peace?',
          myAnswer: undefined,
          partnerAnswer: undefined,
        },
      ],
      dateIdeas: [],
      sharedMemories: [],
      journalEntries: [],
      bucketList: [],
      chatHistory: [],
    });
  });

  it('initializes in a locked, non-activated gate state by default', () => {
    const { connection } = usePartnerStore.getState();
    expect(connection.isActivated).toBe(false);
    expect(connection.isGateLocked).toBe(true);
    expect(connection.secretPasscode).toBeNull();
  });

  it('activates partners with passcode and unlocks gate', () => {
    const store = usePartnerStore.getState();
    store.activatePartners('7788', 'lovers');

    const state = usePartnerStore.getState();
    expect(state.connection.isActivated).toBe(true);
    expect(state.connection.isGateLocked).toBe(false);
    expect(state.connection.secretPasscode).toBe('7788');
    expect(state.profile.mode).toBe('lovers');
    expect(state.profile.relationshipType).toBe('romantic_partner');
  });

  it('locks the gate and validates passcode unlocking', () => {
    const store = usePartnerStore.getState();
    store.activatePartners('4321', 'lovers');

    // Lock gate
    store.lockGate();
    expect(usePartnerStore.getState().connection.isGateLocked).toBe(true);

    // Wrong passcode fails
    const wrongAttempt = store.unlockGate('9999');
    expect(wrongAttempt).toBe(false);
    expect(usePartnerStore.getState().connection.isGateLocked).toBe(true);

    // Correct passcode succeeds
    const correctAttempt = store.unlockGate('4321');
    expect(correctAttempt).toBe(true);
    expect(usePartnerStore.getState().connection.isGateLocked).toBe(false);
  });

  it('supports emergency lockGate immediately', () => {
    const store = usePartnerStore.getState();
    store.activatePartners('1234', 'lovers');
    expect(usePartnerStore.getState().connection.isGateLocked).toBe(false);

    store.lockGate();
    expect(usePartnerStore.getState().connection.isGateLocked).toBe(true);
  });

  it('switches between lovers and besties modes seamlessly', () => {
    const store = usePartnerStore.getState();
    store.setRelationshipMode('besties');
    expect(usePartnerStore.getState().profile.mode).toBe('besties');
    expect(usePartnerStore.getState().profile.relationshipType).toBe('best_friend');

    store.setRelationshipMode('lovers');
    expect(usePartnerStore.getState().profile.mode).toBe('lovers');
    expect(usePartnerStore.getState().profile.relationshipType).toBe('romantic_partner');
  });

  it('updates profile and honors privacy visibility boundaries', () => {
    const store = usePartnerStore.getState();
    store.updateProfile({
      nickname: 'My Jaan',
      visibility: {
        loveLanguages: 'shared_partner',
        emotionalNeeds: 'private',
        boundaries: 'private',
      },
    });

    const updated = usePartnerStore.getState().profile;
    expect(updated.nickname).toBe('My Jaan');
    expect(updated.visibility.emotionalNeeds).toBe('private');
    expect(updated.visibility.boundaries).toBe('private');
  });

  it('generates pairing shortcode and nonce', () => {
    const store = usePartnerStore.getState();
    const result = store.initiatePairing();

    expect(result.shortCode).toMatch(/^LOVE-\d{3}$/);
    expect(result.nonce).toMatch(/^prn_pair_/);

    const conn = usePartnerStore.getState().connection;
    expect(conn.status).toBe('pairing_pending');
    expect(conn.pairingShortCode).toBe(result.shortCode);
  });

  it('completes pairing and unpairs safely without destroying local profile', () => {
    const store = usePartnerStore.getState();
    store.completePairing('Simran');

    const pairedConn = usePartnerStore.getState().connection;
    expect(pairedConn.status).toBe('paired');
    expect(pairedConn.pairedPartnerName).toBe('Simran');
    expect(pairedConn.pairedSince).toBeDefined();

    // Unpair partner
    store.unpair();
    const unpairedConn = usePartnerStore.getState().connection;
    expect(unpairedConn.status).toBe('unpaired');
    expect(unpairedConn.pairedPartnerName).toBeUndefined();

    // Profile remains safe on device
    expect(usePartnerStore.getState().profile.nickname).toBe('My Beloved');
  });

  it('answers daily heart cards and records the answer', () => {
    const store = usePartnerStore.getState();
    store.answerPrompt('p_1', 'When we sat together in silence and drank ginger tea.');

    const prompt = usePartnerStore.getState().conversationPrompts.find((p) => p.id === 'p_1');
    expect(prompt?.myAnswer).toBe('When we sat together in silence and drank ginger tea.');
    expect(prompt?.answeredAt).toBeDefined();
  });

  it('manages date ideas and toggle completion', () => {
    const store = usePartnerStore.getState();
    store.addDateIdea({
      title: 'Midnight Stargazing',
      category: 'wellness',
      description: 'Laying on the terrace watching constellations.',
    });

    const date = usePartnerStore.getState().dateIdeas.find((d) => d.title === 'Midnight Stargazing');
    expect(date).toBeDefined();
    expect(date?.completed).toBe(false);

    if (date) {
      store.toggleDateCompleted(date.id);
      const updated = usePartnerStore.getState().dateIdeas.find((d) => d.id === date.id);
      expect(updated?.completed).toBe(true);
    }
  });

  it('manages dual journal entries: enforces private_to_me vs shared_with_partner', () => {
    const store = usePartnerStore.getState();

    // Add private entry
    store.addJournalEntry({
      content: 'Reflections on my personal doubts and fears.',
      visibility: 'private_to_me',
      mood: 'reflective',
    });

    // Add shared entry
    store.addJournalEntry({
      content: 'We cooked together and watched the rain.',
      visibility: 'shared_with_partner',
      mood: 'radiant',
    });

    const entries = usePartnerStore.getState().journalEntries;
    expect(entries).toHaveLength(2);

    const privateEntry = entries.find((e) => e.visibility === 'private_to_me');
    const sharedEntry = entries.find((e) => e.visibility === 'shared_with_partner');

    expect(privateEntry?.content).toBe('Reflections on my personal doubts and fears.');
    expect(sharedEntry?.content).toBe('We cooked together and watched the rain.');
  });

  it('adds and verifies memories in the sacred milestone vault', () => {
    const store = usePartnerStore.getState();
    store.addMemory({
      date: '2026-02-14',
      title: 'The Evening We First Connected',
      notes: 'A four-hour conversation that felt like 5 minutes.',
      category: 'first_meet',
      emoji: '✨',
    });

    const memory = usePartnerStore.getState().sharedMemories[0];
    expect(memory.title).toBe('The Evening We First Connected');
    expect(memory.emoji).toBe('✨');
  });

  it('confirms Adult persona role routing isolation in appStore', () => {
    useAppStore.setState({
      user: {
        id: 'test_user_adult',
        role: 'teen',
        ageRange: '18+',
        createdAt: new Date().toISOString(),
      } as any,
    });

    // Teen persona
    useAppStore.getState().updateRole('teen');
    expect(useAppStore.getState().user?.role).toBe('teen');
    expect(localStorage.getItem('prerna_user_role')).toBe('teen');

    // Adult persona
    useAppStore.getState().updateRole('adult');
    expect(useAppStore.getState().user?.role).toBe('adult');
    expect(localStorage.getItem('prerna_user_role')).toBe('adult');

    // Educator persona
    useAppStore.getState().updateRole('educator');
    expect(useAppStore.getState().user?.role).toBe('educator');
    expect(localStorage.getItem('prerna_user_role')).toBe('educator');

    // Parent persona
    useAppStore.getState().updateRole('parent');
    expect(useAppStore.getState().user?.role).toBe('parent');
    expect(localStorage.getItem('prerna_user_role')).toBe('parent');
  });
});
