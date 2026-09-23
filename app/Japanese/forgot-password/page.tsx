"use client";

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;

    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/Japanese/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || t.passwordResetFailed);
      }

      setMessage(payload.message || t.resetLinkSent);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.passwordResetFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow"><span className="eyebrow-dot" /> {t.forgotPassword}</p>
        <h1>{t.resetPassword}</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            <span>{t.enterYourEmail}</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </label>
          {message ? <p className="form-success">{message}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="button primary wide" disabled={loading}>
            {loading ? t.sending : t.sendResetLink}
          </button>
        </form>
        <p className="auth-switch">
          <Link href="/Japanese/login">{t.backToLogin}</Link>
        </p>
      </div>
    </div>
  );
}
