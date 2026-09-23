import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { appendUser } from '../../../../lib/googleSheets';
import { registerSchema } from '../../../../lib/validation';
import { invalidateUserCache } from '../../../../lib/auth';
import { verifyVerificationToken } from '../../../../lib/otp';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, verificationToken } = body;

    if (typeof verificationToken !== 'string' || !verificationToken.trim()) {
      return NextResponse.json(
        { error: 'Email verification is required.' },
        { status: 400 }
      );
    }

    const parsed = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword: password,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request.' }, { status: 400 });
    }

    const { name: parsedName, email: parsedEmail, password: parsedPassword } = parsed.data;
    const normalizedEmail = parsedEmail.toLowerCase();

    const tokenPayload = await verifyVerificationToken(verificationToken);
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token.' },
        { status: 401 }
      );
    }

    if (tokenPayload.email !== normalizedEmail) {
      return NextResponse.json(
        { error: 'Verification token does not match the provided email.' },
        { status: 401 }
      );
    }

    const passwordHash = await bcrypt.hash(parsedPassword, 10);
    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = new Date().toISOString();

    try {
      await appendUser([id, parsedName, normalizedEmail, passwordHash, createdAt]);
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
