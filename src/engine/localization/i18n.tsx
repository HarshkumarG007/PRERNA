import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'mr' | 'bn';

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी (Hindi)',
  ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)',
  mr: 'मराठी (Marathi)',
  bn: 'বাংলা (Bengali)',
};

export const UI_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'nav.life_quests': {
    en: 'Life Quests',
    hi: 'लाइफ क्वेस्ट्स',
    ta: 'வாழ்க்கைப் பணிகள்',
    te: 'లైఫ్ క్వెస్ట్స్',
    mr: 'लाइफ क्वेस्ट्स',
    bn: 'লাইফ কোয়েস্ট',
  },
  'nav.skill_arena': {
    en: 'Skill Arena',
    hi: 'स्किल एरीना',
    ta: 'திறன் அரங்கம்',
    te: 'స్కిల్ అరీనా',
    mr: 'कौशल्य आखाडा',
    bn: 'স্কিল এরিনা',
  },
  'nav.mood_mirror': {
    en: 'Mood Mirror',
    hi: 'मूड मिरर',
    ta: 'மனநிலை கண்ணாடி',
    te: 'మూడ్ మిర్రర్',
    mr: 'मूड मिरर',
    bn: 'মুড মিরর',
  },
  'nav.social_compass': {
    en: 'Social Compass',
    hi: 'सोशल कम्पास',
    ta: 'சமூக வழிகாட்டி',
    te: 'సోషల్ కంపాస్',
    mr: 'सोशल होकायंत्र',
    bn: 'সোশ্যাল কম্পাস',
  },
  'nav.ai_mentor': {
    en: 'AI Mentor',
    hi: 'एआई मेंटर',
    ta: 'AI வழிகாட்டி',
    te: 'AI మెంటార్',
    mr: 'एआय मार्गदर्शक',
    bn: 'এআই মেন্টর',
  },
  'nav.profile': {
    en: 'Teen Dash',
    hi: 'प्रोफ़ाइल',
    ta: 'சுயவிவரம்',
    te: 'ప్రొఫైల్',
    mr: 'माझे डॅशबोर्ड',
    bn: 'প্রোফাইল',
  },
  'nav.support': {
    en: 'Helplines',
    hi: 'हेल्पलाइन',
    ta: 'உதவி எண்கள்',
    te: 'హెల్ప్‌లైన్స్',
    mr: 'हेल्पलाइन',
    bn: 'হেল্পলাইন',
  },
  'nav.logout': {
    en: 'Log out',
    hi: 'लॉग आउट',
    ta: 'வெளியேறு',
    te: 'లాగ్ అవుట్',
    mr: 'लॉग आउट',
    bn: 'লগ আউট',
  },
  'action.continue': {
    en: 'Continue',
    hi: 'आगे बढ़ें',
    ta: 'தொடரவும்',
    te: 'కొనసాగించండి',
    mr: 'पुढे चला',
    bn: 'চালিয়ে যান',
  },
  'action.cancel': {
    en: 'Cancel',
    hi: 'रद्द करें',
    ta: 'ரத்து செய்',
    te: 'రద్దు చేయి',
    mr: 'रद्द करा',
    bn: 'বাতিল করুন',
  },
  'action.submit': {
    en: 'Submit',
    hi: 'जमा करें',
    ta: 'சமர்ப்பிக்கவும்',
    te: 'సమర్పించండి',
    mr: 'प्रस्तुत करा',
    bn: 'জমা দিন',
  },
  'action.grounding': {
    en: 'Try a Grounding Exercise',
    hi: 'आरामदायक व्यायाम आज़माएं',
    ta: 'மன அமைதி பயிற்சியை முயற்சிக்கவும்',
    te: 'శాంతపరిచే వ్యాయామం ప్రయత్నించండి',
    mr: 'शांत करणारा व्यायाम करून पहा',
    bn: 'একটি রিলাক্সেশন ব্যায়াম চেষ্টা করুন',
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string, fallback?: string): string => {
    if (UI_TRANSLATIONS[key] && UI_TRANSLATIONS[key][language]) {
      return UI_TRANSLATIONS[key][language];
    }
    return fallback || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
