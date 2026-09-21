const TABS = {
  Users: ['id', 'name', 'email', 'passwordHash', 'createdAt'],
  Verbs: ['S.No', 'Meaning', 'Dictionary', '~masu', '~mashita', '~masen', '~masen deshita', 'Short -ve (nai/anai)', 'Past short (ta/da)', 'Past short -ve', '~te', '~te-iru', '~te-imasu', '~te-imasu -ve', 'Stem', 'id', 'userEmail', 'createdAt', 'updatedAt'],
};

function doPost(event) {
  try {
    const body = JSON.parse(event.postData.contents || '{}');
    if (body.secret !== PropertiesService.getScriptProperties().getProperty('APP_SECRET')) {
      return json({ ok: false, error: 'Unauthorized' });
    }

    switch (body.action) {
      case 'ensure': ensureTabs_(); return json({ ok: true });
      case 'read': return json({ ok: true, rows: readRows_(body.sheetName) });
      case 'readWithNumbers': return json({ ok: true, rowNumbers: readRowsWithNumbers_(body.sheetName) });
      case 'append': appendRows_(body.sheetName, body.rows); return json({ ok: true });
      case 'appendUser': return json(appendUser_(body.row));
      case 'update': updateRow_(body.sheetName, body.rowNumber, body.values); return json({ ok: true });
      case 'delete': deleteRow_(body.sheetName, body.rowNumber); return json({ ok: true });
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
    let sheet = spreadsheet.getSheetByName(name);
    if (!sheet) sheet = spreadsheet.insertSheet(name);
    const headers = TABS[name];
    const currentWidth = Math.max(sheet.getLastColumn(), headers.length);
    const current = sheet.getRange(1, 1, 1, currentWidth).getValues()[0];
    if (name === 'Users' && current.slice(0, 4).join(',') === 'id,email,passwordHash,createdAt') {
      const oldRows = sheet.getDataRange().getValues().slice(1).filter(function (row) { return row.some(Boolean); });
      const migratedRows = oldRows.map(function (row) {
        // Recover rows written by the newer app before this tab was migrated.
        if (row[2] && String(row[2]).includes('@') && String(row[3]).indexOf('$2') === 0) {
          return [row[0] || '', row[1] || '', row[2] || '', row[3] || '', row[4] || ''];
        }
        return [row[0] || '', '', row[1] || '', row[2] || '', row[3] || ''];
      });
      sheet.clearContents();
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      if (migratedRows.length) sheet.getRange(2, 1, migratedRows.length, headers.length).setValues(migratedRows);
    } else if (current.slice(0, headers.length).join(',') !== headers.join(',')) {
      const oldHeaders = current;
      const oldRows = sheet.getDataRange().getValues().slice(1).filter(function (row) { return row.some(Boolean); });
      const migratedRows = oldRows.map(function (row) {
        const old = oldHeaders.reduce(function (result, header, index) { result[header] = row[index] || ''; return result; }, {});
        return headers.map(function (header) { return old[header] || ''; });
      });
      sheet.clearContents();
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      if (migratedRows.length) sheet.getRange(2, 1, migratedRows.length, headers.length).setValues(migratedRows);
    }
    sheet.setFrozenRows(1);
    if (name === 'Verbs') sheet.hideColumns(16, 4);
  });
  seedMissingUserSamples_();
}

function seedMissingUserSamples_() {
  const users = readRows_('Users');
  const verbs = readRows_('Verbs');
  const existingSamples = verbs.reduce(function (result, verb) {
    if (String(verb.id || '').indexOf('verb_sample_') === 0) {
      result[String(verb.userEmail || '').toLowerCase()] = true;
    }
    return result;
  }, {});
  const now = new Date().toISOString();
  users.forEach(function (user) {
    const email = String(user.email || '').toLowerCase();
    if (email && !existingSamples[email]) {
      appendRows_('Verbs', [[1, 'to wait', 'まつ', 'まちます', 'まちました', 'まちません', 'まちませんでした', 'またない', 'まった', 'またなかった', 'まって', 'まっている', 'まっています', 'まっていません', 'まち', 'verb_sample_' + user.id, email, now, now]]);
    }
  });
}

function readRows_(name) {
  const values = spreadsheet_().getSheetByName(name).getDataRange().getValues();
  if (!values.length) return [];
  const headers = values.shift();
  return values.map(function (row) {
    return headers.reduce(function (result, header, index) {
      result[header] = row[index] === undefined ? '' : String(row[index]);
      return result;
    }, {});
  });
}

function readRowsWithNumbers_(name) {
  const sheet = spreadsheet_().getSheetByName(name);
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
  });
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
    const email = String(row[2] || '').toLowerCase();
    if (users.some(function (user) { return String(user.email || '').toLowerCase() === email; })) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    appendRows_('Users', [row]);
    const now = new Date().toISOString();
    appendRows_('Verbs', [[1, 'to wait', 'まつ', 'まちます', 'まちました', 'まちません', 'まちませんでした', 'またない', 'まった', 'またなかった', 'まって', 'まっている', 'まっています', 'まっていません', 'まち', 'verb_sample_' + row[0], email, now, now]]);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function updateRow_(name, rowNumber, values) {
  spreadsheet_().getSheetByName(name).getRange(rowNumber, 1, 1, values.length).setValues([values]);
}

function deleteRow_(name, rowNumber) {
  spreadsheet_().getSheetByName(name).deleteRow(rowNumber);
}
