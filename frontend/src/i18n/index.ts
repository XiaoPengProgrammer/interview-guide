import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhTranslation from './locales/zh.json';
import enTranslation from './locales/en.json';

const SUPPORTED_LANGUAGES = ['zh', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zhTranslation },
      en: { translation: enTranslation },
    },
    fallbackLng: 'zh',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18n_lang',
      caches: ['localStorage'],
    },
  });

export default i18n;
