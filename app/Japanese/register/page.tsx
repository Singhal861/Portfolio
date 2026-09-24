"use client";

import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';

const initialStep = 1;

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState(initialStep); // 1: email/name, 2: OTP, 3: password
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // seconds left
  const [otpSent, setOtpSent] = useState(false);

  function resetVerificationState() {
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setVerificationToken('');
    setOtpSent(false);
    setResendCooldown(0);
    setStep(initialStep);
  }

  function handleNameChange(value: string) {
    setName(value);
    if (step !== initialStep || otpSent || verificationToken) {
      resetVerificationState();
    }
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    if (step !== initialStep || otpSent || verificationToken) {
      resetVerificationState();
    }
  }

  // Handle resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // Step 1: Send OTP
  async function handleSendOtp(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/Japanese/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to send verification code.');
      }

      setOtpSent(true);
      setOtp('');
      setVerificationToken('');
      setResendCooldown(60); // 60 seconds cooldown
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify OTP
  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/Japanese/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Invalid verification code.');
      }

      setVerificationToken(payload.verificationToken);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Resend OTP
  async function handleResendOtp(event: FormEvent) {
    event.preventDefault();
    if (loading || resendCooldown > 0) return; // Prevent resend during cooldown

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/Japanese/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to send verification code.');
      }

      setOtpSent(true);
      setOtp('');
      setVerificationToken('');
      setResendCooldown(60); // Reset cooldown
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  }

  // Step 3: Register with verified email
  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError('');

    if (!verificationToken) {
      setError('Please verify your email before registering.');
      setStep(2);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/Japanese/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, verificationToken }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Registration failed.');
      }

      router.push('/Japanese/login');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  // Render based on step
  if (step === 1) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <p className="eyebrow"><span className="eyebrow-dot" /> {t.createAccount}</p>
          <h1>{t.register}</h1>
          <form onSubmit={handleSendOtp} className="auth-form">
            <label>
              <span>{t.name}</span>
              <input value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Your name" required />
            </label>
            <label>
              <span>{t.email}</span>
              <input type="email" value={email} onChange={(e) => handleEmailChange(e.target.value)} placeholder="you@example.com" required />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <button type="submit" className="button primary wide" disabled={loading}>
              {loading ? t.sendingCode : t.sendVerificationCode}
            </button>
            {otpSent && !loading && (
              <p className="form-success">
                {t.codeSent}
              </p>
            )}
          </form>
          <p className="auth-switch">
            {t.alreadyHaveAccount} <Link href="/Japanese/login">{t.login}</Link>
          </p>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <p className="eyebrow"><span className="eyebrow-dot" /> {t.verifyEmail}</p>
          <h1>{t.verifyYourEmail}</h1>
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <p>
              {t.enterVerificationCode} <strong>{email}</strong>.
            </p>
            <label>
              <span>{t.verificationCode}</span>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
              />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <div className="button-group">
              <button type="submit" className="button primary" disabled={loading}>
                {loading ? t.verifying : t.verifyEmail}
              </button>
              {resendCooldown > 0 ? (
                <button type="button" className="button secondary" disabled={loading}>
                  {t.resendIn} {resendCooldown}s
                </button>
              ) : (
                <button type="button" className="button secondary" onClick={handleResendOtp} disabled={loading}>
                  {t.resendCode}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step 3: Password
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow"><span className="eyebrow-dot" /> {t.createAccount}</p>
        <h1>{t.register}</h1>
        <form onSubmit={handleRegister} className="auth-form">
          <p>
            {t.emailVerified} <strong>{email}</strong>.
          </p>
          <label>
            <span>{t.password}</span>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
                className="password-toggle"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </label>
          <label>
            <span>{t.confirmNewPassword}</span>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? t.hidePassword : t.showPassword}
                className="password-toggle"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="button primary wide" disabled={loading}>
            {loading ? t.creating : t.createAccount}
          </button>
        </form>
        <p className="auth-switch">
          {t.alreadyHaveAccount} <Link href="/Japanese/login">{t.login}</Link>
        </p>
      </div>
    </div>
  );
}
