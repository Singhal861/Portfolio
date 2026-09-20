import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import VerbManager from '@/components/verb-manager';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/Japanese/login');

  return <div className="page-shell"><section className="panel"><VerbManager userName={session.user.name || session.user.email || 'learner'} /></section></div>;
}
