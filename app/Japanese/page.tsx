import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function JapaneseHomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="page-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Portfolio route</p>
          <h1>
            Midnight <span className="accent">&amp; Amber</span>
          </h1>
          <p className="hero-text">
            Secure access for your Japanese portal experience, personal submissions, and streamlined data management.
          </p>
          <div className="cta-row">
            {session ? (
              <>
                <Link href="/Japanese/dashboard" className="button primary">Open dashboard</Link>
                <Link href="/Japanese/form" className="button secondary">Create submission</Link>
              </>
            ) : (
              <>
                <Link href="/Japanese/register" className="button primary">Create account</Link>
                <Link href="/Japanese/login" className="button secondary">Login</Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
