import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  readUserVerbsWithNumbers,
  updateUserVerb,
  deleteUserVerb,
  deleteUserVerbById,
  SAMPLE_VERB_DATA,
} from '@/lib/googleSheets';
import { supabase } from '@/lib/supabase';
import { verbSchema } from '@/lib/validation';

async function ownedVerb(id: string) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email) return { error: 'Unauthorized' as const };

  const rows = await readUserVerbsWithNumbers(email);
  const row = rows.find(
    (item: any) =>
      item.data.id === id
  );
  return row ? { email, row } : { error: 'Verb not found.' as const };
}

function isSample(id: string, data: Record<string, string>) {
  return (
    id.startsWith('verb_sample_') ||
    (data['S.No'] === '1' &&
      data.Meaning === SAMPLE_VERB_DATA.Meaning &&
      data.Dictionary === SAMPLE_VERB_DATA.Dictionary)
  );
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const owner = await ownedVerb(params.id);
    if ('error' in owner) {
      return NextResponse.json(
        { error: owner.error },
        { status: owner.error === 'Unauthorized' ? 401 : 404 }
      );
    }

    if (isSample(params.id, owner.row.data)) {
      return NextResponse.json(
        { error: 'The default sample row is immutable and cannot be modified.' },
        { status: 400 }
      );
    }

    const parsed = verbSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid verb.' },
        { status: 400 }
      );
    }

    const updatedAt = new Date().toISOString();
    await updateUserVerb(owner.email, owner.row.rowNumber, [
      owner.row.data['S.No'],
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
      params.id,
      owner.email,
      owner.row.data.createdAt,
      updatedAt,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verb update error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update the verb.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    if (body.confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Type DELETE to confirm removal.' },
        { status: 400 }
      );
    }

    const owner = await ownedVerb(params.id);
    if ('error' in owner) {
      return NextResponse.json(
        { error: owner.error },
        { status: owner.error === 'Unauthorized' ? 401 : 404 }
      );
    }

    if (isSample(params.id, owner.row.data)) {
      return NextResponse.json(
        { error: 'The default sample row is immutable and cannot be deleted.' },
        { status: 400 }
      );
    }

    if (supabase) {
      await deleteUserVerbById(params.id);
    } else {
      await deleteUserVerb(owner.email, owner.row.rowNumber);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verb delete error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to delete the verb.' },
      { status: 500 }
    );
  }
}