"use client";

import { FormEvent, useEffect, useState } from 'react';
import EmailDataButton from '@/components/email-data-button';

type Verb = {
  id: string;
  'S.No': string;
  Meaning: string;
  Dictionary: string;
  '~masu': string;
  '~mashita': string;
  '~masen': string;
  '~masen deshita': string;
  'Short -ve (nai/anai)': string;
  'Past short (ta/da)': string;
  'Past short -ve': string;
  '~te': string;
  '~te-iru': string;
  '~te-imasu': string;
  '~te-imasu -ve': string;
  Stem: string;
};

type VerbFields = Omit<Verb, 'id' | 'S.No'>;

const fields: { key: keyof VerbFields; label: string }[] = [
  { key: 'Meaning', label: 'Meaning' },
  { key: 'Dictionary', label: 'Dictionary' },
  { key: '~masu', label: '~masu' },
  { key: '~mashita', label: '~mashita' },
  { key: '~masen', label: '~masen' },
  { key: '~masen deshita', label: '~masen deshita' },
  { key: 'Short -ve (nai/anai)', label: 'Short -ve (nai/anai)' },
  { key: 'Past short (ta/da)', label: 'Past short (ta/da)' },
  { key: 'Past short -ve', label: 'Past short -ve' },
  { key: '~te', label: '~te' },
  { key: '~te-iru', label: '~te-iru' },
  { key: '~te-imasu', label: '~te-imasu' },
  { key: '~te-imasu -ve', label: '~te-imasu -ve' },
  { key: 'Stem', label: 'Stem' },
];

const emptyVerb = fields.reduce((result, field) => ({ ...result, [field.key]: '' }), {} as VerbFields);

export default function VerbManager({ userName }: { userName: string }) {
  const [verbs, setVerbs] = useState<Verb[]>([]);
  const [form, setForm] = useState<VerbFields>(emptyVerb);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
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
    setForm({ ...emptyVerb });
    setFormOpen(true);
    setError('');
  }

  function openEdit(verb: Verb) {
    setEditingId(verb.id);
    setForm(fields.reduce((result, field) => ({ ...result, [field.key]: verb[field.key] || '' }), {} as VerbFields));
    setFormOpen(true);
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
    setForm({ ...emptyVerb });
    setFormOpen(false);
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

  function updateField(field: keyof VerbFields, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <>
      <div className="panel-header">
        <div>
          <p className="eyebrow"><span className="eyebrow-dot" /> My vocabulary</p>
          <h1>Welcome, {userName}</h1>
          <p className="hero-text">Keep every Japanese verb form in one personal sheet.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="button primary" onClick={openAdd}>Add verb</button>
          <a href="/Japanese/api/export" className="button secondary">Download CSV</a>
          <EmailDataButton email="" />
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {loading ? <p className="empty-state">Loading your verbs...</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>S.No</th>{fields.map((field) => <th key={field.key}>{field.label}</th>)}<th>Actions</th></tr></thead>
            <tbody>{verbs.map((verb) => (
              <tr key={verb.id}>
                <td>{verb['S.No']}</td>{fields.map((field) => <td key={field.key}>{verb[field.key]}</td>)}
                <td><button type="button" className="table-action" onClick={() => openEdit(verb)}>Edit</button> <button type="button" className="table-action danger" onClick={() => setDeleteId(verb.id)}>Delete</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {formOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="modal-card" onSubmit={saveVerb}>
            <div className="panel-header"><div><p className="eyebrow"><span className="eyebrow-dot" /> Verb forms</p><h2>{editingId ? 'Edit verb' : 'Add verb'}</h2></div><button type="button" className="modal-close" onClick={() => setFormOpen(false)}>Close</button></div>
            <div className="grid-2">
              {fields.map((field) => <label key={field.key}><span>{field.label}</span><input value={form[field.key]} onChange={(event) => updateField(field.key, event.target.value)} required /></label>)}
            </div>
            <button type="submit" className="button primary">{editingId ? 'Save changes' : 'Add verb'}</button>
          </form>
        </div>
      ) : null}

      {deleteId ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card"><p className="eyebrow"><span className="eyebrow-dot" /> Confirm deletion</p><h2>Delete this verb?</h2><p className="hero-text">Type DELETE below to permanently remove it from your vocabulary.</p><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="DELETE" autoFocus /><div className="cta-row"><button type="button" className="button secondary" onClick={() => { setDeleteId(null); setConfirmation(''); }}>Cancel</button><button type="button" className="button danger-button" onClick={deleteVerb} disabled={confirmation !== 'DELETE'}>Delete verb</button></div></div>
        </div>
      ) : null}
    </>
  );
}
