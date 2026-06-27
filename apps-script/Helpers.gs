function getSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  let isNew = false;
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    isNew = true;
  }
  
  // Check if sheet is empty (only has A1 with blank, or completely empty)
  const data = sheet.getDataRange().getValues();
  if (isNew || (data.length === 1 && data[0].join('') === '')) {
    if(sheetName === 'tb_transactions') {
      sheet.appendRow(['id', 'user_id', 'tx_date', 'tx_type', 'category_id', 'account_src_id', 'account_dst_id', 'amount', 'note', 'attachment_url', 'created_at', 'is_recurring', 'recurring_interval']);
    } else if (sheetName === 'tb_accounts') {
      sheet.appendRow(['id', 'user_id', 'account_name', 'account_type', 'initial_balance', 'color_hex', 'icon_name']);
    } else if (sheetName === 'tb_categories') {
      sheet.appendRow(['id', 'user_id', 'category_type', 'name', 'color_hex', 'icon_name']);
    } else if (sheetName === 'tb_budgets') {
      sheet.appendRow(['id', 'user_id', 'category_id', 'name', 'limit', 'color', 'created_at']);
    } else if (sheetName === 'tb_debts') {
      sheet.appendRow(['id', 'user_id', 'type', 'name', 'amount', 'due', 'status', 'created_at']);
    } else if (sheetName === 'tb_goals') {
      sheet.appendRow(['id', 'user_id', 'name', 'target_amount', 'current_amount', 'deadline', 'color_hex', 'icon_name', 'status', 'created_at']);
    } else if (sheetName === 'tb_schedules') {
      sheet.appendRow(['id', 'user_id', 'title', 'amount', 'due_date', 'status', 'note', 'created_at']);
    } else if (sheetName === 'tb_users') {
      sheet.appendRow(['user_id', 'email', 'name', 'avatar_url', 'password_hash', 'session_token', 'created_at']);
    }
  }
  return sheet;
}


function getRowsData(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    rows.push(obj);
  }
  return rows;
}


function generateUUID() {
  return Utilities.getUuid();
}


function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>"'/]/g, function (match) {
    const map = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;' };
    return map[match];
  });
}


function getUserIdFromToken(authToken) {
  if (!authToken) return null;
  const sheet = getSheet("tb_users");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;
  const headers = data[0];
  const idCol = headers.indexOf("user_id");
  const sessionCol = headers.indexOf("session_token");
  
  if (idCol === -1) return null;

  for (let i = 1; i < data.length; i++) {
    if (sessionCol !== -1 && String(data[i][sessionCol]) === String(authToken)) {
      return data[i][idCol];
    }
    // Backward compatibility for existing logged-in users during transition
    if (String(data[i][idCol]) === String(authToken)) {
      return data[i][idCol];
    }
  }
  return null;
}


function setupPermissions() {
  const folder = DriveApp.getFolderById("1PqRyiJvp2xdCPe92N3ngHraecMjqyTs3");
  const dummyFile = folder.createFile("test_permission.txt", "dummy", MimeType.PLAIN_TEXT);
  dummyFile.setTrashed(true);
  Logger.log("Izin Google Drive penuh (Full Access) berhasil didapatkan!");
}


function createSuccessResponse(statusCode, message, data) {
  return { status: "success", statusCode: statusCode, message: message, data: data };
}


function createErrorResponse(statusCode, message) {
  return { status: "error", statusCode: statusCode, message: message, data: null };
}

function mapIdField(rows) {
  if (!rows || rows.length === 0) return [];
  return rows.map(row => {
    const newRow = { ...row };
    if (newRow.id) return newRow;
    
    const keys = Object.keys(row);
    if (keys.length > 0 && keys[0].endsWith('_id')) {
        newRow.id = row[keys[0]];
    } else {
        // explicit check for known primary keys if first column is not the primary key
        if (newRow.category_id && !newRow.tx_type && !newRow.budget_name && !newRow.account_src_id) newRow.id = newRow.category_id;
        else if (newRow.budget_id) newRow.id = newRow.budget_id;
        else if (newRow.account_id) newRow.id = newRow.account_id;
        else if (newRow.debt_id) newRow.id = newRow.debt_id;
        else if (newRow.goal_id) newRow.id = newRow.goal_id;
        else if (newRow.transaction_id) newRow.id = newRow.transaction_id;
    }
    
    return newRow;
  });
}
