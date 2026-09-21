'use client';

import Link from 'next/link';
import { useState } from 'react';

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
    subtitle: 'にほんごを まなんで じょうずに なりたい ひとの ための べんきょう ばしょです。',
    community: 'みんなの べんきょう',
    createAccount: 'あかうんとを つくる',
    login: 'ろぐいん',
    progressTitle: 'みんなの べんきょう',
    progressDescription: 'それぞれの がくしゅうしゃの どうしの かずです。',
    forms: 'どうし',
  },
};

type Learner = { name: string; count: number };

export default function JapaneseHomeContent({ learners }: { learners: Learner[] }) {
  const [locale, setLocale] = useState<'en' | 'ja'>('en');
  const t = copy[locale];

  return (
    <div className="page-shell">
      <section className="hero-card japanese-hero">
        <div className="hero-copy">
          <div className="hero-topline">
            <p className="eyebrow"><span className="eyebrow-dot" /> {t.eyebrow}</p>
            <div className="lang-switch" aria-label="Language switcher">
              <button type="button" className={locale === 'en' ? 'active' : ''} onClick={() => setLocale('en')}>English</button>
              <button type="button" className={locale === 'ja' ? 'active' : ''} onClick={() => setLocale('ja')}>にほんご</button>
            </div>
          </div>
          <h1 className="learning-title">{t.title}</h1>
          <p className="hero-text">{t.subtitle}</p>
          {/* Removed duplicate community link as it appears below */}
          <div className="cta-row secondary-row">
            {/* Removed duplicate create account and login links as they appear in header navigation */}
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
        </div>
      </section>

      <section className="panel public-stats-panel home-progress" id="learner-progress">
        <div className="panel-header">
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" /> {t.progressTitle}</p>
            <h2>{t.progressTitle}</h2>
            <p className="hero-text">{t.progressDescription}</p>
          </div>
        </div>
        <div className="stats-grid">
          {learners.map((learner) => (
            <article className="stat-card" key={learner.name}>
              <span className="stat-name">{learner.name}</span>
              <strong>{learner.count}</strong>
              <span className="stat-label">{t.forms}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
