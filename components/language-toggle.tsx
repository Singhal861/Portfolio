'use client';

import { useLanguage } from '@/components/language-provider';

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="lang-switch" aria-label="Language switcher">
      <button
        type="button"
        className={locale === 'en' ? 'active' : ''}
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
      >
        English
      </button>
      <button
        type="button"
        className={locale === 'ja' ? 'active' : ''}
        onClick={() => setLocale('ja')}
        aria-pressed={locale === 'ja'}
      >
        にほんご
      </button>
    </div>
  );
}