import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { readRows, appendRows, ensureSheetTabs } from '@/lib/googleSheets';
import { registerSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request.' }, { status: 400 });
    }

    const { email, password } = parsed.data;
    await ensureSheetTabs();
    const users = await readRows('Users');

    const existing = users.find((user: any) => user.email?.toLowerCase() === email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = new Date().toISOString();

    await appendRows('Users', [[id, email.toLowerCase(), passwordHash, createdAt]]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Register error', error);
    return NextResponse.json({ error: 'Unable to register right now. Check Google Sheets configuration.' }, { status: 500 });
  }
}
