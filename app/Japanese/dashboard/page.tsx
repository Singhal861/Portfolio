import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { readRows } from '@/lib/googleSheets';
import VerbManager from '@/components/verb-manager';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const [users, verbs] = await Promise.all([readRows('Users'), readRows('Verbs')]);
  const counts = verbs.reduce<Record<string, number>>((result, verb) => {
    const email = String(verb.userEmail || '').toLowerCase();
    if (email && verb.Dictionary) result[email] = (result[email] || 0) + 1;
    return result;
  }, {});

  return (
    <div className="page-shell">
      <section className="panel public-stats-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" /> Learner progress</p>
            <h1>Japanese learners</h1>
            <p className="hero-text">A public view of learner names and the number of dictionary forms recorded.</p>
          </div>
          {!session ? <Link href="/Japanese/login" className="button secondary">Login to manage verbs</Link> : null}
        </div>
        <div className="stats-grid">
          {users.filter((user) => user.email).map((user) => (
            <article className="stat-card" key={user.email}>
              <span className="stat-name">{user.name || user.email}</span>
              <strong>{counts[String(user.email).toLowerCase()] || 0}</strong>
              <span className="stat-label">dictionary forms</span>
            </article>
          ))}
        </div>
      </section>
      {session?.user?.email ? (
        <section className="panel private-dashboard-panel">
          <VerbManager userName={session.user.name || session.user.email} />
        </section>
      ) : (
        <section className="panel public-cta-panel">
          <h2>Ready to add your verbs?</h2>
          <p className="hero-text">Create an account to build and manage your own Japanese grammar sheet.</p>
          <Link href="/Japanese/register" className="button primary">Create account</Link>
        </section>
      )}
    </div>
  );
}
