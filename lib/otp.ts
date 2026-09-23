import { env } from './env';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

const encoder = new TextEncoder();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getVerificationSecret() {
  if (process.env.NODE_ENV === 'production' && !process.env.AUTH_SECRET) {
    throw new Error('AUTH_SECRET is required for email verification tokens.');
  }
  return encoder.encode(env.authSecret);
}

// OTP generation and verification
export function generateOTP(): string {
  return crypto.randomInt(0, 1000000).toString().padStart(6, '0');
}

export async function hashOTP(otp: string): Promise<string> {
  // Hash OTP using bcrypt (same cost as password hashing)
  return bcrypt.hash(otp, 10);
}

export async function verifyOTP(otp: string, hashedOTP: string): Promise<boolean> {
  return bcrypt.compare(otp, hashedOTP);
}

// Verification token (JWT) handling
export async function generateVerificationToken(email: string): Promise<string> {
  const token = await new SignJWT({ email: normalizeEmail(email) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getVerificationSecret());
  return token;
}

export async function verifyVerificationToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getVerificationSecret());
    if (typeof payload.email !== 'string') {
      return null;
    }
    return { email: normalizeEmail(payload.email) };
  } catch (error) {
    // Token invalid or expired
    return null;
  }
}
