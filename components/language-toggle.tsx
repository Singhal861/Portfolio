'use client';

import { useLanguage } from '@/components/language-provider';

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      type="button"
      className="lang-btn"
      onClick={() => setLocale(locale === 'en' ? 'ja' : 'en')}
      title={locale === 'en' ? "日本語に切り替える" : "Switch to English"}
    >
      {locale === 'en' ? 'JP' : 'EN'}
    </button>
  );
}
