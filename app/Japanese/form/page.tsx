"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FormPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/Japanese/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Submission failed.');
      }

      router.push('/Japanese/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="page-shell">
      <section className="panel form-panel">
        <p className="eyebrow"><span className="eyebrow-dot" /> Submit details</p>
        <h1>Personal submission</h1>
        <form onSubmit={handleSubmit} className="styled-form">
          <div className="grid-2">
            <label>
              <span>Name</span>
              <input value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Full name" required />
            </label>
            <label>
              <span>Email</span>
              <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="you@example.com" required />
            </label>
            <label>
              <span>Phone</span>
              <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+1 234 567 890" required />
            </label>
            <label>
              <span>Address</span>
              <input value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Street, city, ZIP" required />
            </label>
          </div>
          <label>
            <span>Notes</span>
            <textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Add any details you want stored securely" rows={6} required />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="button primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </section>
    </div>
  );
}
