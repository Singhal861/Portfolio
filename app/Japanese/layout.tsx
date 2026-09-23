import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SiteHeader from '@/components/site-header';
import '@/app/globals.css';

export const dynamic = 'force-dynamic';

export default async function JapaneseLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="app-shell">
      <SiteHeader authenticated={Boolean(session)} />
      <main>{children}</main>
    </div>
  );
}
