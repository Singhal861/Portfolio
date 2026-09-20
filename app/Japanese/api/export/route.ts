import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { readRows } from '@/lib/googleSheets';
import { sendCsvEmail } from '@/lib/mail';

function toCsv(rows: Record<string, string>[]) {
  if (!rows.length) {
    return 'id,userId,userEmail,name,email,phone,address,notes,createdAt\n';
  }

  const headers = ['id', 'userId', 'userEmail', 'name', 'email', 'phone', 'address', 'notes', 'createdAt'];
  const escape = (value: string) => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => escape(row[header] || '')).join(','));
  }

  return lines.join('\n');
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const emailOnly = searchParams.get('email') || '';
    const sessionEmail = String((session.user as any)?.email || '');
    const rows = await readRows('Submissions');
    const userRows = rows.filter((row: any) => (row.userEmail || '').toLowerCase() === String(emailOnly || sessionEmail).toLowerCase());

    const csv = toCsv(userRows);
    const response = new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="my-submissions-${Date.now()}.csv"`,
      },
    });

    return response;
  } catch (error) {
    console.error('Export error', error);
    return NextResponse.json({ error: 'Unable to export records right now.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sessionEmail = String((session.user as any)?.email || '');
    const rows = await readRows('Submissions');
    const userRows = rows.filter((row: any) => (row.userEmail || '').toLowerCase() === sessionEmail.toLowerCase());
    const csv = toCsv(userRows);

    await sendCsvEmail(sessionEmail, 'Your submitted data export', csv);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email export error', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to email records right now.' }, { status: 500 });
  }
}
