import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager, Platform } from 'react-native';

// Load combined translation resources per feature with language keys inside
import authCombined from '../features/auth/locales/index.json';
import boardsCombined from '../features/boards/locales/index.json';
import advertismentsCombined from '../features/advertisments/locales/index.json';
import profileCombined from '../features/profile/locales/index.json';

const resources = {
  en: {
    auth: (authCombined as any).en,
    boards: (boardsCombined as any).en,
    advertisments: (advertismentsCombined as any).en,
    profile: (profileCombined as any).en,
  },
  ur: {
    auth: (authCombined as any).ur,
    boards: (boardsCombined as any).ur,
    advertisments: (advertismentsCombined as any).ur,
    profile: (profileCombined as any).ur,
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
    compatibilityJSON: 'v4',
    resources,
    lng: 'en',
    fallbackLng: 'en',
    ns: ['auth', 'boards', 'advertisments', 'profile'],
    defaultNS: 'auth',
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => applyLayoutDirection(i18n.language));

export default i18n;


