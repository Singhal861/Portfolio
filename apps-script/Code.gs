const TABS = {
  Users: ['id', 'email', 'passwordHash', 'createdAt'],
  Verbs: ['id', 'userEmail', 'kanji', 'reading', 'meaning', 'masuForm', 'dictionaryForm', 'teForm', 'notes', 'createdAt', 'updatedAt'],
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
    const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    if (current.join(',') !== headers.join(',')) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
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

function updateRow_(name, rowNumber, values) {
  spreadsheet_().getSheetByName(name).getRange(rowNumber, 1, 1, values.length).setValues([values]);
}

function deleteRow_(name, rowNumber) {
  spreadsheet_().getSheetByName(name).deleteRow(rowNumber);
}
