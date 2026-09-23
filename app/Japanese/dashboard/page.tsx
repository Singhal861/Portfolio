import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import VerbManager from '@/components/verb-manager';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="page-shell">
      {session?.user?.email ? (
        <section className="panel private-dashboard-panel">
          <VerbManager userName={session.user.name || session.user.email} />
        </section>
      ) : (
        <section className="panel public-cta-panel">
          <h1>Manage your Japanese verbs</h1>
          <p className="hero-text">Log in to build and manage your own Japanese grammar sheet.</p>
          <Link href="/Japanese/login" className="button primary">Login</Link>
        </section>
      )}
    </div>
  );
}
