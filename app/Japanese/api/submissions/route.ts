import { NextResponse } from 'next/server';
import { appendRows, ensureSheetTabs } from '@/lib/googleSheets';
import { formSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = formSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid submission.' }, { status: 400 });
    }

    const { name, email, phone, address, notes } = parsed.data;
    await ensureSheetTabs();

    const row = {
      id: `submission_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      phone,
      address,
      notes,
      createdAt: new Date().toISOString(),
      userEmail: email,
    };

    await appendRows('Submissions', [[row.id, row.name, row.email, row.phone, row.address, row.notes, row.createdAt, row.userEmail]]);

    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    console.error('Submission error', error);
    return NextResponse.json({ error: 'Unable to save submission.' }, { status: 500 });
  }
}
