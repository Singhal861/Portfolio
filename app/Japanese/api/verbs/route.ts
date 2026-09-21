import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  appendRows,
  ensureSheetTabs,
  readRowsWithNumbers,
  SAMPLE_VERB_DATA,
} from '@/lib/googleSheets';
import { verbSchema } from '@/lib/validation';

async function getEmail() {
  const session = await getServerSession(authOptions);
  return session?.user?.email?.toLowerCase() || null;
}

function isSampleRow(row: Record<string, string>) {
  return (
    String(row.id || '').startsWith('verb_sample_') ||
    (row['S.No'] === '1' &&
      row.Meaning === SAMPLE_VERB_DATA.Meaning &&
      row.Dictionary === SAMPLE_VERB_DATA.Dictionary)
  );
}

async function ensureUserSampleRow(email: string) {
  const rows = await readRowsWithNumbers('Verbs');
  const userRows = rows.filter((r) => String(r.data.userEmail || '').toLowerCase() === email);
  const hasSample = userRows.some((r) => isSampleRow(r.data));

  if (!hasSample) {
    const now = new Date().toISOString();
    const sampleId = `verb_sample_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const sampleData = {
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
      id: sampleId,
      userEmail: email,
      createdAt: now,
      updatedAt: now,
    };

    const sampleRow = [
      1,
      SAMPLE_VERB_DATA.Meaning,
      SAMPLE_VERB_DATA.Dictionary,
      SAMPLE_VERB_DATA['~masu'],
      SAMPLE_VERB_DATA['~mashita'],
      SAMPLE_VERB_DATA['~masen'],
      SAMPLE_VERB_DATA['~masen deshita'],
      SAMPLE_VERB_DATA['Short -ve (nai/anai)'],
      SAMPLE_VERB_DATA['Past short (ta/da)'],
      SAMPLE_VERB_DATA['Past short -ve'],
      SAMPLE_VERB_DATA['~te'],
      SAMPLE_VERB_DATA['~te-iru'],
      SAMPLE_VERB_DATA['~te-imasu'],
      SAMPLE_VERB_DATA['~te-imasu -ve'],
      SAMPLE_VERB_DATA.Stem,
      sampleId,
      email,
      now,
      now,
    ];

    await appendRows('Verbs', [sampleRow]);

    // Add sample directly instead of re-reading
    userRows.unshift({ rowNumber: -1, data: sampleData });
  }

  return userRows;
}

export async function GET() {
  const email = await getEmail();
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const userRows = await ensureUserSampleRow(email);

    // Split sample row and custom user rows
    const sampleRowItem = userRows.find((r) => isSampleRow(r.data));
    const customRowItems = userRows.filter((r) => !isSampleRow(r.data));

    const result = [];
    if (sampleRowItem) {
      result.push({
        ...sampleRowItem.data,
        'S.No': '1',
        isSample: true,
      });
    }

    customRowItems.forEach((r, index) => {
      result.push({
        ...r.data,
        'S.No': String(index + 2),
        isSample: false,
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Verb read error', error);
    return NextResponse.json({ error: 'Unable to load verbs.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const email = await getEmail();
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = verbSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid verb.' },
        { status: 400 }
      );
    }

    const fingerprint = `${email}|${parsed.data.Meaning}|${parsed.data.Dictionary}|${parsed.data['~masu']}|${parsed.data.Stem}`;

    const userRows = await ensureUserSampleRow(email);
    const existing = userRows.filter((r) => !isSampleRow(r.data)).some((r) => {
      const d = r.data;
      return String(d.userEmail || '').toLowerCase() === email &&
        d.Meaning === parsed.data.Meaning &&
        d.Dictionary === parsed.data.Dictionary &&
        d['~masu'] === parsed.data['~masu'] &&
        d.Stem === parsed.data.Stem;
    });
    if (existing) {
      return NextResponse.json({ success: true, data: { id: 'existing', duplicate: true, message: 'Verb already saved.' } });
    }

    const now = new Date().toISOString();
    const serialNo = userRows.length + 1;
    const verbId = `verb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const newRowValues = [
      serialNo,
      parsed.data.Meaning,
      parsed.data.Dictionary,
      parsed.data['~masu'],
      parsed.data['~mashita'],
      parsed.data['~masen'],
      parsed.data['~masen deshita'],
      parsed.data['Short -ve (nai/anai)'],
      parsed.data['Past short (ta/da)'],
      parsed.data['Past short -ve'],
      parsed.data['~te'],
      parsed.data['~te-iru'],
      parsed.data['~te-imasu'],
      parsed.data['~te-imasu -ve'],
      parsed.data.Stem,
      verbId,
      email,
      now,
      now,
    ];

    await appendRows('Verbs', [newRowValues]);

    const createdVerb = {
      id: verbId,
      'S.No': String(serialNo),
      ...parsed.data,
      userEmail: email,
      createdAt: now,
      updatedAt: now,
      isSample: false,
    };

    return NextResponse.json({ success: true, data: createdVerb });
  } catch (error) {
    console.error('Verb create error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to save the verb.' },
      { status: 500 }
    );
  }
}