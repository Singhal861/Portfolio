import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { appendUser } from '@/lib/googleSheets';
import { registerSchema } from '@/lib/validation';
import { invalidateUserCache } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request.' }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 10);
    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = new Date().toISOString();

    try {
      await appendUser([id, name, email.toLowerCase(), passwordHash, createdAt]);
      // Invalidate user cache so new user can login immediately
      invalidateUserCache();
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Register error', error);
    return NextResponse.json({ error: 'Unable to register right now. Check Google Sheets configuration.' }, { status: 500 });
  }
}
