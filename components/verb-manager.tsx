"use client";

import { FormEvent, useEffect, useState } from 'react';
import EmailDataButton from '@/components/email-data-button';
import { useLanguage } from '@/components/language-provider';

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

type VerbFields = {
  [K in keyof Omit<Verb, 'id' | 'S.No' | 'isSample'>]: string;
};

const fields: { key: keyof VerbFields; label: string }[] = [
  { key: 'Meaning', label: 'Meaning' }, { key: 'Dictionary', label: 'Dictionary' }, { key: '~masu', label: '~masu' },
  { key: '~mashita', label: '~mashita' }, { key: '~masen', label: '~masen' }, { key: '~masen deshita', label: '~masen deshita' },
  { key: 'Short -ve (nai/anai)', label: 'Short -ve (nai/anai)' }, { key: 'Past short (ta/da)', label: 'Past short (ta/da)' },
  { key: 'Past short -ve', label: 'Past short -ve' }, { key: '~te', label: '~te' }, { key: '~te-iru', label: '~te-iru' },
  { key: '~te-imasu', label: '~te-imasu' }, { key: '~te-imasu -ve', label: '~te-imasu -ve' }, { key: 'Stem', label: 'Stem' },
];

const emptyVerb = fields.reduce((result, field) => ({ ...result, [field.key]: '' }), {} as VerbFields);

export default function VerbManager({ userName }: { userName: string }) {
  const { t } = useLanguage();
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
    setError('');
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
      setResult(editingId ? t.verbUpdated : t.verbAdded);
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : t.unableSaveVerb); }
    finally { setWorking(false); }
  }

  async function deleteVerb() {
    if (!deleteId) return;
    setWorking(true); setError('');
    try {
      const response = await fetch(`/Japanese/api/verbs/${deleteId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirmation }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || t.unableDeleteVerb);
      setDeleteId(null); setConfirmation(''); await loadVerbs(); setResult(t.verbDeleted);
    } catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : t.unableDeleteVerb); }
    finally { setWorking(false); }
  }

  return (
    <>
      <div className="panel-header">
        <div><p className="eyebrow"><span className="eyebrow-dot" /> {t.myVocabulary}</p><h1>{t.welcome}, {userName}</h1><p className="hero-text">{t.vocabularyDescription}</p></div>
        <div className="header-actions">
          <button type="button" className="button secondary" onClick={() => { setLoading(true); loadVerbs().catch((e) => { setError(e instanceof Error ? e.message : t.unableLoadVerbs); setLoading(false); }); }}>{t.refresh}</button>
          <button type="button" className="button primary" onClick={openAdd}>{t.addVerb}</button>
          <a href="/Japanese/api/export" className="button secondary">{t.downloadCsv}</a>
          <EmailDataButton email="" />
        </div>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {result && !formOpen ? <div className="action-result"><span>{result}</span><button type="button" className="button primary" onClick={openAdd}>{t.addMoreVerbs}</button><button type="button" className="button secondary" onClick={() => setResult('')}>{t.back}</button></div> : null}
      {loading ? <p className="empty-state">{t.loadingVerbs}</p> : <div className="table-wrap"><table><thead><tr><th>S.No</th>{fields.map((field) => <th key={field.key}>{field.label}</th>)}<th>{t.actions}</th></tr></thead><tbody>{verbs.map((verb) => <tr key={verb.id}><td>{verb['S.No']}</td>{fields.map((field) => <td key={field.key}>{verb[field.key]}</td>)}<td className="action-cell">{verb.isSample || verb.id.startsWith('verb_sample_') ? <span className="badge-immutable" title={t.defaultRowTitle}>🔒 {t.defaultRow}</span> : <><button type="button" className="icon-action" aria-label={t.editVerb} title={t.editVerb} onClick={() => openEdit(verb)}>✎</button><button type="button" className="icon-action danger" aria-label={t.deleteVerb} title={t.deleteVerb} onClick={() => { setDeleteId(verb.id); setConfirmation(''); setError(''); }}>⌫</button></>}</td></tr>)}</tbody></table></div>}

      {formOpen ? <div className="modal-backdrop" role="presentation" onClick={(e) => e.target === e.currentTarget && handleCloseAttempt()}><form className="modal-card verb-modal" onSubmit={saveVerb}><button type="button" className="modal-close-x" onClick={handleCloseAttempt} aria-label={t.close}>×</button><div className="panel-header"><div><p className="eyebrow"><span className="eyebrow-dot" /> {t.verbForms}</p><h2>{editingId ? t.editVerb : t.addVerb}</h2></div><button type="button" className="modal-close" onClick={handleCloseAttempt}>{t.back}</button></div><div className="verb-form-grid">{fields.map((field) => <label key={field.key}><span>{field.label}</span><input value={form[field.key] || ''} onChange={(event) => updateField(field.key, event.target.value)} required /></label>)}</div>{error ? <p className="form-error">{error}</p> : null}<div className="form-actions"><button type="submit" className={`button primary ${working ? 'is-working' : ''}`} disabled={working}>{working ? t.saving : t.submit}</button><button type="button" className="button secondary" onClick={clearForm} disabled={working}>{t.clear}</button>{editingId ? <button type="button" className="button danger-button" onClick={() => { setDeleteId(editingId); setConfirmation(''); }} disabled={working}>{t.delete}</button> : null}</div></form></div> : null}

      {deleteId ? <div className="modal-backdrop" role="presentation"><div className="modal-card delete-modal"><p className="eyebrow"><span className="eyebrow-dot" /> {t.confirmDeletion}</p><h2>{t.typeDelete}</h2><p className="hero-text">{t.deleteHelp}</p><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="DELETE" autoFocus /><div className="form-actions"><button type="button" className="button secondary" onClick={() => { setDeleteId(null); setConfirmation(''); }}>{t.back}</button><button type="button" className={`button danger-button ${working ? 'is-working' : ''}`} onClick={deleteVerb} disabled={confirmation !== 'DELETE' || working}>{working ? t.deleting : t.delete}</button></div></div></div> : null}

      {showCloseWarning ? <div className="modal-backdrop" role="presentation"><div className="modal-card delete-modal"><p className="eyebrow"><span className="eyebrow-dot" /> {t.unsavedChanges}</p><h2>{t.closeWithoutSubmitting}</h2><p className="hero-text">{t.lostDataWarning}</p><div className="form-actions"><button type="button" className="button secondary" onClick={() => setShowCloseWarning(false)}>{t.keepEditing}</button><button type="button" className="button danger-button" onClick={resetAndCloseForm}>{t.closeAnyway}</button></div></div></div> : null}
    </>
  );
}
