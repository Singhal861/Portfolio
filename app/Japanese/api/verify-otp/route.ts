import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyOTP, generateVerificationToken } from '@/lib/otp';

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const { email, otp } = await request.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const submittedOtp = typeof otp === 'string' ? otp.trim() : '';

    if (!normalizedEmail || !submittedOtp) {
      return NextResponse.json(
        { error: 'Email and OTP are required.' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(submittedOtp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format.' },
        { status: 400 }
      );
    }

    const { data: otpRecord, error: fetchError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', normalizedEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError || !otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    const expiresAt = new Date(otpRecord.expires_at);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
      await supabase
        .from('email_verifications')
        .delete()
        .eq('id', otpRecord.id);

      return NextResponse.json(
        { error: 'Verification code has expired.' },
        { status: 400 }
      );
    }

    if (otpRecord.attempts >= 5) {
      await supabase
        .from('email_verifications')
        .delete()
        .eq('id', otpRecord.id);

      return NextResponse.json(
        { error: 'Maximum verification attempts exceeded. Please request a new code.' },
        { status: 400 }
      );
    }

    const isValid = await verifyOTP(submittedOtp, otpRecord.otp_hash);

    if (!isValid) {
      const nextAttempts = Number(otpRecord.attempts || 0) + 1;
      if (nextAttempts >= 5) {
        await supabase
          .from('email_verifications')
          .delete()
          .eq('id', otpRecord.id);

        return NextResponse.json(
          { error: 'Maximum verification attempts exceeded. Please request a new code.' },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabase
        .from('email_verifications')
        .update({ attempts: nextAttempts })
        .eq('id', otpRecord.id);

      if (updateError) {
        console.error('Error updating OTP attempts:', updateError);
        return NextResponse.json(
          { error: 'Unable to verify code. Please try again.' },
          { status: 500 }
        );
      }

      const remainingAttempts = 5 - nextAttempts;
      return NextResponse.json(
        {
          error: `Invalid verification code. ${remainingAttempts} attempts remaining.`
        },
        { status: 400 }
      );
    }

    const { data: deletedRecord, error: deleteError } = await supabase
      .from('email_verifications')
      .delete()
      .eq('id', otpRecord.id)
      .select('id')
      .maybeSingle();

    if (deleteError || !deletedRecord) {
      console.error('Error consuming OTP:', deleteError);
      return NextResponse.json(
        { error: 'Unable to verify code. Please request a new code.' },
        { status: 500 }
      );
    }

    const verificationToken = await generateVerificationToken(normalizedEmail);

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully.',
        verificationToken
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
