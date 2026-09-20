import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { readRows } from '@/lib/googleSheets';
import { formatDate } from '@/lib/utils';

export default async function SubmissionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/Japanese/login');
  }

  const rows = await readRows('Submissions');
  const items = rows.filter((row: any) => (row.userEmail || '').toLowerCase() === String((session.user as any)?.email || '').toLowerCase());

  return (
    <div className="page-shell">
      <section className="panel">
        <p className="eyebrow"><span className="eyebrow-dot" /> My submissions</p>
        <h1>Submission records</h1>
        {items.length === 0 ? (
          <div className="empty-state">
            <h3>No records found</h3>
            <p>There are currently no submissions tied to your account.</p>
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
                {items.map((item: any) => (
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
