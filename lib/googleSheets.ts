import { env } from './env';

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

type AppsScriptResponse = {
  ok?: boolean;
  error?: string;
  rows?: Record<string, string>[];
  rowNumbers?: { rowNumber: number; data: Record<string, string> }[];
};

async function callAppsScript(action: string, payload: Record<string, unknown> = {}) {
  if (!env.appsScriptUrl || !env.appsScriptSecret) {
    throw new Error('Google Apps Script is not configured.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(env.appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.appsScriptSecret, action, ...payload }),
      cache: 'no-store',
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const rawText = await response.text();
    let result: AppsScriptResponse;
    try {
      result = JSON.parse(rawText) as AppsScriptResponse;
    } catch {
      throw new Error(
        `Google Apps Script response error (${response.status}). Ensure the web app is deployed with access set to Anyone.`
      );
    }

    if (!response.ok || result.ok === false) {
      throw new Error(result.error || 'Google Apps Script request failed.');
    }
    return result;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
}

export async function ensureSheetTabs() {
  await callAppsScript('ensure');
}

export async function readRows(sheetName: string) {
  const result = await callAppsScript('read', { sheetName });
  return result.rows || [];
}

export async function readRowsWithNumbers(sheetName: string) {
  const result = await callAppsScript('readWithNumbers', { sheetName });
  return result.rowNumbers || [];
}

export async function appendRows(sheetName: string, rows: (string | number)[][]) {
  await callAppsScript('append', { sheetName, rows });
}

export async function appendUser(row: string[]) {
  await callAppsScript('appendUser', { row });
}

export async function readUserVerbs(email: string) {
  const result = await callAppsScript('readUserVerbs', { email });
  return result.rows || [];
}

export async function readUserVerbsWithNumbers(email: string) {
  const result = await callAppsScript('readUserVerbsWithNumbers', { email });
  return result.rowNumbers || [];
}

export async function appendUserVerb(email: string, row: (string | number)[]) {
  await callAppsScript('appendUserVerb', { email, row });
}

export async function updateUserVerb(email: string, rowNumber: number, values: (string | number)[]) {
  await callAppsScript('updateUserVerb', { email, rowNumber, values });
}

export async function deleteUserVerb(email: string, rowNumber: number) {
  await callAppsScript('deleteUserVerb', { email, rowNumber });
}

export async function getLearnerProgress() {
  const result = await callAppsScript('learnerProgress');
  return result.rows || [];
}

