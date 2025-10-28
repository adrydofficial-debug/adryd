import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager, Platform } from 'react-native';

// Load translation resources per feature and language
// You can add more languages by mirroring the structure under src/locales/<lang>/
import en_common from '../locales/en/common.json';
import en_auth from '../locales/en/auth.json';
import en_boards from '../locales/en/boards.json';
import en_advertisments from '../locales/en/advertisments.json';
import en_profile from '../locales/en/profile.json';

import hi_common from '../locales/hi/common.json';
import hi_auth from '../locales/hi/auth.json';
import hi_boards from '../locales/hi/boards.json';
import hi_advertisments from '../locales/hi/advertisments.json';
import hi_profile from '../locales/hi/profile.json';

const resources = {
  en: {
    common: en_common,
    auth: en_auth,
    boards: en_boards,
    advertisments: en_advertisments,
    profile: en_profile,
  },
  hi: {
    common: hi_common,
    auth: hi_auth,
    boards: hi_boards,
    advertisments: hi_advertisments,
    profile: hi_profile,
  },
};

// Detect RTL if you add RTL languages later (e.g., ar, ur)
function applyLayoutDirection(lang: string) {
  const rtlLangs = new Set<string>(['ar', 'ur', 'he', 'fa']);
  const isRTL = rtlLangs.has(lang);
  if (I18nManager.isRTL !== isRTL) {
    try {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      if (Platform.OS === 'android') {
        // A full reload is typically needed; caller should handle if they change language at runtime
      }
    } catch (e) {
      // no-op
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common', 'auth', 'boards', 'advertisments', 'profile'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => applyLayoutDirection(i18n.language));

export default i18n;


