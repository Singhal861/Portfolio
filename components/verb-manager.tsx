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
  isSample?: boolean;
};

type VerbFields = Omit<Verb, 'id' | 'S.No'>;

const fields: { key: keyof VerbFields; label: string }[] = [
  { key: 'Meaning', label: 'Meaning' }, { key: 'Dictionary', label: 'Dictionary' }, { key: '~masu', label: '~masu' },
  { key: '~mashita', label: '~mashita' }, { key: '~masen', label: '~masen' }, { key: '~masen deshita', label: '~masen deshita' },
  { key: 'Short -ve (nai/anai)', label: 'Short -ve (nai/anai)' }, { key: 'Past short (ta/da)', label: 'Past short (ta/da)' },
  { key: 'Past short -ve', label: 'Past short -ve' }, { key: '~te', label: '~te' }, { key: '~te-iru', label: '~te-iru' },
  { key: '~te-imasu', label: '~te-imasu' }, { key: '~te-imasu -ve', label: '~te-imasu -ve' }, { key: 'Stem', label: 'Stem' },
];

const emptyVerb = fields.reduce((result, field) => ({ ...result, [field.key]: '' }), {} as VerbFields);

export default function VerbManager({ userName }: { userName: string }) {
  const [verbs, setVerbs] = useState<Verb[]>([]);
  const [form, setForm] = useState<VerbFields>({ ...emptyVerb });
  const [originalForm, setOriginalForm] = useState<VerbFields | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [showCloseWarning, setShowCloseWarning] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState('');

  async function loadVerbs() {
    const response = await fetch('/Japanese/api/verbs');
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Unable to load verbs.');
    setVerbs(payload);
    setLoading(false);
  }

  useEffect(() => { loadVerbs().catch((loadError) => { setError(loadError instanceof Error ? loadError.message : 'Unable to load verbs.'); setLoading(false); }); }, []);

  function openAdd() {
    const freshForm = { ...emptyVerb };
    setEditingId(null);
    setForm(freshForm);
    setOriginalForm(freshForm);
    setResult('');
    setError('');
    setShowCloseWarning(false);
    setFormOpen(true);
  }

  function openEdit(verb: Verb) {
    const editForm = fields.reduce((current, field) => ({ ...current, [field.key]: verb[field.key] || '' }), {} as VerbFields);
    setEditingId(verb.id);
    setForm(editForm);
    setOriginalForm(editForm);
    setResult('');
    setError('');
    setShowCloseWarning(false);
    setFormOpen(true);
  }

  function isFormEmpty() {
    return fields.every((field) => !String(form[field.key] || '').trim());
  }

  function hasUnsavedChanges() {
    if (!originalForm) return false;
    return fields.some((field) => form[field.key] !== originalForm[field.key]);
  }

  function resetAndCloseForm() {
    setFormOpen(false);
    setEditingId(null);
    setOriginalForm(null);
    setShowCloseWarning(false);
    setResult('');
    setError('');
    setForm({ ...emptyVerb });
  }

  function handleCloseAttempt() {
    if (working) return;
    if (isFormEmpty() || !hasUnsavedChanges()) {
      resetAndCloseForm();
      return;
    }
    setShowCloseWarning(true);
  }

  function clearForm() {
    setForm({ ...emptyVerb });
    setError('');
    setResult('');
  }

  function updateField(field: keyof VerbFields, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveVerb(event: FormEvent) {
    event.preventDefault(); setWorking(true); setError(''); setResult('');
    try {
      const response = await fetch(editingId ? `/Japanese/api/verbs/${editingId}` : '/Japanese/api/verbs', { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to save verb.');
      await loadVerbs();
      resetAndCloseForm();
      setResult(editingId ? 'Verb updated successfully.' : 'Verb added successfully.');
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Unable to save verb.'); }
    finally { setWorking(false); }
  }

  async function deleteVerb() {
    if (!deleteId) return;
    setWorking(true); setError('');
    try {
      const response = await fetch(`/Japanese/api/verbs/${deleteId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirmation }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to delete verb.');
      setDeleteId(null); setConfirmation(''); await loadVerbs(); setResult('Verb deleted successfully.');
    } catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete verb.'); }
    finally { setWorking(false); }
  }

  return (
    <>
      <div className="panel-header">
        <div><p className="eyebrow"><span className="eyebrow-dot" /> My vocabulary</p><h1>Welcome, {userName}</h1><p className="hero-text">Keep every Japanese verb form in one personal sheet.</p></div>
        <div className="header-actions"><button type="button" className="button primary" onClick={openAdd}>Add verb</button><a href="/Japanese/api/export" className="button secondary">Download CSV</a><EmailDataButton email="" /></div>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {result && !formOpen ? <div className="action-result"><span>{result}</span><button type="button" className="button primary" onClick={openAdd}>Add more verbs</button><button type="button" className="button secondary" onClick={() => setResult('')}>Back</button></div> : null}
      {loading ? <p className="empty-state">Loading your verbs...</p> : <div className="table-wrap"><table><thead><tr><th>S.No</th>{fields.map((field) => <th key={field.key}>{field.label}</th>)}<th>Actions</th></tr></thead><tbody>{verbs.map((verb) => <tr key={verb.id}><td>{verb['S.No']}</td>{fields.map((field) => <td key={field.key}>{verb[field.key]}</td>)}<td className="action-cell">{verb.isSample || verb.id.startsWith('verb_sample_') ? <span className="badge-immutable" title="Default sample row (immutable)">🔒 Default</span> : <><button type="button" className="icon-action" aria-label="Edit verb" title="Edit verb" onClick={() => openEdit(verb)}>✎</button><button type="button" className="icon-action danger" aria-label="Delete verb" title="Delete verb" onClick={() => { setDeleteId(verb.id); setConfirmation(''); setError(''); }}>⌫</button></>}</td></tr>)}</tbody></table></div>}

      {formOpen ? <div className="modal-backdrop" role="presentation" onClick={(e) => e.target === e.currentTarget && handleCloseAttempt()}><form className="modal-card verb-modal" onSubmit={saveVerb}><button type="button" className="modal-close-x" onClick={handleCloseAttempt} aria-label="Close">×</button><div className="panel-header"><div><p className="eyebrow"><span className="eyebrow-dot" /> Verb forms</p><h2>{editingId ? 'Edit verb' : 'Add verb'}</h2></div><button type="button" className="modal-close" onClick={handleCloseAttempt}>Back</button></div><div className="verb-form-grid">{fields.map((field) => <label key={field.key}><span>{field.label}</span><input value={form[field.key]} onChange={(event) => updateField(field.key, event.target.value)} required /></label>)}</div>{error ? <p className="form-error">{error}</p> : null}<div className="form-actions"><button type="submit" className={`button primary ${working ? 'is-working' : ''}`} disabled={working}>{working ? 'Saving...' : 'Submit'}</button><button type="button" className="button secondary" onClick={clearForm} disabled={working}>Clear</button>{editingId ? <button type="button" className="button danger-button" onClick={() => { setDeleteId(editingId); setConfirmation(''); }} disabled={working}>Delete</button> : null}</div></form></div> : null}

      {deleteId ? <div className="modal-backdrop" role="presentation"><div className="modal-card delete-modal"><p className="eyebrow"><span className="eyebrow-dot" /> Confirm deletion</p><h2>Type DELETE to continue</h2><p className="hero-text">This prevents accidental removal of the verb.</p><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="DELETE" autoFocus /><div className="form-actions"><button type="button" className="button secondary" onClick={() => { setDeleteId(null); setConfirmation(''); }}>Back</button><button type="button" className={`button danger-button ${working ? 'is-working' : ''}`} onClick={deleteVerb} disabled={confirmation !== 'DELETE' || working}>{working ? 'Deleting...' : 'Delete'}</button></div></div></div> : null}

      {showCloseWarning ? <div className="modal-backdrop" role="presentation"><div className="modal-card delete-modal"><p className="eyebrow"><span className="eyebrow-dot" /> Unsaved changes</p><h2>Close without submitting?</h2><p className="hero-text">You have entered data that will be lost.</p><div className="form-actions"><button type="button" className="button secondary" onClick={() => setShowCloseWarning(false)}>Keep editing</button><button type="button" className="button danger-button" onClick={resetAndCloseForm}>Close anyway</button></div></div></div> : null}
    </>
  );
}
