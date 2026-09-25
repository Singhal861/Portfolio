import { supabase } from './supabase';

function getSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please check environment variables.');
  }
  return supabase;
}

export const SHEET_HEADERS = [
  'S.No',
  'Meaning',
  'Dictionary',
  '~masu',
  '~mashita',
  '~masen',
  '~masen deshita',
  'Short -ve (nai/anai)',
  'Past short (ta/da)',
  'Past short -ve',
  '~te',
  '~te-iru',
  '~te-imasu',
  '~te-imasu -ve',
  'Stem',
] as const;

export const FULL_SHEET_COLUMNS = [
  ...SHEET_HEADERS,
  'id',
  'userEmail',
  'createdAt',
  'updatedAt',
];

export const SAMPLE_VERB_DATA = {
  Meaning: 'to wait',
  Dictionary: 'まつ',
  '~masu': 'まちます',
  '~mashita': 'まちました',
  '~masen': 'まちません',
  '~masen deshita': 'まちませんでした',
  'Short -ve (nai/anai)': 'またない',
  'Past short (ta/da)': 'まった',
  'Past short -ve': 'またなかった',
  '~te': 'まって',
  '~te-iru': 'まっている',
  '~te-imasu': 'まっています',
  '~te-imasu -ve': 'まっていません',
  Stem: 'まち',
};



export async function readRows(sheetName: string) {
  if (sheetName === 'Users') {
    const { data, error } = await getSupabase().from('users').select('*');
    if (error) throw error;
    return (data || []).map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      passwordHash: u.password_hash,
      createdAt: u.created_at,
    }));
  }
  return [];
}

export async function appendUser(row: string[]) {
  const [id, name, email, passwordHash, createdAt] = row;

  const { data: existing } = await getSupabase()
    .from('users')
    .select('email')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const { error } = await getSupabase().from('users').insert({
    id,
    name,
    email: email.toLowerCase(),
    password_hash: passwordHash,
    created_at: createdAt || new Date().toISOString(),
  });

  if (error) throw error;

  // Insert sample verb for new user
  const sampleId = `verb_sample_${id}`;
  const now = new Date().toISOString();
  await getSupabase().from('verbs').insert({
    id: sampleId,
    user_email: email.toLowerCase(),
    s_no: '1',
    meaning: SAMPLE_VERB_DATA.Meaning,
    dictionary: SAMPLE_VERB_DATA.Dictionary,
    masu: SAMPLE_VERB_DATA['~masu'],
    mashita: SAMPLE_VERB_DATA['~mashita'],
    masen: SAMPLE_VERB_DATA['~masen'],
    masen_deshita: SAMPLE_VERB_DATA['~masen deshita'],
    short_ve: SAMPLE_VERB_DATA['Short -ve (nai/anai)'],
    past_short: SAMPLE_VERB_DATA['Past short (ta/da)'],
    past_short_ve: SAMPLE_VERB_DATA['Past short -ve'],
    te: SAMPLE_VERB_DATA['~te'],
    te_iru: SAMPLE_VERB_DATA['~te-iru'],
    te_imasu: SAMPLE_VERB_DATA['~te-imasu'],
    te_imasu_ve: SAMPLE_VERB_DATA['~te-imasu -ve'],
    stem: SAMPLE_VERB_DATA.Stem,
    created_at: now,
    updated_at: now,
  });
}

export async function readUserVerbs(email: string) {
  const { data, error } = await getSupabase()
    .from('verbs')
    .select('*')
    .eq('user_email', email.toLowerCase())
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map((v: any, index: number) => ({
    id: v.id,
    'S.No': String(v.s_no || index + 1),
    Meaning: v.meaning,
    Dictionary: v.dictionary,
    '~masu': v.masu,
    '~mashita': v.mashita,
    '~masen': v.masen,
    '~masen deshita': v.masen_deshita,
    'Short -ve (nai/anai)': v.short_ve,
    'Past short (ta/da)': v.past_short,
    'Past short -ve': v.past_short_ve,
    '~te': v.te,
    '~te-iru': v.te_iru,
    '~te-imasu': v.te_imasu,
    '~te-imasu -ve': v.te_imasu_ve,
    Stem: v.stem,
    userEmail: v.user_email,
    createdAt: v.created_at,
    updatedAt: v.updated_at,
  }));
}

export async function readUserVerbsWithNumbers(email: string) {
  const rows: any = await readUserVerbs(email);
  return rows.map((r: any, index: number) => ({
    rowNumber: index + 1,
    data: r,
  }));
}

export async function appendUserVerb(email: string, row: (string | number)[]) {
  const [
    sNo,
    meaning,
    dictionary,
    masu,
    mashita,
    masen,
    masenDeshita,
    shortVe,
    pastShort,
    pastShortVe,
    te,
    teIru,
    teImasu,
    teImasuVe,
    stem,
    verbId,
    userEmail,
    createdAt,
    updatedAt,
  ] = row;

  const { error } = await getSupabase().from('verbs').insert({
    id: String(verbId),
    user_email: String(email).toLowerCase(),
    s_no: String(sNo),
    meaning: String(meaning),
    dictionary: String(dictionary),
    masu: String(masu),
    mashita: String(mashita),
    masen: String(masen),
    masen_deshita: String(masenDeshita),
    short_ve: String(shortVe),
    past_short: String(pastShort),
    past_short_ve: String(pastShortVe),
    te: String(te),
    te_iru: String(teIru),
    te_imasu: String(teImasu),
    te_imasu_ve: String(teImasuVe),
    stem: String(stem),
    created_at: String(createdAt || new Date().toISOString()),
    updated_at: String(updatedAt || new Date().toISOString()),
  });

  if (error) throw error;
}

export async function updateUserVerb(values: (string | number)[]) {
  const [
    sNo,
    meaning,
    dictionary,
    masu,
    mashita,
    masen,
    masenDeshita,
    shortVe,
    pastShort,
    pastShortVe,
    te,
    teIru,
    teImasu,
    teImasuVe,
    stem,
    verbId,
    , // userEmail (unused)
    , // createdAt (unused)
    updatedAt,
  ] = values;

  const { error } = await getSupabase()
    .from('verbs')
    .update({
      s_no: String(sNo),
      meaning: String(meaning),
      dictionary: String(dictionary),
      masu: String(masu),
      mashita: String(mashita),
      masen: String(masen),
      masen_deshita: String(masenDeshita),
      short_ve: String(shortVe),
      past_short: String(pastShort),
      past_short_ve: String(pastShortVe),
      te: String(te),
      te_iru: String(teIru),
      te_imasu: String(teImasu),
      te_imasu_ve: String(teImasuVe),
      stem: String(stem),
      updated_at: String(updatedAt || new Date().toISOString()),
    })
    .eq('id', String(verbId));

  if (error) throw error;
}



export async function deleteUserVerbById(verbId: string) {
  const { error } = await getSupabase().from('verbs').delete().eq('id', verbId);
  if (error) throw error;
}

export async function getLearnerProgress() {
  const { data: users, error: userError } = await getSupabase().from('users').select('name, email');
  if (userError) throw userError;

  const { data: verbs, error: verbError } = await getSupabase().from('verbs').select('user_email, dictionary');
  if (verbError) throw verbError;

  const counts: Record<string, number> = {};
  (verbs || []).forEach((v: any) => {
    const email = (v.user_email || '').toLowerCase();
    if (email && (v.dictionary || '').trim()) {
      counts[email] = (counts[email] || 0) + 1;
    }
  });

  return (users || []).map((u: any) => {
    const email = (u.email || '').toLowerCase();
    return {
      name: u.name || email,
      email,
      count: counts[email] || 0,
    };
  });
}
