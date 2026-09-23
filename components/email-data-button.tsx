"use client";

import { useState } from 'react';

export default function EmailDataButton({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleEmail() {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/Japanese/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to email your data.');
      }

      setMessage('Your data has been emailed to you.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to email your data right now.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className="button secondary" onClick={handleEmail} disabled={loading}>
        {loading ? 'Sending...' : 'Email me my data'}
      </button>
      {message ? <p className="form-error" style={{ marginTop: 8 }}>{message}</p> : null}
    </>
  );
}
