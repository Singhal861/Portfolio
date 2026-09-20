import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="portfolio-shell">
      <section className="portfolio-card">
        <p className="eyebrow"><span className="eyebrow-dot" /> Portfolio</p>
        <h1>Abhishek Singhal</h1>
        <p className="hero-text">
          Data Engineer crafting scalable systems, modern dashboards, and practical data experiences.
        </p>
        <div className="cta-row">
          <Link href="/Japanese" className="button primary">Open Japanese portal</Link>
          <a href="https://github.com/Singhal861" target="_blank" rel="noreferrer" className="button secondary">
            GitHub
          </a>
        </div>
      </section>
    </main>
  );
}
