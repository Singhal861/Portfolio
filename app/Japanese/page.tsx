"use client";

import Link from 'next/link';
import { useState } from 'react';

const copy = {
  en: {
    eyebrow: 'Japanese learning hub',
    title: 'Learn Japanese with confidence',
    subtitle: 'A calm space for Japanese learners to practice, track progress, and keep their study journey organized.',
    openDashboard: 'Open dashboard',
    createSubmission: 'Create submission',
    createAccount: 'Create account',
    login: 'Login',
    languageLabel: 'Language',
  },
  ja: {
    eyebrow: 'にほんごの べんきょう',
    title: 'にほんごを たのしく まなぼう',
    subtitle: 'にほんごを まなんで じょうずに なりたい ひとの ための べんきょう ばしょです。',
    openDashboard: 'だっしゅぼーどを ひらく',
    createSubmission: 'しんせいを つくる',
    createAccount: 'あかうんとを つくる',
    login: 'ろぐいん',
    languageLabel: 'げんご',
  },
};

export default function JapaneseHomePage() {
  const [locale, setLocale] = useState<'en' | 'ja'>('en');
  const t = copy[locale];

  return (
    <div className="page-shell">
      <section className="hero-card japanese-hero">
        <div className="hero-copy">
          <div className="hero-topline">
            <p className="eyebrow"><span className="eyebrow-dot" /> {t.eyebrow}</p>
            <div className="lang-switch" aria-label="Language switcher">
              <button
                type="button"
                className={locale === 'en' ? 'active' : ''}
                onClick={() => setLocale('en')}
              >
                English
              </button>
              <button
                type="button"
                className={locale === 'ja' ? 'active' : ''}
                onClick={() => setLocale('ja')}
              >
                にほんご
              </button>
            </div>
          </div>

          <h1>
            <span className="accent">{locale === 'en' ? 'Midnight' : 'やさしい'}</span>
            <span className="japanese-quiet"> {locale === 'en' ? '& Sakura' : 'さくら'}</span>
          </h1>

          <p className="hero-text">{t.subtitle}</p>

          <div className="cta-row">
            <Link href="/Japanese/dashboard" className="button primary">{t.openDashboard}</Link>
            <Link href="/Japanese/form" className="button secondary">{t.createSubmission}</Link>
          </div>

          <div className="cta-row secondary-row">
            <Link href="/Japanese/register" className="button primary ghost">{t.createAccount}</Link>
            <Link href="/Japanese/login" className="button secondary">{t.login}</Link>
          </div>
        </div>

        <div className="sakura-scene" aria-hidden="true">
          <div className="sakura-sun" />
          <div className="sakura-branch" />
          <span className="sakura-petal petal-one" />
          <span className="sakura-petal petal-two" />
          <span className="sakura-petal petal-three" />
          <span className="sakura-petal petal-four" />
          <span className="sakura-petal petal-five" />
          <p className="sakura-stamp">さくら</p>
        </div>
      </section>
    </div>
  );
}
