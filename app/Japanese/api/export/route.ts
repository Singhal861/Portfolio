import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  readRows,
  SAMPLE_VERB_DATA,
  SHEET_HEADERS,
} from '@/lib/googleSheets';
import { sendCsvEmail } from '@/lib/mail';

function escapeCsv(value: unknown) {
  const str = String(value ?? '');
  return `"${str.replace(/"/g, '""')}"`;
}

function toCsv(rows: Record<string, string>[]) {
  const headerLine = SHEET_HEADERS.join(',');
  const dataLines = rows.map((row) =>
    SHEET_HEADERS.map((header) => escapeCsv(row[header] || '')).join(',')
  );
  return [headerLine, ...dataLines].join('\n');
}

function isSampleRow(row: Record<string, string>) {
  return (
    String(row.id || '').startsWith('verb_sample_') ||
    (row['S.No'] === '1' &&
      row.Meaning === SAMPLE_VERB_DATA.Meaning &&
      row.Dictionary === SAMPLE_VERB_DATA.Dictionary)
  );
}

async function userCsv() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email) return null;

  const allRows = await readRows('Verbs');
  const userRows = allRows.filter(
    (row: any) => String(row.userEmail || '').toLowerCase() === email
  );

  const sampleRowItem = userRows.find(isSampleRow);
  const customRows = userRows.filter((row) => !isSampleRow(row));

  const orderedRows: Record<string, string>[] = [];

  // 1st row: Always the immutable default sample row
  if (sampleRowItem) {
    orderedRows.push({
      ...sampleRowItem,
      'S.No': '1',
      Meaning: SAMPLE_VERB_DATA.Meaning,
      Dictionary: SAMPLE_VERB_DATA.Dictionary,
      '~masu': SAMPLE_VERB_DATA['~masu'],
      '~mashita': SAMPLE_VERB_DATA['~mashita'],
      '~masen': SAMPLE_VERB_DATA['~masen'],
      '~masen deshita': SAMPLE_VERB_DATA['~masen deshita'],
      'Short -ve (nai/anai)': SAMPLE_VERB_DATA['Short -ve (nai/anai)'],
      'Past short (ta/da)': SAMPLE_VERB_DATA['Past short (ta/da)'],
      'Past short -ve': SAMPLE_VERB_DATA['Past short -ve'],
      '~te': SAMPLE_VERB_DATA['~te'],
      '~te-iru': SAMPLE_VERB_DATA['~te-iru'],
      '~te-imasu': SAMPLE_VERB_DATA['~te-imasu'],
      '~te-imasu -ve': SAMPLE_VERB_DATA['~te-imasu -ve'],
      Stem: SAMPLE_VERB_DATA.Stem,
    });
  } else {
    orderedRows.push({
      'S.No': '1',
      ...SAMPLE_VERB_DATA,
    });
  }

  // Subsequent rows: Custom user verbs
  customRows.forEach((row, index) => {
    orderedRows.push({
      ...row,
      'S.No': String(index + 2),
    });
  });

  return { email, csv: toCsv(orderedRows) };
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

export async function POST(request: Request) {
  try {
    const result = await userCsv();
    if (!result) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let targetEmail = result.email;
    try {
      const body = await request.json();
      if (body?.email && typeof body.email === 'string' && body.email.includes('@')) {
        targetEmail = body.email.trim().toLowerCase();
      }
    } catch {
      // Body is optional, default to authenticated user's email
    }

    await sendCsvEmail(targetEmail, 'Your Japanese Verbs Sheet', result.csv);
    return NextResponse.json({ success: true, emailedTo: targetEmail });
  } catch (error) {
    console.error('Verb email error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to email verbs right now.' },
      { status: 500 }
    );
  }
}
