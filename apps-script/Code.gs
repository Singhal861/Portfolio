const VERB_HEADERS = ['S.No', 'Meaning', 'Dictionary', '~masu', '~mashita', '~masen', '~masen deshita', 'Short -ve (nai/anai)', 'Past short (ta/da)', 'Past short -ve', '~te', '~te-iru', '~te-imasu', '~te-imasu -ve', 'Stem', 'id', 'userEmail', 'createdAt', 'updatedAt'];
const USER_HEADERS = ['id', 'name', 'email', 'passwordHash', 'createdAt', 'verbSheetName'];
const STATS_HEADERS = ['email', 'name', 'verbCount', 'updatedAt'];

const TABS = {
  Users: USER_HEADERS,
  Verbs: VERB_HEADERS,
  UserStats: STATS_HEADERS,
};

const SAMPLE_VERB = ['1', 'to wait', 'まつ', 'まちます', 'まちました', 'まちません', 'まちませんでした', 'またない', 'まった', 'またなかった', 'まって', 'まっている', 'まっています', 'まっていません', 'まち'];

function doPost(event) {
  try {
    const body = JSON.parse(event.postData.contents || '{}');
    if (body.secret !== PropertiesService.getScriptProperties().getProperty('APP_SECRET')) {
      return json({ ok: false, error: 'Unauthorized' });
    }

    switch (body.action) {
      case 'ensure': ensureTabs_(); return json({ ok: true });
      case 'read': ensureTabs_(); return json({ ok: true, rows: readRows_(body.sheetName) });
      case 'readWithNumbers': ensureTabs_(); return json({ ok: true, rowNumbers: readRowsWithNumbers_(body.sheetName) });
      case 'append': ensureTabs_(); appendRows_(body.sheetName, body.rows); return json({ ok: true });
      case 'appendUser': ensureTabs_(); return json(appendUser_(body.row));
      case 'update': ensureTabs_(); updateRow_(body.sheetName, body.rowNumber, body.values); return json({ ok: true });
      case 'delete': ensureTabs_(); deleteRow_(body.sheetName, body.rowNumber); return json({ ok: true });
      case 'readUserVerbs': ensureTabs_(); return json({ ok: true, rows: readUserVerbs_(body.email) });
      case 'readUserVerbsWithNumbers': ensureTabs_(); return json({ ok: true, rowNumbers: readUserVerbsWithNumbers_(body.email) });
      case 'appendUserVerb': ensureTabs_(); appendUserVerb_(body.email, body.row); return json({ ok: true });
      case 'updateUserVerb': ensureTabs_(); updateUserVerb_(body.email, body.rowNumber, body.values); return json({ ok: true });
      case 'deleteUserVerb': ensureTabs_(); deleteUserVerb_(body.email, body.rowNumber); return json({ ok: true });
      case 'learnerProgress': ensureTabs_(); return json({ ok: true, rows: learnerProgress_() });
      default: return json({ ok: false, error: 'Unknown action.' });
    }
  } catch (error) {
    return json({ ok: false, error: error.message || 'Apps Script error.' });
  }
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function spreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID is not configured.');
  return SpreadsheetApp.openById(id);
}

function ensureTabs_() {
  const spreadsheet = spreadsheet_();
  Object.keys(TABS).forEach(function (name) {
    ensureSheet_(spreadsheet, name, TABS[name]);
  });
  assignMissingVerbSheets_();
}

function ensureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);

  const currentWidth = Math.max(sheet.getLastColumn(), headers.length);
  const current = sheet.getRange(1, 1, 1, currentWidth).getValues()[0];

  if (name === 'Users' && current.slice(0, 4).join(',') === 'id,email,passwordHash,createdAt') {
    const oldRows = sheet.getDataRange().getValues().slice(1).filter(function (row) { return row.some(Boolean); });
    const migratedRows = oldRows.map(function (row) {
      if (row[2] && String(row[2]).includes('@') && String(row[3]).indexOf('$2') === 0) {
        const user = { id: row[0] || '', name: row[1] || '', email: row[2] || '' };
        return [row[0] || '', row[1] || '', normalizeEmail_(row[2]), row[3] || '', row[4] || '', userVerbSheetName_(user)];
      }
      const user = { id: row[0] || '', name: '', email: row[1] || '' };
      return [row[0] || '', '', normalizeEmail_(row[1]), row[2] || '', row[3] || '', userVerbSheetName_(user)];
    });
    sheet.clearContents();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    if (migratedRows.length) sheet.getRange(2, 1, migratedRows.length, headers.length).setValues(migratedRows);
  } else if (current.slice(0, headers.length).join(',') !== headers.join(',')) {
    const oldHeaders = current;
    const oldRows = sheet.getDataRange().getValues().slice(1).filter(function (row) { return row.some(Boolean); });
    const migratedRows = oldRows.map(function (row) {
      const old = oldHeaders.reduce(function (result, header, index) { result[header] = row[index] || ''; return result; }, {});
      return headers.map(function (header) {
        if (name === 'Users' && header === 'verbSheetName') return old[header] || userVerbSheetName_(old);
        return old[header] || '';
      });
    });
    sheet.clearContents();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    if (migratedRows.length) sheet.getRange(2, 1, migratedRows.length, headers.length).setValues(migratedRows);
  }

  sheet.setFrozenRows(1);
  if (headers.length >= 19 && sheet.getLastColumn() >= 19) sheet.hideColumns(16, 4);
}

function normalizeEmail_(email) {
  return String(email || '').trim().toLowerCase();
}

function userVerbSheetName_(user) {
  const seed = String((user && (user.id || user.email)) || 'unknown').toLowerCase();
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, seed);
  const hex = digest.map(function (byte) {
    const value = (byte + 256) % 256;
    return ('0' + value.toString(16)).slice(-2);
  }).join('').slice(0, 12);
  return 'Verbs_' + hex;
}

function assignMissingVerbSheets_() {
  const sheet = spreadsheet_().getSheetByName('Users');
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return;
  const headers = values[0];
  const verbSheetIndex = headers.indexOf('verbSheetName');
  const idIndex = headers.indexOf('id');
  const emailIndex = headers.indexOf('email');
  const nameIndex = headers.indexOf('name');
  if (verbSheetIndex === -1 || emailIndex === -1) return;

  values.slice(1).forEach(function (row, index) {
    const email = normalizeEmail_(row[emailIndex]);
    if (!email) return;
    if (!row[verbSheetIndex]) {
      const user = { id: row[idIndex] || '', name: row[nameIndex] || '', email: email };
      sheet.getRange(index + 2, verbSheetIndex + 1).setValue(userVerbSheetName_(user));
    }
  });
}

function readRows_(name) {
  const sheet = spreadsheet_().getSheetByName(name);
  if (!sheet || sheet.getLastRow() === 0) return [];
  const values = sheet.getDataRange().getValues();
  if (!values.length) return [];
  const headers = values.shift();
  return values.filter(function (row) { return row.some(Boolean); }).map(function (row) {
    return headers.reduce(function (result, header, index) {
      result[header] = row[index] === undefined ? '' : String(row[index]);
      return result;
    }, {});
  });
}

function readRowsWithNumbers_(name) {
  const sheet = spreadsheet_().getSheetByName(name);
  if (!sheet || sheet.getLastRow() === 0) return [];
  const values = sheet.getDataRange().getValues();
  if (!values.length) return [];
  const headers = values.shift();
  return values.map(function (row, index) {
    return {
      rowNumber: index + 2,
      data: headers.reduce(function (result, header, column) {
        result[header] = row[column] === undefined ? '' : String(row[column]);
        return result;
      }, {}),
    };
  }).filter(function (item) { return Object.keys(item.data).some(function (key) { return item.data[key]; }); });
}

function appendRows_(name, rows) {
  const sheet = spreadsheet_().getSheetByName(name);
  if (rows.length) sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function appendUser_(row) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const users = readRows_('Users');
    const email = normalizeEmail_(row[2]);
    if (users.some(function (user) { return normalizeEmail_(user.email) === email; })) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    const user = { id: row[0], name: row[1], email: email };
    const verbSheetName = userVerbSheetName_(user);
    appendRows_('Users', [[row[0], row[1], email, row[3], row[4], verbSheetName]]);
    ensureUserVerbSheet_(email);
    upsertUserStats_(email);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function findUser_(email) {
  const normalized = normalizeEmail_(email);
  const rows = readRowsWithNumbers_('Users');
  const match = rows.find(function (item) { return normalizeEmail_(item.data.email) === normalized; });
  if (!match) throw new Error('User not found.');
  return match;
}

function ensureUserVerbSheet_(email) {
  const spreadsheet = spreadsheet_();
  const userItem = findUser_(email);
  const user = userItem.data;
  let sheetName = user.verbSheetName || userVerbSheetName_(user);
  if (!user.verbSheetName) {
    spreadsheet.getSheetByName('Users').getRange(userItem.rowNumber, USER_HEADERS.indexOf('verbSheetName') + 1).setValue(sheetName);
  }

  let sheet = spreadsheet.getSheetByName(sheetName);
  const existed = Boolean(sheet);
  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);
  ensureSheet_(spreadsheet, sheetName, VERB_HEADERS);

  const currentRows = readRows_(sheetName);
  if (!existed || currentRows.length === 0) {
    const legacyRows = readRows_('Verbs').filter(function (row) { return normalizeEmail_(row.userEmail) === normalizeEmail_(email); });
    if (legacyRows.length) {
      const rows = dedupeVerbRows_(legacyRows).map(function (row, index) {
        row['S.No'] = String(index + 1);
        row.userEmail = normalizeEmail_(email);
        return VERB_HEADERS.map(function (header) { return row[header] || ''; });
      });
      if (rows.length) appendRows_(sheetName, rows);
    }
  }

  ensureSampleRow_(sheetName, user);
  renumberVerbSheet_(sheetName);
  return sheetName;
}

function dedupeVerbRows_(rows) {
  const seen = {};
  return rows.filter(function (row) {
    const key = row.id || [row.Meaning, row.Dictionary, row['~masu'], row.Stem].join('|');
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });
}

function ensureSampleRow_(sheetName, user) {
  const rows = readRows_(sheetName);
  const hasSample = rows.some(function (row) { return isSampleRow_(row); });
  if (hasSample) return;
  const now = new Date().toISOString();
  appendRows_(sheetName, [[
    1,
    SAMPLE_VERB[1], SAMPLE_VERB[2], SAMPLE_VERB[3], SAMPLE_VERB[4], SAMPLE_VERB[5], SAMPLE_VERB[6], SAMPLE_VERB[7], SAMPLE_VERB[8], SAMPLE_VERB[9], SAMPLE_VERB[10], SAMPLE_VERB[11], SAMPLE_VERB[12], SAMPLE_VERB[13], SAMPLE_VERB[14],
    'verb_sample_' + (user.id || normalizeEmail_(user.email).replace(/[^a-zA-Z0-9]/g, '_')),
    normalizeEmail_(user.email),
    now,
    now,
  ]]);
}

function isSampleRow_(row) {
  return String(row.id || '').indexOf('verb_sample_') === 0 || (String(row['S.No'] || '') === '1' && row.Meaning === 'to wait' && row.Dictionary === 'まつ');
}

function renumberVerbSheet_(sheetName) {
  const items = readRowsWithNumbers_(sheetName);
  items.forEach(function (item, index) {
    if (String(item.data['S.No']) !== String(index + 1)) {
      spreadsheet_().getSheetByName(sheetName).getRange(item.rowNumber, 1).setValue(index + 1);
    }
  });
}

function readUserVerbs_(email) {
  const sheetName = ensureUserVerbSheet_(email);
  upsertUserStats_(email);
  return readRows_(sheetName);
}

function readUserVerbsWithNumbers_(email) {
  const sheetName = ensureUserVerbSheet_(email);
  upsertUserStats_(email);
  return readRowsWithNumbers_(sheetName);
}

function appendUserVerb_(email, row) {
  const sheetName = ensureUserVerbSheet_(email);
  appendRows_(sheetName, [row]);
  renumberVerbSheet_(sheetName);
  upsertUserStats_(email);
}

function updateUserVerb_(email, rowNumber, values) {
  const sheetName = ensureUserVerbSheet_(email);
  updateRow_(sheetName, rowNumber, values);
  renumberVerbSheet_(sheetName);
  upsertUserStats_(email);
}

function deleteUserVerb_(email, rowNumber) {
  const sheetName = ensureUserVerbSheet_(email);
  deleteRow_(sheetName, rowNumber);
  renumberVerbSheet_(sheetName);
  upsertUserStats_(email);
}

function updateRow_(name, rowNumber, values) {
  spreadsheet_().getSheetByName(name).getRange(rowNumber, 1, 1, values.length).setValues([values]);
}

function deleteRow_(name, rowNumber) {
  spreadsheet_().getSheetByName(name).deleteRow(rowNumber);
}

function upsertUserStats_(email) {
  const user = findUser_(email).data;
  const rows = readRows_(ensureUserVerbSheet_(email));
  const count = rows.filter(function (row) { return String(row.Dictionary || '').trim(); }).length;
  const statsSheet = spreadsheet_().getSheetByName('UserStats');
  const stats = readRowsWithNumbers_('UserStats');
  const existing = stats.find(function (item) { return normalizeEmail_(item.data.email) === normalizeEmail_(email); });
  const values = [normalizeEmail_(email), user.name || normalizeEmail_(email), count, new Date().toISOString()];
  if (existing) updateRow_('UserStats', existing.rowNumber, values);
  else statsSheet.getRange(statsSheet.getLastRow() + 1, 1, 1, values.length).setValues([values]);
}

function learnerProgress_() {
  const users = readRows_('Users');
  return users.filter(function (user) { return normalizeEmail_(user.email); }).map(function (user) {
    upsertUserStats_(user.email);
    const stat = readRows_('UserStats').find(function (row) { return normalizeEmail_(row.email) === normalizeEmail_(user.email); });
    return {
      name: user.name || normalizeEmail_(user.email),
      email: normalizeEmail_(user.email),
      count: Number((stat && stat.verbCount) || 0),
    };
  });
}
