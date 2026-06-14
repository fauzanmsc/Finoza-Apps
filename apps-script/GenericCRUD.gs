function handleGenericUpdate(sheetName, idValue, payload, authToken) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return createErrorResponse(404, "Record not found");
  
  const headers = data[0];
  // Find ID column: first check for 'id', then find primary key column (ends with _id but NOT user_id or category_id)
  let idColIndex = headers.indexOf('id');
  if (idColIndex === -1) {
    idColIndex = headers.findIndex(h => String(h).endsWith('_id') && h !== 'user_id' && h !== 'category_id' && h !== 'account_src_id' && h !== 'account_dst_id');
  }
  const userIdColIndex = headers.indexOf("user_id");
  
  if (idColIndex === -1) return createErrorResponse(500, "ID column not found");

  // Field name mapping: frontend field -> possible database column names
  const fieldAliases = {
    'name': ['name', 'person_name', 'budget_name', 'account_name'],
    'type': ['type', 'debt_type'],
    'due': ['due', 'due_date'],
    'limit': ['limit', 'amount_limit', 'amount'],
    'person_name': ['person_name', 'name'],
    'debt_type': ['debt_type', 'type'],
    'due_date': ['due_date', 'due']
  };

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex]) === String(idValue) && String(data[i][userIdColIndex]) === String(userId)) {
      let rowData = data[i];
      for (let key in payload) {
        let colIndex = headers.indexOf(key);
        // If direct match not found, try aliases
        if (colIndex === -1 && fieldAliases[key]) {
          for (let alias of fieldAliases[key]) {
            colIndex = headers.indexOf(alias);
            if (colIndex !== -1) break;
          }
        }
        if (colIndex !== -1) {
          rowData[colIndex] = payload[key];
        }
      }
      sheet.getRange(i + 1, 1, 1, rowData.length).setValues([rowData]);
      return createSuccessResponse(200, "Update successful", payload);
    }
  }
  return createErrorResponse(404, "Record not found");
}


function handleGenericDelete(sheetName, idValue, authToken) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return createErrorResponse(404, "Record not found");

  const headers = data[0];
  let idColIndex = headers.indexOf('id');
  if (idColIndex === -1) {
    idColIndex = headers.findIndex(h => String(h).endsWith('_id') && h !== 'user_id' && h !== 'category_id' && h !== 'account_src_id' && h !== 'account_dst_id');
  }
  const userIdColIndex = headers.indexOf("user_id");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex]) === String(idValue) && String(data[i][userIdColIndex]) === String(userId)) {
      sheet.deleteRow(i + 1);
      return createSuccessResponse(200, "Delete successful", {});
    }
  }
  return createErrorResponse(404, "Record not found");
}


