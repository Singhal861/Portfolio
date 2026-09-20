import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ensureSheetTabs, readRows } from '@/lib/googleSheets';
import { sendCsvEmail } from '@/lib/mail';

const headers = ['id', 'userEmail', 'kanji', 'reading', 'meaning', 'masuForm', 'dictionaryForm', 'teForm', 'notes', 'createdAt', 'updatedAt'];

function toCsv(rows: Record<string, string>[]) {
  const escape = (value: string) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map((row) => headers.map((header) => escape(row[header] || '')).join(','))].join('\n');
}

async function userCsv() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email) return null;

  await ensureSheetTabs();
  const rows = await readRows('Verbs');
  return { email, csv: toCsv(rows.filter((row: any) => row.userEmail === email)) };
}

export async function GET() {
  try {
    const result = await userCsv();
    if (!result) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return new NextResponse(`\ufeff${result.csv}`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="my-japanese-verbs-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Verb export error', error);
    return NextResponse.json({ error: 'Unable to export verbs right now.' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await userCsv();
    if (!result) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await sendCsvEmail(result.email, 'Your Japanese verb list', result.csv);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verb email error', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to email verbs right now.' }, { status: 500 });
  }
}
