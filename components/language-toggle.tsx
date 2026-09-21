'use client';

import { useState, useEffect } from 'react';

const copy = {
  en: {
    eyebrow: 'Study space',
    title: 'Japanese Learning Hub',
    subtitle: 'A calm space for Japanese learners to practice, track progress, and keep their study journey organized.',
    community: 'Learner progress',
    createAccount: 'Create account',
    login: 'Login',
    progressTitle: 'Learner progress',
    progressDescription: 'See how many dictionary forms each learner has recorded.',
    forms: 'dictionary forms',
  },
  ja: {
    eyebrow: 'べんきょうの ばしょ',
    title: 'にほんごを たのしく まなぼう',
    subtitle: 'にほんごを まんで じょうずに なりたい ひとの ための べんきょう ばしょです。',
    community: 'みんなの べんきょう',
    createAccount: 'あかうんとを つくる',
    login: 'ろぐいん',
    progressTitle: 'みんなの べんきょう',
    progressDescription: 'それぞれの がくしゅうしゃの どうしの かずです。',
    forms: 'どうし',
  },
};

export default function LanguageToggle() {
  const [locale, setLocale] = useState<'en' | 'ja'>('en');
  const t = copy[locale];

  // Initialize locale from localStorage or default to 'en'
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as 'en' | 'ja' | null;
    if (savedLocale) {
      setLocale(savedLocale);
    }
  }, []);

  // Save locale to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('locale', locale);
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = locale === 'en' ? 'en' : 'ja';
  }, [locale]);

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