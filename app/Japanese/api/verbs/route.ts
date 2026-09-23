import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import {
  readUserVerbsWithNumbers,
  appendUserVerb,
  updateUserVerb,
  deleteUserVerb,
  SAMPLE_VERB_DATA,
} from '../../../../lib/googleSheets';
import { verbSchema } from '../../../../lib/validation';

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

export async function GET() {
  const email = await getEmail();
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Ensure the user's verb tab exists and has a sample row
    // (readUserVerbsWithNumbers will ensure the tab and sample via ensureUserVerbSheet_)
    const userRows = await readUserVerbsWithNumbers(email);

    // Split sample row and custom user rows
    const sampleRowItem = userRows.find((r: any) => isSampleRow(r.data));
    const customRowItems = userRows.filter((r: any) => !isSampleRow(r.data));

    const result = [];
    if (sampleRowItem) {
      result.push({
        ...sampleRowItem.data,
        'S.No': '1',
        isSample: true,
      });
    }

    customRowItems.forEach((r: any, index: number) => {
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

    // Ensure the user's verb tab exists and has a sample row
    // (appendUserVerb will ensure the tab and sample via ensureUserVerbSheet_)
    const userRows = await readUserVerbsWithNumbers(email);
    const existing = userRows.filter((r: any) => !isSampleRow(r.data)).some((r: any) => {
      const d = r.data;
      return (
        String(d.userEmail || '').toLowerCase() === email &&
        d.Meaning === parsed.data.Meaning &&
        d.Dictionary === parsed.data.Dictionary &&
        d['~masu'] === parsed.data['~masu'] &&
        d.Stem === parsed.data.Stem
      );
    });
    if (existing) {
      return NextResponse.json({ success: true, data: { id: 'existing', duplicate: true, message: 'Verb already saved.' } });
    }

    // Append the new verb to the user's tab
    const now = new Date().toISOString();
    const verbId = `verb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const serialNo = userRows.length + 1; // includes sample row if present

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

    await appendUserVerb(email, newRowValues);

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