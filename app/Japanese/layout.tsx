import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LogoutButton from '@/components/logout-button';
import NavLinks from '@/components/nav-links';
import '@/app/globals.css';

export default async function JapaneseLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container nav-wrap">
          <Link href="/Japanese" className="brand" aria-label="Home">
            <span className="brand-mark">AS</span>
            <span className="brand-text">Japanese Portal</span>
          </Link>
          <div className="header-actions">
            <NavLinks authenticated={Boolean(session)} />
            {session ? <LogoutButton /> : null}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
