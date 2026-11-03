import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { hashPasscode, verifyPasscode, getSecureRandomInt, getSecureRandomString } from '../utils/cryptoVault';
import { evaluateCrisisPatterns } from '../engine/crisis/patternDetection';

export type RelationshipMode = 'lovers' | 'besties';
export type RelationshipType = 'romantic_partner' | 'spouse' | 'dating' | 'best_friend' | 'soul_companion';

export interface PartnerProfile {
  nickname: string;
  pronouns: string;
  mode: RelationshipMode;
  relationshipType: RelationshipType;
  anniversaryDate?: string;
  primaryLoveLanguage: 'words_of_affirmation' | 'quality_time' | 'receiving_gifts' | 'acts_of_service' | 'physical_touch';
  loveLanguageScores: {
    wordsOfAffirmation: number;
    qualityTime: number;
    receivingGifts: number;
    actsOfService: number;
    physicalTouch: number;
  };
  emotionalNeeds: string[];
  comfortBoundaries: string[];
  visibility: {
    loveLanguages: 'private' | 'shared_partner' | 'shared_ai';
    emotionalNeeds: 'private' | 'shared_partner' | 'shared_ai';
    boundaries: 'private' | 'shared_partner' | 'shared_ai';
  };
}

export interface PartnerConnection {
  isActivated: boolean;
  isGateLocked: boolean;
  secretPasscode: string | null;
  status: 'unpaired' | 'pairing_pending' | 'paired';
  pairedPartnerName?: string;
  pairedSince?: string;
  pairingShortCode?: string;
  pairingNonce?: string;
}

export interface ConversationPrompt {
  id: string;
  category: 'connection' | 'playful' | 'deep' | 'vulnerable' | 'future';
  question: string;
  myAnswer?: string;
  partnerAnswer?: string;
  answeredAt?: string;
}

export interface DateIdea {
  id: string;
  title: string;
  description: string;
  category: 'cozy' | 'adventurous' | 'deep_conversation' | 'budget_friendly' | 'wellness';
  completed: boolean;
}

export interface SharedMemory {
  id: string;
  title: string;
  date: string;
  notes: string;
  emoji: string;
  category: 'first_meet' | 'milestone' | 'trip' | 'celebration' | 'random_magic';
}

export interface PartnerJournalEntry {
  id: string;
  content: string;
  visibility: 'private_to_me' | 'shared_with_partner' | 'shared_with_ai';
  mood: 'radiant' | 'peaceful' | 'vulnerable' | 'reflective' | 'struggling';
  createdAt: string;
}

export interface BucketListItem {
  id: string;
  title: string;
  completed: boolean;
  category: 'travel' | 'lifestyle' | 'creative' | 'learning';
}

export interface CompanionChatMessage {
  id: string;
  sender: 'user' | 'companion';
  text: string;
  timestamp: string;
  mode: 'personal' | 'shared' | 'learning';
}

export interface PartnerState {
  profile: PartnerProfile;
  connection: PartnerConnection;
  conversationPrompts: ConversationPrompt[];
  dateIdeas: DateIdea[];
  sharedMemories: SharedMemory[];
  journalEntries: PartnerJournalEntry[];
  bucketList: BucketListItem[];
  chatHistory: CompanionChatMessage[];

  // Gate & Activation Actions
  activatePartners: (passcode: string, mode?: RelationshipMode) => void;
  unlockGate: (passcode: string) => boolean;
  lockGate: () => void;
  deactivatePartners: () => void;

  // Profile & Onboarding Actions
  updateProfile: (updates: Partial<PartnerProfile>) => void;
  setRelationshipMode: (mode: RelationshipMode) => void;

  // Pairing Actions
  initiatePairing: () => { shortCode: string; nonce: string };
  completePairing: (partnerName: string) => void;
  unpair: () => void;

  // Communication Actions
  answerPrompt: (promptId: string, answer: string) => void;
  addCustomPrompt: (question: string, category: ConversationPrompt['category']) => void;

  // Romance & Dates Actions
  toggleDateCompleted: (dateId: string) => void;
  addDateIdea: (idea: Omit<DateIdea, 'id' | 'completed'>) => void;
  toggleBucketItem: (itemId: string) => void;
  addBucketItem: (title: string, category: BucketListItem['category']) => void;

  // Memories & Dual Journal Actions
  addMemory: (memory: Omit<SharedMemory, 'id'>) => void;
  deleteMemory: (id: string) => void;
  addJournalEntry: (entry: Omit<PartnerJournalEntry, 'id' | 'createdAt'>) => void;
  deleteJournalEntry: (id: string) => void;

  // AI Companion Actions
  sendCompanionMessage: (text: string, mode: 'personal' | 'shared' | 'learning') => void;
  clearCompanionChat: (mode?: 'personal' | 'shared' | 'learning') => void;
}

const DEFAULT_CONVERSATION_PROMPTS: ConversationPrompt[] = [
  {
    id: 'p_1',
    category: 'connection',
    question: 'What is a small, quiet moment with me this week that brought you unexpected peace?',
  },
  {
    id: 'p_2',
    category: 'deep',
    question: 'When was the last time you felt truly understood by me without having to explain yourself?',
  },
  {
    id: 'p_3',
    category: 'playful',
    question: 'If we could drop everything right now for 48 hours with no phones, where would we disappear to?',
  },
  {
    id: 'p_4',
    category: 'vulnerable',
    question: 'What is something you find hard to ask for, even though your heart craves it?',
  },
  {
    id: 'p_5',
    category: 'future',
    question: 'What kind of energy or tradition do you want our shared space to embody 5 years from now?',
  },
];

const DEFAULT_DATE_IDEAS: DateIdea[] = [
  {
    id: 'd_1',
    title: 'Candlelit Midnight Chai & Poetry',
    description: 'Brew slow cardamom masala chai together at 11 PM and read Kabir, Rumi, or favorite verses aloud in soft ambient glow.',
    category: 'cozy',
    completed: false,
  },
  {
    id: 'd_2',
    title: '432 Hz Synchronous Breathing & Stargazing',
    description: 'Lay out blankets, play soothing Pythagorean harmonics, and watch the night sky without any agenda or social media.',
    category: 'wellness',
    completed: false,
  },
  {
    id: 'd_3',
    title: 'Sunrise Walk & Sacred Intentions',
    description: 'Wake up before dawn, walk through a quiet park or ghats, and share one intention you hold for each other’s happiness.',
    category: 'adventurous',
    completed: false,
  },
  {
    id: 'd_4',
    title: 'The "No Small Talk" Dinner',
    description: 'Cook a simple meal from scratch and answer 3 deep heart cards without talking about work, logistics, or chores.',
    category: 'deep_conversation',
    completed: false,
  },
  {
    id: 'd_5',
    title: 'Cook a Heritage Recipe From Childhood',
    description: 'Teach each other how to make your absolute favorite comfort food from your grandmother or childhood home.',
    category: 'budget_friendly',
    completed: false,
  },
];

const DEFAULT_MEMORIES: SharedMemory[] = [
  {
    id: 'm_1',
    title: 'The Day Our Worlds Collided',
    date: new Date(Date.now() - 180 * 86400000).toISOString().split('T')[0],
    notes: 'The universe aligned our paths. A spark was lit that continues to illuminate our days.',
    emoji: '✨',
    category: 'first_meet',
  },
  {
    id: 'm_2',
    title: 'First Uninterrupted Heart-to-Heart',
    date: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0],
    notes: 'We talked until 3 AM and realized our souls speak the very same unspoken language.',
    emoji: '🪷',
    category: 'milestone',
  },
];

const DEFAULT_BUCKET_LIST: BucketListItem[] = [
  { id: 'b_1', title: 'Watch the sunrise from Tiger Hill or Varanasi ghats together', completed: false, category: 'travel' },
  { id: 'b_2', title: 'Host an intimate dinner for our favorite people', completed: false, category: 'lifestyle' },
  { id: 'b_3', title: 'Create a shared photo album of our unposed, candid moments', completed: false, category: 'creative' },
  { id: 'b_4', title: 'Attend a silent meditation or yoga retreat together', completed: false, category: 'learning' },
];

export const usePartnerStore = create<PartnerState>()(
  persist(
    (set, get) => ({
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
        emotionalNeeds: ['Unconditional acceptance', 'Safe space for tears', 'Playful spontaneity'],
        comfortBoundaries: ['Need 30 mins quiet time after coming home', 'No talking during heated arguments until calmed down'],
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
      conversationPrompts: DEFAULT_CONVERSATION_PROMPTS,
      dateIdeas: DEFAULT_DATE_IDEAS,
      sharedMemories: DEFAULT_MEMORIES,
      journalEntries: [],
      bucketList: DEFAULT_BUCKET_LIST,
      chatHistory: [
        {
          id: 'c_init',
          sender: 'companion',
          text: 'Welcome to your Sacred Sanctuary. I am Preeti (प्रेरणा साथी), your relationship companion. Whether you seek to deepen romantic intimacy, nurture a soul-deep bestie bond, or navigate a tender conversation, I am here to guide with empathy and total zero-judgment discretion.',
          timestamp: new Date().toISOString(),
          mode: 'personal',
        },
      ],

      // Gate & Activation Actions (DPDP §9 Cryptographically Hashed Vault)
      activatePartners: (passcode: string, mode: RelationshipMode = 'lovers') => {
        set((state) => ({
          connection: {
            ...state.connection,
            isActivated: true,
            isGateLocked: false,
            secretPasscode: hashPasscode(passcode),
          },
          profile: {
            ...state.profile,
            mode,
            relationshipType: mode === 'besties' ? 'best_friend' : 'romantic_partner',
          },
        }));
      },

      unlockGate: (passcode: string) => {
        const currentPass = get().connection.secretPasscode;
        if (currentPass && verifyPasscode(passcode, currentPass)) {
          // If legacy plaintext, seamlessly migrate to SHA-256 hash
          const hashed = hashPasscode(passcode);
          set((state) => ({
            connection: {
              ...state.connection,
              isGateLocked: false,
              secretPasscode: hashed,
            },
          }));
          return true;
        }
        return false;
      },

      lockGate: () => {
        set((state) => ({
          connection: { ...state.connection, isGateLocked: true },
        }));
      },

      deactivatePartners: () => {
        set({
          connection: {
            isActivated: false,
            isGateLocked: true,
            secretPasscode: null,
            status: 'unpaired',
            pairedPartnerName: undefined,
            pairedSince: undefined,
          },
        });
      },

      // Profile Actions
      updateProfile: (updates) => {
        set((state) => ({
          profile: { ...state.profile, ...updates },
        }));
      },

      setRelationshipMode: (mode) => {
        set((state) => ({
          profile: {
            ...state.profile,
            mode,
            relationshipType: mode === 'besties' ? 'best_friend' : 'romantic_partner',
          },
        }));
      },

      // Pairing Actions
      initiatePairing: () => {
        const shortCode = 'LOVE-' + getSecureRandomInt(100000, 999999);
        const nonce = 'prn_pair_' + getSecureRandomString(12).toLowerCase();
        set((state) => ({
          connection: {
            ...state.connection,
            status: 'pairing_pending',
            pairingShortCode: shortCode,
            pairingNonce: nonce,
          },
        }));
        return { shortCode, nonce };
      },

      completePairing: (partnerName: string) => {
        set((state) => ({
          connection: {
            ...state.connection,
            status: 'paired',
            pairedPartnerName: partnerName,
            pairedSince: new Date().toISOString(),
          },
        }));
      },

      unpair: () => {
        set((state) => ({
          connection: {
            ...state.connection,
            status: 'unpaired',
            pairedPartnerName: undefined,
            pairedSince: undefined,
          },
        }));
      },

      // Communication Actions
      answerPrompt: (promptId, answer) => {
        set((state) => ({
          conversationPrompts: state.conversationPrompts.map((p) =>
            p.id === promptId
              ? { ...p, myAnswer: answer, answeredAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      addCustomPrompt: (question, category) => {
        const newPrompt: ConversationPrompt = {
          id: 'cp_' + Date.now(),
          category,
          question,
        };
        set((state) => ({
          conversationPrompts: [newPrompt, ...state.conversationPrompts],
        }));
      },

      // Romance & Dates Actions
      toggleDateCompleted: (dateId) => {
        set((state) => ({
          dateIdeas: state.dateIdeas.map((d) =>
            d.id === dateId ? { ...d, completed: !d.completed } : d
          ),
        }));
      },

      addDateIdea: (idea) => {
        const newIdea: DateIdea = {
          id: 'd_' + Date.now(),
          ...idea,
          completed: false,
        };
        set((state) => ({
          dateIdeas: [newIdea, ...state.dateIdeas],
        }));
      },

      toggleBucketItem: (itemId) => {
        set((state) => ({
          bucketList: state.bucketList.map((b) =>
            b.id === itemId ? { ...b, completed: !b.completed } : b
          ),
        }));
      },

      addBucketItem: (title, category) => {
        const newItem: BucketListItem = {
          id: 'b_' + Date.now(),
          title,
          completed: false,
          category,
        };
        set((state) => ({
          bucketList: [...state.bucketList, newItem],
        }));
      },

      // Memories & Dual Journal Actions
      addMemory: (memory) => {
        const newMem: SharedMemory = {
          id: 'mem_' + Date.now(),
          ...memory,
        };
        set((state) => ({
          sharedMemories: [newMem, ...state.sharedMemories],
        }));
      },

      deleteMemory: (id) => {
        set((state) => ({
          sharedMemories: state.sharedMemories.filter((m) => m.id !== id),
        }));
      },

      addJournalEntry: (entry) => {
        const newEntry: PartnerJournalEntry = {
          id: 'pj_' + Date.now(),
          createdAt: new Date().toISOString(),
          ...entry,
        };
        set((state) => ({
          journalEntries: [newEntry, ...state.journalEntries],
        }));
      },

      deleteJournalEntry: (id) => {
        set((state) => ({
          journalEntries: state.journalEntries.filter((j) => j.id !== id),
        }));
      },

      // AI Companion Actions
      sendCompanionMessage: (text, mode) => {
        const userMsg: CompanionChatMessage = {
          id: 'msg_' + Date.now(),
          sender: 'user',
          text,
          timestamp: new Date().toISOString(),
          mode,
        };

        // CLINICAL SAFETY INVARIANT (Audit M-07 / Rule 0.1):
        // Screen all input text for suicidal ideation, self-harm, domestic violence, or abuse.
        const distressCheck = evaluateCrisisPatterns(text);
        let reply = '';

        if (distressCheck.flagged) {
          if (distressCheck.reason?.toLowerCase().includes('abuse') || distressCheck.reason?.toLowerCase().includes('threat')) {
            reply = 'I hear how difficult and distressing this situation is, and your physical and emotional safety must always come first. If you are experiencing intimidation, threats, or domestic violence, please reach out to these free, confidential emergency services immediately:\n\n• National Emergency Helpline: 112 (Immediate 24/7 Police, Medical, & Emergency Dispatch)\n• National Commission for Women (NCW) Helpline: 7827170170 or 1091 (24/7 Women in Distress & Abuse Support)\n• Tele-MANAS: 14416 or 1800-891-4416 (24/7 Mental Health Crisis Support)\n\nPreeti is an automated educational reflection companion and cannot intervene in emergencies or provide legal/clinical protection. Please connect with verified authorities or helplines right away.';
          } else {
            reply = 'I can hear how much pain and overwhelm you are carrying right now. Please know you do not have to carry this alone, and compassionate professional support is available right now:\n\n• National Emergency Helpline: 112 (Pan-India 24/7 Immediate Emergency Services)\n• Tele-MANAS: 14416 or 1800-891-4416 (24/7 Free National Mental Health Helpline, Government of India)\n• Vandrevala Foundation: 9999 666 555 (24/7 Crisis Intervention & Emotional Counseling)\n\nPreeti is an educational reflection tool, not a therapist, psychiatrist, or crisis counselor. Please reach out to one of these free, confidential services immediately.';
          }
        } else {
          // Grounded, non-clinical educational reflection
          const lower = text.toLowerCase();
          if (mode === 'personal') {
            if (lower.includes('hurt') || lower.includes('sad') || lower.includes('angry') || lower.includes('fight') || lower.includes('argument')) {
              reply = 'I hear how heavy and tender this feels. Before responding, take three conscious breaths to let your nervous system settle. Relational psychology suggests that beneath anger or withdrawal, there is often a vulnerable, unmet need—such as reassurance, appreciation, or safety. What do you think your heart is asking for right now?';
            } else if (lower.includes('space') || lower.includes('alone') || lower.includes('overwhelm') || lower.includes('tired')) {
              reply = 'Honoring your need for restorative space is healthy, not selfish. You might share with your partner: "I care about you deeply. My nervous system is feeling overstimulated right now, so I need 30 minutes of quiet rest to recharge so I can be fully present with you."';
            } else if (lower.includes('love') || lower.includes('grateful') || lower.includes('happy') || lower.includes('joy')) {
              reply = 'What a beautiful reflection to pause upon. Relational research shows that consciously naming and savoring micro-moments of gratitude creates emotional resilience that anchors partnerships through stressful seasons.';
            } else {
              reply = 'Thank you for sharing this private contemplation. Giving words to your unspoken feelings without self-judgment is the first step toward relational clarity. How would you like to nurture this part of yourself today?';
            }
          } else if (mode === 'shared') {
            if (lower.includes('date') || lower.includes('weekend') || lower.includes('surprise') || lower.includes('fun')) {
              reply = 'Here is a mindful connection idea: Plan an evening where one person curates a calming acoustic playlist and the other cooks a simple comfort dish. Dedicate the first 20 minutes to phones-away tea time, asking: "What was something you experienced this week that felt meaningful to you?"';
            } else if (lower.includes('misunderstanding') || lower.includes('conflict') || lower.includes('disagree') || lower.includes('fight')) {
              reply = 'Let us explore this together with gentle reframing. Try expressing your perspective using the 4-step NVC model: "When [specific event occurred], I felt [vulnerable emotion] because I really value [core need]. Would you be willing to [concrete, gentle request]?" Avoiding "always" or "never" keeps the conversation collaborative.';
            } else {
              reply = 'Both of your viewpoints carry legitimate human value. When couples listen to understand rather than to defend, the need to win dissolves and room opens for mutual care.';
            }
          } else {
            // Learning mode
            if (lower.includes('gottman') || lower.includes('horsemen')) {
              reply = 'Dr. John Gottman identified 4 relational risk patterns: 1) Criticism (antidote: gentle startup), 2) Contempt (antidote: culture of appreciation), 3) Defensiveness (antidote: taking partial responsibility), and 4) Stonewalling (antidote: physiological self-soothing for 20 minutes).';
            } else if (lower.includes('nvc') || lower.includes('nonviolent')) {
              reply = 'Marshall Rosenberg’s Nonviolent Communication (NVC) consists of 4 clear components: 1) Observation without evaluation, 2) Feelings without thought-blame, 3) Universal Needs (safety, respect, autonomy), and 4) Clear, actionable Requests instead of demands.';
            } else if (lower.includes('attachment')) {
              reply = 'Attachment science shows that anxious styles often seek rapid reassurance during conflict, while avoidant styles seek physical or emotional space to regulate. Recognizing these as physiological regulation styles rather than personal attacks can dissolve tension rapidly.';
            } else {
              reply = 'Relational longevity is built on micro-habits: the 5:1 ratio of positive-to-negative interactions during conflict, daily 6-second kisses or warm hugs to reset cortisol, and mastering the art of repair attempts within 5 minutes of a rupture.';
            }
          }
        }

        const botMsg: CompanionChatMessage = {
          id: 'bot_' + (Date.now() + 1),
          sender: 'companion',
          text: reply,
          timestamp: new Date().toISOString(),
          mode,
        };

        set((state) => ({
          chatHistory: [...state.chatHistory, userMsg, botMsg],
        }));
      },

      clearCompanionChat: (mode) => {
        set((state) => ({
          chatHistory: mode
            ? state.chatHistory.filter((m) => m.mode !== mode)
            : [],
        }));
      },
    }),
    {
      name: 'prerna_partners_vault',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Cryptographic invariant: Partners Vault is always locked upon boot/page refresh
          state.connection.isGateLocked = true;
        }
      },
    }
  )
);

