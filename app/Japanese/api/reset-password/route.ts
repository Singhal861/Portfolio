import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { invalidateUserCache } from '@/lib/auth';
import { passwordResetSchema } from '@/lib/validation';
import {
  hashPasswordResetToken,
  PASSWORD_RESET_INVALID_MESSAGE,
} from '@/lib/password-reset';

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    if (!token) {
      return NextResponse.json({ error: PASSWORD_RESET_INVALID_MESSAGE }, { status: 400 });
    }

    const parsed = passwordResetSchema.safeParse({
      password: body?.password,
      confirmPassword: body?.confirmPassword,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request.' }, { status: 400 });
    }

    const tokenHash = hashPasswordResetToken(token);
    const { data: resetRecord, error: resetError } = await supabase
      .from('password_resets')
      .select('id,user_id,expires_at')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (resetError) {
      console.error('Password reset lookup error:', resetError);
      return NextResponse.json({ error: 'Unable to reset password right now.' }, { status: 500 });
    }

    if (!resetRecord) {
      return NextResponse.json({ error: PASSWORD_RESET_INVALID_MESSAGE }, { status: 400 });
    }

    const expiresAt = new Date(resetRecord.expires_at);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
      await supabase.from('password_resets').delete().eq('id', resetRecord.id);
      return NextResponse.json({ error: PASSWORD_RESET_INVALID_MESSAGE }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', String(resetRecord.user_id))
      .maybeSingle();

    if (userError) {
      console.error('Password reset user lookup error:', userError);
      return NextResponse.json({ error: 'Unable to reset password right now.' }, { status: 500 });
    }

    if (!user) {
      await supabase.from('password_resets').delete().eq('id', resetRecord.id);
      return NextResponse.json({ error: PASSWORD_RESET_INVALID_MESSAGE }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', String(user.id));

    if (updateError) {
      console.error('Password reset update error:', updateError);
      return NextResponse.json({ error: 'Unable to reset password right now.' }, { status: 500 });
    }

    const { error: deleteError } = await supabase
      .from('password_resets')
      .delete()
      .eq('user_id', String(user.id));

    if (deleteError) {
      console.error('Password reset token cleanup error:', deleteError);
      return NextResponse.json({ error: 'Unable to reset password right now.' }, { status: 500 });
    }

    invalidateUserCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Unable to reset password right now.' },
      { status: 500 }
    );
  }
}
