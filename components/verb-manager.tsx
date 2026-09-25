"use client";

import { FormEvent, useEffect, useState, useCallback, useRef } from 'react';
import EmailDataButton from '@/components/email-data-button';
import { useLanguage } from '@/components/language-provider';
import { useMemo } from 'react';
import { getVerbConjugations, guessDictionaryForm, getExpectedDictionaryFormsForMeaning, ConjugationSet } from '@/lib/japanese-verb-validator';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof VerbFields, string>>>({});

  const expectedConjugations = useMemo(() => {
    if (!form.Dictionary.trim()) return null;
    return getVerbConjugations(form.Dictionary);
  }, [form.Dictionary]);

  const tableValidations = useMemo(() => {
    const validations: Record<string, Record<string, string>> = {};
    for (const verb of verbs) {
      const vDict = verb.Dictionary?.trim();
      if (!vDict) continue;

      validations[verb.id] = {};
      
      let meaningMismatch = false;
      const vMeaning = verb.Meaning?.trim();
      if (vMeaning) {
        const expectedDicts = getExpectedDictionaryFormsForMeaning(vMeaning);
        if (expectedDicts && !expectedDicts.includes(vDict)) {
          validations[verb.id]['Dictionary'] = `Expected dictionary:\n${expectedDicts.join(' / ')}\n\nReason:\nThe Dictionary form does not match the English meaning '${vMeaning}'.`;
          meaningMismatch = true;
        }
      }

      const conjugations = getVerbConjugations(vDict);
      
      if (!meaningMismatch && conjugations.masu.length === 0) {
        const guessed = guessDictionaryForm(vDict);
        if (guessed) {
          validations[verb.id]['Dictionary'] = `This appears to be a past form. Expected dictionary/base form: ${guessed.join(' / ')}.`;
        }
      } else if (!meaningMismatch) {
        for (const field of fields) {
          if (field.key === 'Meaning' || field.key === 'Dictionary') continue;
          const val = verb[field.key]?.trim();
          if (!val) continue;

          let conjKey: keyof ConjugationSet | null = null;
          switch (field.key) {
            case '~masu': conjKey = 'masu'; break;
            case '~mashita': conjKey = 'mashita'; break;
            case '~masen': conjKey = 'masen'; break;
            case '~masen deshita': conjKey = 'masenDeshita'; break;
            case 'Short -ve (nai/anai)': conjKey = 'shortNegative'; break;
            case 'Past short (ta/da)': conjKey = 'pastShort'; break;
            case 'Past short -ve': conjKey = 'pastShortNegative'; break;
            case '~te': conjKey = 'te'; break;
            case '~te-iru': conjKey = 'teIru'; break;
            case '~te-imasu': conjKey = 'teImasu'; break;
            case '~te-imasu -ve': conjKey = 'teImasuNegative'; break;
            case 'Stem': conjKey = 'stem'; break;
          }

          if (conjKey) {
            const expectedList = conjugations[conjKey];
            if (expectedList && expectedList.length > 0 && !expectedList.includes(val)) {
              validations[verb.id][field.key] = `Expected: ${expectedList.join(' / ')}`;
            }
          }
        }
      }
    }
    return validations;
  }, [verbs]);

  const [activeWarning, setActiveWarning] = useState<{id: string, field: string} | null>(null);

  const validateField = useCallback((fieldKey: keyof VerbFields, value: string) => {
    if (fieldKey === 'Meaning' || fieldKey === 'Dictionary') {
      setValidationErrors(prev => ({ ...prev, [fieldKey]: '' }));
      return;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      setValidationErrors(prev => ({ ...prev, [fieldKey]: '' }));
      return;
    }

    if (!expectedConjugations) {
      setValidationErrors(prev => ({ ...prev, [fieldKey]: '' }));
      return;
    }

    let conjKey: 'masu' | 'mashita' | 'masen' | 'masenDeshita' | 'shortNegative' | 'pastShort' | 'pastShortNegative' | 'te' | 'teIru' | 'teImasu' | 'teImasuNegative' | 'stem' | null = null;
    switch (fieldKey) {
      case '~masu': conjKey = 'masu'; break;
      case '~mashita': conjKey = 'mashita'; break;
      case '~masen': conjKey = 'masen'; break;
      case '~masen deshita': conjKey = 'masenDeshita'; break;
      case 'Short -ve (nai/anai)': conjKey = 'shortNegative'; break;
      case 'Past short (ta/da)': conjKey = 'pastShort'; break;
      case 'Past short -ve': conjKey = 'pastShortNegative'; break;
      case '~te': conjKey = 'te'; break;
      case '~te-iru': conjKey = 'teIru'; break;
      case '~te-imasu': conjKey = 'teImasu'; break;
      case '~te-imasu -ve': conjKey = 'teImasuNegative'; break;
      case 'Stem': conjKey = 'stem'; break;
    }

    if (!conjKey) return;

    const expectedList = expectedConjugations[conjKey];
    if (!expectedList || expectedList.length === 0) {
      setValidationErrors(prev => ({ ...prev, [fieldKey]: '' }));
      return;
    }

    if (expectedList.includes(trimmed)) {
      setValidationErrors(prev => ({ ...prev, [fieldKey]: 'VALID' }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        [fieldKey]: `❌ Expected: ${expectedList.join(' or ')}`
      }));
    }
  }, [expectedConjugations]);

  const debouncedSearchTerm = useRef<string>('');
  const debouncedSearchHandler = useCallback(() => {
    setSearchTerm(debouncedSearchTerm.current);
  }, [debouncedSearchTerm]);

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
    setValidationErrors({});
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
    setValidationErrors({});
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

  // Filter verbs based on search term (case-insensitive partial match on Meaning field)
  const filteredVerbs = useMemo(() => {
    if (!searchTerm.trim()) return verbs;
    const term = searchTerm.toLowerCase().trim();
    return verbs.filter(verb => 
      verb.Meaning.toLowerCase().includes(term)
    );
  }, [verbs, searchTerm]);

  return (
    <>
      <div className="panel-header">
        <div><p className="eyebrow"><span className="eyebrow-dot" /> {t.myVocabulary}</p><h1>{t.welcome}, {userName}</h1><p className="hero-text">{t.vocabularyDescription}</p></div>
        <div className="dashboard-actions">
          <button type="button" className="button primary" onClick={openAdd}>{t.addVerb}</button>
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchVerbs}
              className="search-input"
            />
            {searchTerm.trim() && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchTerm('')}
                aria-label={t.clearSearch}
              >
                ✕
              </button>
            )}
          </div>
          <a href="/Japanese/api/export" className="button secondary hide-below-1200">{t.downloadCsv}</a>
          <div className="hide-below-1200"><EmailDataButton email="" /></div>
        </div>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {result && !formOpen ? <div className="action-result" onClick={() => setResult('')}>
        <span>{result}</span>
      </div> : null}
      {loading ? <p className="empty-state">{t.loadingVerbs}</p> : <div className="table-wrap"><table><thead><tr><th>S.No</th>{fields.map((field) => <th key={field.key}>{field.label}</th>)}<th>{t.actions}</th></tr></thead><tbody>{filteredVerbs.map((verb) => <tr key={verb.id}><td>{verb['S.No']}</td>{fields.map((field) => {
        const warningMsg = tableValidations[verb.id]?.[field.key];
        return (
          <td key={field.key}>
            {verb[field.key]}
            {warningMsg && (
              <span style={{ position: 'relative', display: 'inline-block', marginLeft: '4px' }}>
                <button 
                  type="button" 
                  onClick={() => setActiveWarning({ id: verb.id, field: field.key })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  title="Show warning"
                >⚠️</button>
                {activeWarning?.id === verb.id && activeWarning?.field === field.key && (
                  <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: 'var(--card-bg, #fff)', border: '1px solid var(--sakura-deep, #ffb7c5)', padding: '8px', borderRadius: '4px', zIndex: 10, whiteSpace: 'pre-wrap', minWidth: '200px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: '0.85rem', color: 'var(--text-color, #333)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ flex: 1 }}>{warningMsg}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setActiveWarning(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '4px' }}>✕</button>
                  </div>
                )}
              </span>
            )}
          </td>
        );
      })}<td className="action-cell">{verb.isSample || verb.id.startsWith('verb_sample_') ? <span className="badge-immutable" title={t.defaultRowTitle}>🔒 {t.defaultRow}</span> : <><button type="button" className="icon-action" aria-label={t.editVerb} title={t.editVerb} onClick={() => openEdit(verb)}>✎</button><button type="button" className="icon-action danger" aria-label={t.deleteVerb} title={t.deleteVerb} onClick={() => { setDeleteId(verb.id); setConfirmation(''); setError(''); }}>⌫</button></>}</td></tr>)}</tbody></table></div>}

      {formOpen ? <div className="modal-backdrop" role="presentation" onClick={(e) => e.target === e.currentTarget && handleCloseAttempt()}><form className="modal-card verb-modal" onSubmit={saveVerb}><div className="panel-header"><div><p className="eyebrow"><span className="eyebrow-dot" /> {t.verbForms}</p><h2>{editingId ? t.editVerb : t.addVerb}</h2></div><button type="button" className="modal-close" onClick={handleCloseAttempt}>{t.back}</button></div><div className="verb-form-grid">{fields.map((field) => {
        const validationError = validationErrors[field.key];
        const isValid = validationError === 'VALID';
        const hasError = validationError && validationError !== 'VALID';
        return (
          <label key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span>{field.label}</span>
            <input
              value={form[field.key] || ''}
              onChange={(event) => updateField(field.key, event.target.value)}
              onBlur={(event) => validateField(field.key, event.target.value)}
              required
            />
            {hasError && <span style={{ color: 'var(--crimson)', fontSize: '0.75rem' }}>{validationError}</span>}
            {isValid && <span style={{ color: 'var(--sakura-deep)', fontSize: '0.75rem' }}>✓ Valid</span>}
          </label>
        );
      })}</div>{error ? <p className="form-error">{error}</p> : null}<div className="form-actions"><button type="submit" className={`button primary ${working ? 'is-working' : ''}`} disabled={working}>{working ? t.saving : t.submit}</button><button type="button" className="button secondary" onClick={clearForm} disabled={working}>{t.clear}</button>{editingId ? <button type="button" className="button danger-button" onClick={() => { setDeleteId(editingId); setConfirmation(''); }} disabled={working}>{t.delete}</button> : null}</div></form></div> : null}

      {deleteId ? <div className="modal-backdrop" role="presentation"><div className="modal-card delete-modal"><p className="eyebrow"><span className="eyebrow-dot" /> {t.confirmDeletion}</p><h2>{t.typeDelete}</h2><p className="hero-text">{t.deleteHelp}</p><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="DELETE" autoFocus /><div className="form-actions"><button type="button" className="button secondary" onClick={() => { setDeleteId(null); setConfirmation(''); }}>{t.back}</button><button type="button" className={`button danger-button ${working ? 'is-working' : ''}`} onClick={deleteVerb} disabled={confirmation !== 'DELETE' || working}>{working ? t.deleting : t.delete}</button></div></div></div> : null}

      {showCloseWarning ? <div className="modal-backdrop" role="presentation"><div className="modal-card delete-modal"><p className="eyebrow"><span className="eyebrow-dot" /> {t.unsavedChanges}</p><h2>{t.closeWithoutSubmitting}</h2><p className="hero-text">{t.lostDataWarning}</p><div className="form-actions"><button type="button" className="button secondary" onClick={() => setShowCloseWarning(false)}>{t.keepEditing}</button><button type="button" className="button danger-button" onClick={resetAndCloseForm}>{t.closeAnyway}</button></div></div></div> : null}
    </>
  );
}
