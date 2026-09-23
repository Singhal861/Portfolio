import 'server-only';
import crypto from 'crypto';
import { env } from './env';

export const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;
export const PASSWORD_RESET_COOLDOWN_MS = 60 * 1000;
export const PASSWORD_RESET_GENERIC_MESSAGE = 'If an account exists for this email, a password reset link has been sent.';
export const PASSWORD_RESET_INVALID_MESSAGE = 'Invalid or expired reset link.';

export function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashPasswordResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getPasswordResetUrl(token: string) {
  const configuredUrl = env.nextAuthUrl || 'http://localhost:3000/Japanese';
  const trimmedUrl = configuredUrl.replace(/\/+$/, '');
  const japaneseBaseUrl = trimmedUrl.endsWith('/Japanese') ? trimmedUrl : `${trimmedUrl}/Japanese`;

  return `${japaneseBaseUrl}/reset-password?token=${encodeURIComponent(token)}`;
}
