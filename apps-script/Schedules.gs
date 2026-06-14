function handleGetSchedules(authToken) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");

  const sheet = getSheet('tb_schedules');
  const result = getRowsData(sheet).filter(row => String(row.user_id) === String(userId));

  return createSuccessResponse(200, "Schedules retrieved successfully", result);
}


function handleCreateSchedule(authToken, payload) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");

  const sheet = getSheet('tb_schedules');
  const newId = 'SCH-' + generateUUID().substring(0,8);
  const now = new Date().toISOString();
  
  const headers = sheet.getDataRange().getValues()[0];
  const newRow = new Array(headers.length).fill('');
  
  headers.forEach((h, index) => {
    const header = String(h).toLowerCase().trim();
    if (header === 'id') newRow[index] = newId;
    else if (header === 'user_id') newRow[index] = userId;
    else if (header === 'title') newRow[index] = sanitizeInput(payload.title) || '';
    else if (header === 'amount') newRow[index] = payload.amount || 0;
    else if (header === 'due_date') newRow[index] = payload.due_date || '';
    else if (header === 'status') newRow[index] = sanitizeInput(payload.status) || 'Pending';
    else if (header === 'note') newRow[index] = sanitizeInput(payload.note) || '';
    else if (header === 'created_at') newRow[index] = now;
  });

  sheet.appendRow(newRow);
  return createSuccessResponse(201, "Schedule created", { ...payload, id: newId, status: payload.status || 'Pending' });
}


function handleUpdateSchedule(authToken, payload) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  if (!payload.id) return createErrorResponse(400, "Missing schedule id");

  const sheet = getSheet('tb_schedules');
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).toLowerCase().trim());
  const idColIndex = headers.indexOf('id');
  const userColIndex = headers.indexOf('user_id');

  if (idColIndex === -1 || userColIndex === -1) return createErrorResponse(500, "Database error");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex]) === String(payload.id) && String(data[i][userColIndex]) === String(userId)) {
      headers.forEach((header, index) => {
        if (payload[header] !== undefined && header !== 'id' && header !== 'user_id' && header !== 'created_at') {
          sheet.getRange(i + 1, index + 1).setValue(payload[header]);
        }
      });
      return createSuccessResponse(200, "Schedule updated successfully", payload);
    }
  }
  return createErrorResponse(404, "Schedule not found");
}


function handleDeleteSchedule(authToken, payload) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  if (!payload.id) return createErrorResponse(400, "Missing schedule id");

  const sheet = getSheet('tb_schedules');
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).toLowerCase().trim());
  const idColIndex = headers.indexOf('id');
  const userColIndex = headers.indexOf('user_id');

  if (idColIndex === -1 || userColIndex === -1) return createErrorResponse(500, "Database error");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex]) === String(payload.id) && String(data[i][userColIndex]) === String(userId)) {
      sheet.deleteRow(i + 1);
      return createSuccessResponse(200, "Schedule deleted successfully");
    }
  }
  return createErrorResponse(404, "Schedule not found");
}


function testCreateSchedule() {
  // Ambil token pertama dari tabel tb_users agar valid
  const userSheet = getSheet("tb_users");
  const userData = userSheet.getDataRange().getValues();
  if (userData.length <= 1) {
    Logger.log("ERROR: tb_users kosong, buat user dulu dari React App (login/register).");
    return;
  }
  
  const token = userData[1][5]; // Asumsi kolom F (index 5) adalah auth_token
  
  const payload = {
    title: "TEST DARI EDITOR",
    amount: 150000,
    due_date: "2026-06-20",
    status: "Pending",
    note: "Ini adalah data test"
  };
  
  const result = handleCreateSchedule(token, payload);
  Logger.log("HASIL TEST CREATE SCHEDULE: " + JSON.stringify(result));
}


