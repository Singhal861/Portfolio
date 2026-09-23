'use client';

import { useLanguage } from '@/components/language-provider';

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="language-toggle">
      <button
        type="button"
        className={`lang-btn ${locale === 'en' ? 'active' : ''}`}
        onClick={() => setLocale('en')}
        title="Switch to English"
      >
        EN
      </button>
      <button
        type="button"
        className={`lang-btn ${locale === 'ja' ? 'active' : ''}`}
        onClick={() => setLocale('ja')}
        title="日本語に切り替える"
      >
        JP
      </button>
    </div>
  );
}
