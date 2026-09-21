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
  const t = copy.en;
  return (
    <div className="page-shell">
      <section className="hero-card japanese-hero">
        <div className="hero-copy">
          <div className="hero-topline">
            <p className="eyebrow"><span className="eyebrow-dot" /> {t.eyebrow}</p>
          </div>
          <h1 className="learning-title">{t.title}</h1>
          <p className="hero-text">{t.subtitle}</p>
          <section id="learner-progress">
            <div>
              <p className="eyebrow"><span className="eyebrow-dot" /> {t.progressTitle}</p>
              <p className="hero-text">{t.progressDescription}</p>
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
    </div>
  );
}
     