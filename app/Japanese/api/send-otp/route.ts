import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateOTP, hashOTP } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const { name, email } = await request.json();
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedName || !normalizedEmail) {
      return NextResponse.json(
        { error: 'Name and email are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Check if user already exists in public.users
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (userError) {
      console.error('Error checking existing user:', userError);
      return NextResponse.json(
        { error: 'Unable to check account status. Please try again.' },
        { status: 500 }
      );
    }

    if (existingUser) {
      // Preserve existing behavior: return error if email already exists
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const { error: deleteError } = await supabase
      .from('email_verifications')
      .delete()
      .eq('email', normalizedEmail);

    if (deleteError) {
      console.error('Error invalidating previous OTP:', deleteError);
      return NextResponse.json(
        { error: 'Failed to send verification code. Please try again.' },
        { status: 500 }
      );
    }

    const { error: insertError } = await supabase
      .from('email_verifications')
      .insert({
        email: normalizedEmail,
        otp_hash: otpHash,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
      });

    if (insertError) {
      console.error('Error storing OTP:', insertError);
      return NextResponse.json(
        { error: 'Failed to send verification code. Please try again.' },
        { status: 500 }
      );
    }

    try {
      await sendOtpEmail(normalizedEmail, otp);
    } catch {
      await supabase
        .from('email_verifications')
        .delete()
        .eq('email', normalizedEmail);

      return NextResponse.json(
        { error: 'Email service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Verification code sent to your email.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
