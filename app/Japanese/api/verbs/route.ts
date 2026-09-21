import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { appendRows, ensureSheetTabs, readRowsWithNumbers } from '@/lib/googleSheets';
import { verbSchema } from '@/lib/validation';

async function getEmail() {
  const session = await getServerSession(authOptions);
  return session?.user?.email?.toLowerCase() || null;
}

export async function GET() {
  const email = await getEmail();
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await ensureSheetTabs();
    const rows = await readRowsWithNumbers('Verbs');
    return NextResponse.json(rows.filter((row) => row.data.userEmail === email).map((row) => ({ ...row.data })));
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
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid verb.' }, { status: 400 });

    await ensureSheetTabs();
    const now = new Date().toISOString();
    const existingRows = await readRowsWithNumbers('Verbs');
    const userRows = existingRows.filter((row) => row.data.userEmail === email);
    const serialNo = userRows.length + 1;
    const verb = {
      id: `verb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userEmail: email,
      serialNo,
      ...parsed.data,
      createdAt: now,
      updatedAt: now,
    };
    await appendRows('Verbs', [[String(verb.serialNo), verb.Meaning, verb.Dictionary, verb['~masu'], verb['~mashita'], verb['~masen'], verb['~masen deshita'], verb['Short -ve (nai/anai)'], verb['Past short (ta/da)'], verb['Past short -ve'], verb['~te'], verb['~te-iru'], verb['~te-imasu'], verb['~te-imasu -ve'], verb.Stem, verb.id, verb.userEmail, verb.createdAt, verb.updatedAt]]);
    return NextResponse.json({ success: true, data: verb });
  } catch (error) {
    console.error('Verb create error', error);
    return NextResponse.json({ error: 'Unable to save the verb.' }, { status: 500 });
  }
}