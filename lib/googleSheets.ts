import { google } from 'googleapis';
import { env } from './env';

function getAuthClient() {
  if (!env.serviceAccountEmail || !env.serviceAccountPrivateKey) {
    return null;
  }

  return new google.auth.JWT({
    email: env.serviceAccountEmail,
    key: env.serviceAccountPrivateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function getSheetsClient() {
  const auth = getAuthClient();
  if (!auth) {
    return null;
  }

  return google.sheets({ version: 'v4', auth });
}

export async function ensureSheetTabs() {
  const sheets = await getSheetsClient();
  if (!sheets || !env.spreadsheetId) {
    throw new Error('Google Sheets is not configured.');
  }

  const response = await sheets.spreadsheets.get({ spreadsheetId: env.spreadsheetId });
  const existing = new Map((response.data.sheets || []).map((sheet) => [sheet.properties?.title, sheet.properties?.sheetId]));

  const definitions: Record<string, string[]> = {
    Users: ['id', 'email', 'passwordHash', 'createdAt'],
    Verbs: ['id', 'userEmail', 'kanji', 'reading', 'meaning', 'masuForm', 'dictionaryForm', 'teForm', 'notes', 'createdAt', 'updatedAt'],
  };

  for (const [tabName, headers] of Object.entries(definitions)) {
    if (!existing.has(tabName)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: env.spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: tabName,
                  gridProperties: { frozenRowCount: 1 },
                },
              },
            },
          ],
        },
      });
    }

    const current = await sheets.spreadsheets.values.get({
      spreadsheetId: env.spreadsheetId,
      range: `${tabName}!A1:Z1`,
    });

    const firstRow = current.data.values?.[0] || [];
    if (firstRow.length === 0 || firstRow.join(',') !== headers.join(',')) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: env.spreadsheetId,
        range: `${tabName}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [headers] },
      });
    }
  }
}

export async function readRows(sheetName: string) {
  const sheets = await getSheetsClient();
  if (!sheets || !env.spreadsheetId) {
    return [];
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.spreadsheetId,
    range: `${sheetName}!A:Z`,
  });

  const rows = response.data.values || [];
  if (!rows.length) return [];

  const [headers, ...data] = rows;
  return data.map((row) => Object.fromEntries(headers.map((header, idx) => [header, row[idx] || ''])));
}

export async function readRowsWithNumbers(sheetName: string) {
  const sheets = await getSheetsClient();
  if (!sheets || !env.spreadsheetId) return [];

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.spreadsheetId,
    range: `${sheetName}!A:Z`,
  });
  const rows = response.data.values || [];
  if (!rows.length) return [];

  const [headers, ...data] = rows;
  return data.map((row, index) => ({
    rowNumber: index + 2,
    data: Object.fromEntries(headers.map((header, idx) => [header, row[idx] || ''])),
  }));
}

export async function appendRows(sheetName: string, rows: string[][]) {
  const sheets = await getSheetsClient();
  if (!sheets || !env.spreadsheetId) {
    throw new Error('Google Sheets is not configured.');
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: env.spreadsheetId,
    range: `${sheetName}!A:Z`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows },
  });
}

export async function updateRow(sheetName: string, rowNumber: number, values: string[]) {
  const sheets = await getSheetsClient();
  if (!sheets || !env.spreadsheetId) throw new Error('Google Sheets is not configured.');

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.spreadsheetId,
    range: `${sheetName}!A${rowNumber}:Z${rowNumber}`,
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  });
}

export async function deleteRow(sheetName: string, rowNumber: number) {
  const sheets = await getSheetsClient();
  if (!sheets || !env.spreadsheetId) throw new Error('Google Sheets is not configured.');

  const response = await sheets.spreadsheets.get({ spreadsheetId: env.spreadsheetId });
  const sheetId = response.data.sheets?.find((sheet) => sheet.properties?.title === sheetName)?.properties?.sheetId;
  if (sheetId === undefined) throw new Error(`Sheet tab ${sheetName} does not exist.`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: env.spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: rowNumber - 1, endIndex: rowNumber },
        },
      }],
    },
  });
}
