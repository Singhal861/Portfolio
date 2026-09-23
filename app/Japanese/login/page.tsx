"use client";

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t.invalidLogin);
        setLoading(false);
        return;
      }

      // Navigate without resetting loading - prevents flicker
      router.push('/Japanese/dashboard');
      router.refresh();
    } catch (err) {
      setError(t.loginFailed);
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow"><span className="eyebrow-dot" /> {t.welcomeBack}</p>
        <h1>{t.login}</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            <span>{t.email}</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </label>
          <label>
            <span>{t.password}</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required />
          </label>
          <p className="auth-switch">
            <Link href="/Japanese/forgot-password">{t.forgotPassword}</Link>
          </p>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="button primary wide" disabled={loading}>
            {loading ? t.signingIn : t.login}
          </button>
        </form>
        <p className="auth-switch">
          {t.needAccount} <Link href="/Japanese/register">{t.createAccount}</Link>
        </p>
      </div>
    </div>
  );
}
