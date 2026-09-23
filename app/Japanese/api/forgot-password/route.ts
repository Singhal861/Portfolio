import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { sendPasswordResetEmail } from '@/lib/mail';
import {
  generatePasswordResetToken,
  getPasswordResetUrl,
  hashPasswordResetToken,
  PASSWORD_RESET_COOLDOWN_MS,
  PASSWORD_RESET_GENERIC_MESSAGE,
  PASSWORD_RESET_TTL_MS,
} from '@/lib/password-reset';

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').max(254, 'Email is too long.'),
});

function genericResponse() {
  return NextResponse.json({ success: true, message: PASSWORD_RESET_GENERIC_MESSAGE });
}

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request.' }, { status: 400 });
    }

    const normalizedEmail = parsed.data.email.toLowerCase();
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id,email')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (userError) {
      console.error('Forgot password user lookup error:', userError);
      return NextResponse.json({ error: 'Unable to process password reset right now.' }, { status: 500 });
    }

    if (!user) {
      return genericResponse();
    }

    const cooldownStartedAt = new Date(Date.now() - PASSWORD_RESET_COOLDOWN_MS).toISOString();
    const { data: recentReset, error: recentResetError } = await supabase
      .from('password_resets')
      .select('id')
      .eq('user_id', String(user.id))
      .gte('created_at', cooldownStartedAt)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentResetError) {
      console.error('Password reset cooldown lookup error:', recentResetError);
      return genericResponse();
    }

    if (recentReset) {
      return genericResponse();
    }

    const { error: deleteError } = await supabase
      .from('password_resets')
      .delete()
      .eq('user_id', String(user.id));

    if (deleteError) {
      console.error('Password reset invalidation error:', deleteError);
      return genericResponse();
    }

    const rawToken = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(rawToken);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS).toISOString();

    const { data: resetRecord, error: insertError } = await supabase
      .from('password_resets')
      .insert({
        user_id: String(user.id),
        token_hash: tokenHash,
        expires_at: expiresAt,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Password reset insert error:', insertError);
      return genericResponse();
    }

    try {
      await sendPasswordResetEmail(normalizedEmail, getPasswordResetUrl(rawToken));
    } catch (emailError) {
      console.error('Password reset email error:', emailError instanceof Error ? emailError.message : 'Unknown email error');
      if (resetRecord?.id) {
        await supabase.from('password_resets').delete().eq('id', resetRecord.id);
      }
    }

    return genericResponse();
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Unable to process password reset right now.' },
      { status: 500 }
    );
  }
}
