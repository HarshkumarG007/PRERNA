// src/engine/assessment/disclosures.ts

export type ActivityType = 'life_quests' | 'skill_arena' | 'mood_mirror' | 'social_compass' | 'body_clock' | 'ai_mentor' | 'consent_flow' | 'beta_cohort';

export interface Disclosure {
  id: string; // E.g., 'v1.0'
  version: string;
  type: ActivityType;
  text: {
    en: string;
    hi: string;
  };
}

// Current active disclosures. These must be reviewed by a human before launch.
export const CURRENT_DISCLOSURES: Record<ActivityType, Disclosure> = {
  consent_flow: {
    id: 'consent_v1.0',
    version: '1.0',
    type: 'consent_flow',
    text: {
      en: "PRERNA needs your parent or guardian's permission before you can use it, because you're under 18. Here's exactly what we'll collect and why.",
      hi: "PRERNA को आपके उपयोग करने से पहले आपके माता-पिता या अभिभावक की अनुमति की आवश्यकता है, क्योंकि आपकी आयु 18 वर्ष से कम है। यहाँ बताया गया है कि हम क्या जानकारी एकत्र करेंगे और क्यों।"
    }
  },
  life_quests: {
    id: 'life_quests_v1.0',
    version: '1.0',
    type: 'life_quests',
    text: {
      en: "These stories help figure out how you make decisions and what matters most to you. There's no right answer.",
      hi: "ये कहानियाँ यह समझने में मदद करती हैं कि आप निर्णय कैसे लेते हैं और आपके लिए क्या सबसे महत्वपूर्ण है। इसका कोई सही या गलत जवाब नहीं है।"
    }
  },
  skill_arena: {
    id: 'skill_arena_v1.0',
    version: '1.0',
    type: 'skill_arena',
    text: {
      en: "These games help us understand how you think and learn best — like whether you're more of a builder, a storyteller, or a problem-solver.",
      hi: "ये खेल हमें यह समझने में मदद करते हैं कि आप सबसे अच्छा कैसे सोचते और सीखते हैं — जैसे कि क्या आप एक निर्माता, कहानीकार, या समस्या-समाधानकर्ता हैं।"
    }
  },
  mood_mirror: {
    id: 'mood_mirror_v1.0',
    version: '1.0',
    type: 'mood_mirror',
    text: {
      en: "This helps you (and, if you choose, PRERNA) notice patterns in how you're feeling over time.",
      hi: "यह आपको (और, यदि आप चाहें तो PRERNA को) यह देखने में मदद करता है कि आप समय के साथ कैसा महसूस कर रहे हैं।"
    }
  },
  social_compass: {
    id: 'social_compass_v1.0',
    version: '1.0',
    type: 'social_compass',
    text: {
      en: "These scenarios help you understand your own style in friendships and disagreements.",
      hi: "ये परिदृश्य आपको दोस्ती और असहमतियों में अपनी शैली को समझने में मदद करते हैं।"
    }
  },
  body_clock: {
    id: 'body_clock_v1.0',
    version: '1.0',
    type: 'body_clock',
    text: {
      en: "This tracks when you naturally have the most energy, so suggestions can fit your actual rhythm.",
      hi: "यह ट्रैक करता है कि प्राकृतिक रूप से आपके पास सबसे अधिक ऊर्जा कब होती है, ताकि सुझाव आपकी वास्तविक लय के अनुकूल हों।"
    }
  },
  ai_mentor: {
    id: 'ai_mentor_v1.0',
    version: '1.0',
    type: 'ai_mentor',
    text: {
      en: "I am an AI. I look at your activities to talk with you about your goals, but I am not a real human.",
      hi: "मैं एक कृत्रिम बुद्धिमत्ता (AI) हूँ। मैं आपके लक्ष्यों के बारे में बात करने के लिए आपकी गतिविधियों को देखता हूँ, लेकिन मैं असली इंसान नहीं हूँ।"
    }
  },
  beta_cohort: {
    id: 'beta_v1.0',
    version: '1.0',
    type: 'beta_cohort',
    text: {
      en: "PRERNA is currently in Beta. This means our crisis response protocol operates during limited hours and features may be unstable.",
      hi: "PRERNA वर्तमान में बीटा में है। इसका मतलब है कि हमारा संकट प्रतिक्रिया प्रोटोकॉल सीमित घंटों के दौरान काम करता है और सुविधाएँ अस्थिर हो सकती हैं।"
    }
  }
};
