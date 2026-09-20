"use client";

import Link from 'next/link';
import { useState } from 'react';

const copy = {
  en: {
    eyebrow: 'Portfolio route',
    title: 'Japanese portal',
    subtitle: 'Secure access for your Japanese experience and personal submissions.',
    openDashboard: 'Open dashboard',
    createSubmission: 'Create submission',
    createAccount: 'Create account',
    login: 'Login',
    languageLabel: 'Language',
  },
  ja: {
    eyebrow: 'ぽーとふぉりお',
    title: 'にほんごのぽーたる',
    subtitle: 'しんらいできるにほんごのけんさくとじんしょうのほうほうをおしえます。',
    openDashboard: 'だしょをひらく',
    createSubmission: 'しゅとくをつくる',
    createAccount: 'あかうんとをさくる',
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
      </section>
    </div>
  );
}
