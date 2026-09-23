"use client";

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/language-provider';

function ResetPasswordForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(token ? '' : t.invalidOrExpiredResetLink);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading || !token) return;

    setError('');

    if (password !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/Japanese/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || t.passwordResetFailed);
      }

      setPassword('');
      setConfirmPassword('');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.passwordResetFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow"><span className="eyebrow-dot" /> {t.resetPassword}</p>
        <h1>{t.resetPassword}</h1>
        {success ? (
          <>
            <p className="form-success">{t.passwordResetSuccessful}</p>
            <p className="auth-switch">
              <Link href="/Japanese/login">{t.backToLogin}</Link>
            </p>
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="auth-form">
              <label>
                <span>{t.newPassword}</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required disabled={!token} />
              </label>
              <label>
                <span>{t.confirmNewPassword}</span>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password" minLength={8} required disabled={!token} />
              </label>
              {error ? <p className="form-error">{error}</p> : null}
              <button type="submit" className="button primary wide" disabled={loading || !token}>
                {loading ? t.resettingPassword : t.resetPassword}
              </button>
            </form>
            <p className="auth-switch">
              <Link href="/Japanese/login">{t.backToLogin}</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
