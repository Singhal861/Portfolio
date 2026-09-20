import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { readRows } from '@/lib/googleSheets';
import { formatDate } from '@/lib/utils';
import EmailDataButton from '@/components/email-data-button';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/Japanese/login');
  }

  const submissions = await readRows('Submissions');
  const userItems = submissions.filter((row: any) => (row.userEmail || '').toLowerCase() === String((session.user as any)?.email || '').toLowerCase());

  return (
    <div className="page-shell">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" /> Dashboard</p>
            <h1>Your submissions</h1>
          </div>
          <div className="header-actions">
            <Link href="/Japanese/form" className="button primary">New submission</Link>
            <a href={`/Japanese/api/export?email=${encodeURIComponent(String((session.user as any)?.email || ''))}`} className="button secondary">Download CSV</a>
            <EmailDataButton email={String((session.user as any)?.email || '')} />
          </div>
        </div>

        {userItems.length === 0 ? (
          <div className="empty-state">
            <h3>No submissions yet</h3>
            <p>Submit your first form to see it here.</p>
            <Link href="/Japanese/form" className="button primary">Create submission</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Notes</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {userItems.map((item: any) => (
                  <tr key={item.id || `${item.name}-${item.createdAt}`}>
                    <td>{item.name || '—'}</td>
                    <td>{item.email || '—'}</td>
                    <td>{item.phone || '—'}</td>
                    <td>{item.address || '—'}</td>
                    <td>{item.notes || '—'}</td>
                    <td>{formatDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
