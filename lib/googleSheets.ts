import { env } from './env';

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

  const response = await fetch(env.appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: env.appsScriptSecret, action, ...payload }),
    cache: 'no-store',
  });
  const result = (await response.json()) as AppsScriptResponse;
  if (!response.ok || result.ok === false) throw new Error(result.error || 'Google Apps Script request failed.');
  return result;
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

export async function appendRows(sheetName: string, rows: string[][]) {
  await callAppsScript('append', { sheetName, rows });
}

export async function updateRow(sheetName: string, rowNumber: number, values: string[]) {
  await callAppsScript('update', { sheetName, rowNumber, values });
}

export async function deleteRow(sheetName: string, rowNumber: number) {
  await callAppsScript('delete', { sheetName, rowNumber });
}
