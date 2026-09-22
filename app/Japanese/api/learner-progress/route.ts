import { NextResponse } from 'next/server';
import { getLearnerProgress } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await getLearnerProgress();
    const learners = rows.map((row) => ({
      name: row.name || '',
      count: Number(row.count || 0),
    }));
    return NextResponse.json(learners);
  } catch (error) {
    console.error('Learner progress API error', error);
    return NextResponse.json({ error: 'Unable to load learner progress.' }, { status: 500 });
  }
}
