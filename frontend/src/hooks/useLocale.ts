import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '../i18n';

export function useLocale() {
  const { i18n } = useTranslation();

  const locale = (i18n.language?.startsWith('zh') ? 'zh' : 'en') as SupportedLanguage;
  const isZh = locale === 'zh';
  const isEn = locale === 'en';

  const toggleLocale = useCallback(() => {
    const next = isZh ? 'en' : 'zh';
    i18n.changeLanguage(next);
    document.documentElement.lang = next;
  }, [i18n, isZh]);

  const setLocale = useCallback(
    (lang: SupportedLanguage) => {
      i18n.changeLanguage(lang);
      document.documentElement.lang = lang;
    },
    [i18n],
  );

  return { locale, isZh, isEn, toggleLocale, setLocale };
}
