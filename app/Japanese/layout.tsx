import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import NavLinks from '@/components/nav-links';
import LanguageToggle from '@/components/language-toggle';
import ThemeToggle from '@/components/theme-toggle';
import Brand from '@/components/brand';
import '@/app/globals.css';

export const dynamic = 'force-dynamic';

export default async function JapaneseLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container nav-wrap">
          <Brand />
          <div className="header-actions">
            <LanguageToggle />
            <ThemeToggle />
            <NavLinks authenticated={Boolean(session)} />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
