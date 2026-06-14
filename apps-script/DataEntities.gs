function handleGetTransactions(authToken) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  const sheet = getSheet("tb_transactions");
  const txs = getRowsData(sheet).filter(r => String(r.user_id) === String(userId));
  return createSuccessResponse(200, "Transactions retrieved", mapIdField(txs).reverse());
}


function handleCreateTransaction(authToken, payload) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  const sheet = getSheet("tb_transactions");
  const txId = 'TX-' + generateUUID().substring(0,8);
  const now = new Date().toISOString();
  
  sheet.appendRow([
    txId, userId, payload.tx_date || now, sanitizeInput(payload.tx_type), sanitizeInput(payload.category_id) || '',
    sanitizeInput(payload.account_src_id), sanitizeInput(payload.account_dst_id) || '', payload.amount, sanitizeInput(payload.note) || '', '', now,
    payload.is_recurring ? 'TRUE' : 'FALSE', sanitizeInput(payload.recurring_interval) || ''
  ]);

  // Update Account Balances
  const accSheet = getSheet("tb_accounts");
  const accData = accSheet.getDataRange().getValues();
  if (accData.length > 1) {
    const accHeaders = accData[0];
    const idCol = accHeaders.indexOf("id") !== -1 ? accHeaders.indexOf("id") : accHeaders.indexOf("account_id");
    const balCol = accHeaders.indexOf("initial_balance");
    
    if (idCol !== -1 && balCol !== -1) {
      for (let i = 1; i < accData.length; i++) {
        let isUpdated = false;
        if (String(accData[i][idCol]) === String(payload.account_src_id)) {
          if (payload.tx_type === 'Expense' || payload.tx_type === 'Transfer') {
            accData[i][balCol] = Number(accData[i][balCol]) - Number(payload.amount);
            isUpdated = true;
          } else if (payload.tx_type === 'Income') {
            accData[i][balCol] = Number(accData[i][balCol]) + Number(payload.amount);
            isUpdated = true;
          }
        } else if (String(accData[i][idCol]) === String(payload.account_dst_id) && payload.tx_type === 'Transfer') {
          accData[i][balCol] = Number(accData[i][balCol]) + Number(payload.amount);
          isUpdated = true;
        }
        if (isUpdated) {
          accSheet.getRange(i + 1, balCol + 1).setValue(accData[i][balCol]);
        }
      }
    }
  }

  return createSuccessResponse(201, "Transaction created", { ...payload, id: txId });
}


function handleGetAccounts(authToken) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  const sheet = getSheet("tb_accounts");
  return createSuccessResponse(200, "Accounts retrieved", mapIdField(getRowsData(sheet).filter(r => String(r.user_id) === String(userId))));
}


function handleCreateAccount(authToken, payload) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  const sheet = getSheet("tb_accounts");
  const newId = 'ACC-' + generateUUID().substring(0,8);
  sheet.appendRow([
    newId, userId, sanitizeInput(payload.account_name) || 'Tunai', sanitizeInput(payload.account_type) || 'Cash', 
    payload.initial_balance || 0, payload.color_hex || '#1E3A8A', payload.icon_name || 'Banknote'
  ]);
  return createSuccessResponse(201, "Account created", { ...payload, id: newId });
}


function handleGetBudgets(authToken) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  const sheet = getSheet("tb_budgets");
  const budgets = mapIdField(getRowsData(sheet).filter(r => String(r.user_id) === String(userId)));
  
  const txSheet = getSheet("tb_transactions");
  const txs = getRowsData(txSheet).filter(r => String(r.user_id) === String(userId) && r.tx_type === 'Expense');
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  budgets.forEach(b => {
    let used = 0;
    txs.forEach(tx => {
      const txDate = new Date(tx.tx_date);
      if (txDate.getMonth() + 1 === currentMonth && txDate.getFullYear() === currentYear) {
        if ((b.category_id && tx.category_id === b.category_id) || 
            (b.name && (tx.note || '').toLowerCase().includes(b.name.toLowerCase()))) {
          used += Number(tx.amount) || 0;
        }
      }
    });
    b.used = used;
  });
  
  return createSuccessResponse(200, "Budgets retrieved", budgets);
}


function handleCreateBudget(authToken, payload) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  const sheet = getSheet("tb_budgets");
  const newId = 'BDG-' + generateUUID().substring(0,8);
  const now = new Date().toISOString();
  
  const headers = sheet.getDataRange().getValues()[0];
  if (!headers || headers.length === 0) {
    return createErrorResponse(500, "Sheet is empty or missing headers");
  }

  const newRow = new Array(headers.length).fill('');
  
  headers.forEach((h, index) => {
    const header = String(h).toLowerCase().trim();
    if (header === 'id' || header === 'budget_id') newRow[index] = newId;
    else if (header === 'user_id') newRow[index] = userId;
    else if (header === 'category_id') newRow[index] = sanitizeInput(payload.category_id) || '';
    else if (header === 'month') newRow[index] = payload.month || new Date().getMonth() + 1;
    else if (header === 'year') newRow[index] = payload.year || new Date().getFullYear();
    else if (header === 'amount' || header === 'limit' || header === 'amount_limit') newRow[index] = payload.limit || payload.amount || 0;
    else if (header === 'name' || header === 'budget_name') newRow[index] = sanitizeInput(payload.name) || '';
    else if (header === 'color' || header === 'color_hex') newRow[index] = sanitizeInput(payload.color) || 'bg-[var(--color-stabilo)]';
    else if (header === 'created_at') newRow[index] = now;
  });

  sheet.appendRow(newRow);
  return createSuccessResponse(201, "Budget created", { ...payload, id: newId });
}


function handleGetDebts(authToken) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  const sheet = getSheet("tb_debts");
  const rawDebts = mapIdField(getRowsData(sheet).filter(r => String(r.user_id) === String(userId)));
  
  // Normalize field names: database columns -> frontend expected fields
  const debts = rawDebts.map(d => ({
    ...d,
    name: d.name || d.person_name || '',
    type: d.type || d.debt_type || '',
    due: d.due || d.due_date || '',
    amount: Number(d.amount) || 0,
    status: d.status || 'Active'
  }));
  
  return createSuccessResponse(200, "Debts retrieved", debts);
}


function handleCreateDebt(authToken, payload) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  const sheet = getSheet("tb_debts");
  const newId = 'DBT-' + generateUUID().substring(0,8);
  const now = new Date().toISOString();
  
  const headers = sheet.getDataRange().getValues()[0];
  const newRow = new Array(headers.length).fill('');
  
  headers.forEach((h, index) => {
    const header = String(h).toLowerCase().trim();
    if (header === 'id' || header === 'debt_id') newRow[index] = newId;
    else if (header === 'user_id') newRow[index] = userId;
    else if (header === 'type' || header === 'debt_type') newRow[index] = sanitizeInput(payload.type) || 'Hutang';
    else if (header === 'name' || header === 'person_name') newRow[index] = sanitizeInput(payload.name) || '';
    else if (header === 'amount') newRow[index] = payload.amount || 0;
    else if (header === 'due' || header === 'due_date') newRow[index] = payload.due || now;
    else if (header === 'status') newRow[index] = 'Active';
    else if (header === 'created_at') newRow[index] = now;
  });

  sheet.appendRow(newRow);
  return createSuccessResponse(201, "Debt created", { ...payload, id: newId });
}


function handleGetCategories(authToken) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  const sheet = getSheet("tb_categories");
  return createSuccessResponse(200, "Categories retrieved", mapIdField(getRowsData(sheet).filter(r => String(r.user_id) === String(userId))));
}


function handleCreateCategory(authToken, payload) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  const sheet = getSheet("tb_categories");
  const newId = 'CAT-' + generateUUID().substring(0,8);
  sheet.appendRow([
    newId, userId, sanitizeInput(payload.category_type) || 'Expense', sanitizeInput(payload.name) || '', sanitizeInput(payload.color_hex) || '#F43F5E', sanitizeInput(payload.icon_name) || 'tags'
  ]);
  return createSuccessResponse(201, "Category created", { ...payload, id: newId });
}


function handleGetGoals(authToken) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  const sheet = getSheet("tb_goals");
  const rawGoals = mapIdField(getRowsData(sheet).filter(r => String(r.user_id) === String(userId)));
  return createSuccessResponse(200, "Goals retrieved", rawGoals.map(g => ({
    ...g,
    target_amount: Number(g.target_amount) || 0,
    current_amount: Number(g.current_amount) || 0
  })));
}


function handleCreateGoal(authToken, payload) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  const sheet = getSheet("tb_goals");
  const newId = 'GOL-' + generateUUID().substring(0,8);
  const now = new Date().toISOString();
  
  const headers = sheet.getDataRange().getValues()[0];
  const newRow = new Array(headers.length).fill('');
  
  headers.forEach((h, index) => {
    const header = String(h).toLowerCase().trim();
    if (header === 'id' || header === 'goal_id') newRow[index] = newId;
    else if (header === 'user_id') newRow[index] = userId;
    else if (header === 'name') newRow[index] = sanitizeInput(payload.name) || '';
    else if (header === 'target_amount') newRow[index] = payload.target_amount || 0;
    else if (header === 'current_amount') newRow[index] = payload.current_amount || 0;
    else if (header === 'deadline') newRow[index] = payload.deadline || '';
    else if (header === 'color_hex') newRow[index] = sanitizeInput(payload.color_hex) || '#10B981';
    else if (header === 'icon_name') newRow[index] = sanitizeInput(payload.icon_name) || 'target';
    else if (header === 'status') newRow[index] = 'Active';
    else if (header === 'created_at') newRow[index] = now;
  });

  sheet.appendRow(newRow);
  return createSuccessResponse(201, "Goal created", { ...payload, id: newId });
}


