import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LogoutButton from '@/components/logout-button';
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
          <nav className="nav-links">
            <Link href="/Japanese">Home</Link>
            {session ? (
              <>
                <Link href="/Japanese/dashboard">Dashboard</Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/Japanese/login">Login</Link>
                <Link href="/Japanese/register" className="nav-button">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
