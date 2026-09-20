"use client";

import { FormEvent, useEffect, useState } from 'react';
import EmailDataButton from '@/components/email-data-button';

type Verb = {
  id: string;
  kanji: string;
  reading: string;
  meaning: string;
  masuForm: string;
  dictionaryForm: string;
  teForm: string;
  notes: string;
};

const emptyVerb: Omit<Verb, 'id'> = {
  kanji: '', reading: '', meaning: '', masuForm: '', dictionaryForm: '', teForm: '', notes: '',
};

export default function VerbManager({ userName }: { userName: string }) {
  const [verbs, setVerbs] = useState<Verb[]>([]);
  const [form, setForm] = useState<Omit<Verb, 'id'>>(emptyVerb);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadVerbs() {
    const response = await fetch('/Japanese/api/verbs');
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Unable to load verbs.');
    setVerbs(payload);
    setLoading(false);
  }

  useEffect(() => {
    loadVerbs().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load verbs.');
      setLoading(false);
    });
  }, []);

  function openAdd() {
    setEditingId(null);
    setForm(emptyVerb);
    setError('');
  }

  function openEdit(verb: Verb) {
    setEditingId(verb.id);
    setForm({ kanji: verb.kanji, reading: verb.reading, meaning: verb.meaning, masuForm: verb.masuForm, dictionaryForm: verb.dictionaryForm, teForm: verb.teForm, notes: verb.notes });
    setError('');
  }

  async function saveVerb(event: FormEvent) {
    event.preventDefault();
    setError('');
    const response = await fetch(editingId ? `/Japanese/api/verbs/${editingId}` : '/Japanese/api/verbs', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || 'Unable to save verb.');
      return;
    }
    setEditingId(null);
    setForm(emptyVerb);
    await loadVerbs();
  }

  async function deleteVerb() {
    if (!deleteId) return;
    const response = await fetch(`/Japanese/api/verbs/${deleteId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || 'Unable to delete verb.');
      return;
    }
    setDeleteId(null);
    setConfirmation('');
    await loadVerbs();
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <>
      <div className="panel-header">
        <div>
          <p className="eyebrow"><span className="eyebrow-dot" /> My vocabulary</p>
          <h1>Welcome, {userName}</h1>
          <p className="hero-text">Build your personal verb list one word at a time.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="button primary" onClick={openAdd}>Add verb</button>
          <a href="/Japanese/api/export" className="button secondary">Download CSV</a>
          <EmailDataButton email="" />
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {loading ? <p className="empty-state">Loading your verbs...</p> : verbs.length === 0 ? (
        <div className="empty-state">
          <h3>Your vocabulary list is empty</h3>
          <p>Add the first verb you learned.</p>
          <button type="button" className="button primary" onClick={openAdd}>Add your first verb</button>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Japanese</th><th>Reading</th><th>Meaning</th><th>ます</th><th>Dictionary</th><th>て</th><th>Actions</th></tr></thead>
            <tbody>{verbs.map((verb) => (
              <tr key={verb.id}>
                <td>{verb.kanji}</td><td>{verb.reading}</td><td>{verb.meaning}</td><td>{verb.masuForm}</td><td>{verb.dictionaryForm}</td><td>{verb.teForm}</td>
                <td><button type="button" className="table-action" onClick={() => openEdit(verb)}>Edit</button> <button type="button" className="table-action danger" onClick={() => setDeleteId(verb.id)}>Delete</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {(editingId !== null || form.kanji !== '' || form.meaning !== '') ? (
        <div className="modal-backdrop" role="presentation">
          <form className="modal-card" onSubmit={saveVerb}>
            <div className="panel-header"><div><p className="eyebrow"><span className="eyebrow-dot" /> Verb details</p><h2>{editingId ? 'Edit verb' : 'Add verb'}</h2></div><button type="button" className="modal-close" onClick={() => { setEditingId(null); setForm(emptyVerb); }}>Close</button></div>
            <div className="grid-2">
              <label><span>Japanese verb</span><input value={form.kanji} onChange={(e) => updateField('kanji', e.target.value)} required /></label>
              <label><span>Reading</span><input value={form.reading} onChange={(e) => updateField('reading', e.target.value)} required /></label>
              <label><span>English meaning</span><input value={form.meaning} onChange={(e) => updateField('meaning', e.target.value)} required /></label>
              <label><span>ます form</span><input value={form.masuForm} onChange={(e) => updateField('masuForm', e.target.value)} required /></label>
              <label><span>Dictionary form</span><input value={form.dictionaryForm} onChange={(e) => updateField('dictionaryForm', e.target.value)} required /></label>
              <label><span>て form</span><input value={form.teForm} onChange={(e) => updateField('teForm', e.target.value)} required /></label>
            </div>
            <label><span>Notes</span><textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} rows={3} /></label>
            <button type="submit" className="button primary">{editingId ? 'Save changes' : 'Add verb'}</button>
          </form>
        </div>
      ) : null}

      {deleteId ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card"><p className="eyebrow"><span className="eyebrow-dot" /> Confirm deletion</p><h2>Delete this verb?</h2><p className="hero-text">Type DELETE below to permanently remove it from your vocabulary.</p><input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="DELETE" autoFocus /><div className="cta-row"><button type="button" className="button secondary" onClick={() => { setDeleteId(null); setConfirmation(''); }}>Cancel</button><button type="button" className="button danger-button" onClick={deleteVerb} disabled={confirmation !== 'DELETE'}>Delete verb</button></div></div>
        </div>
      ) : null}
    </>
  );
}