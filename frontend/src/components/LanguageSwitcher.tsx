import { useLocale } from '../hooks/useLocale';

export default function LanguageSwitcher() {
  const { locale, toggleLocale } = useLocale();

  return (
    <button
      onClick={toggleLocale}
      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
        bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300
        hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      title={locale === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      {locale === 'zh' ? (
        <>
          <span className="text-base leading-none">🇬🇧</span>
          <span className="text-sm font-medium">English</span>
        </>
      ) : (
        <>
          <span className="text-base leading-none">🇨🇳</span>
          <span className="text-sm font-medium">中文</span>
        </>
      )}
    </button>
  );
}
