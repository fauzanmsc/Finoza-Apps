/**
 * Finoza - Google Apps Script Backend (API Gateway)
 * PHASE 4: FULL INTEGRATION + DUMMY DATA
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  return ContentService.createTextOutput("Moniq API is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    const payload = requestData.payload || {};
    const authToken = requestData.authToken;

    let response = {};

    switch (action) {
      case "LOGIN": response = handleLogin(payload.email, payload.password); break;
      case "UPDATE_PROFILE": response = handleUpdateProfile(authToken, payload); break;
      case "GET_DASHBOARD_DATA": response = handleGetDashboardData(authToken); break;
      case "GENERATE_DUMMY_DATA": response = handleGenerateDummyData(authToken); break;
      case "GET_REPORTS": response = handleGetReports(authToken, payload); break;
      
      case "GET_CATEGORIES": response = handleGetCategories(authToken); break;
      case "CREATE_CATEGORY": response = handleCreateCategory(authToken, payload); break;
      case "UPDATE_CATEGORY": response = handleGenericUpdate("tb_categories", payload.id, payload, authToken); break;
      case "DELETE_CATEGORY": response = handleGenericDelete("tb_categories", payload.id, authToken); break;

      // TRANSACTIONS
      case "GET_TRANSACTIONS": response = handleGetTransactions(authToken); break;
      case "CREATE_TRANSACTION": response = handleCreateTransaction(authToken, payload); break;
      case "UPDATE_TRANSACTION": response = handleGenericUpdate("tb_transactions", payload.id, payload, authToken); break;
      case "DELETE_TRANSACTION": response = handleGenericDelete("tb_transactions", payload.id, authToken); break;
      
      // ACCOUNTS
      case "GET_ACCOUNTS": response = handleGetAccounts(authToken); break;
      case "CREATE_ACCOUNT": response = handleCreateAccount(authToken, payload); break;
      case "UPDATE_ACCOUNT": response = handleGenericUpdate("tb_accounts", payload.id, payload, authToken); break;
      case "DELETE_ACCOUNT": response = handleGenericDelete("tb_accounts", payload.id, authToken); break;
      
      // BUDGETS
      case "GET_BUDGETS": response = handleGetBudgets(authToken); break;
      case "CREATE_BUDGET": response = handleCreateBudget(authToken, payload); break;
      case "UPDATE_BUDGET": response = handleGenericUpdate("tb_budgets", payload.id, payload, authToken); break;
      case "DELETE_BUDGET": response = handleGenericDelete("tb_budgets", payload.id, authToken); break;
      
      // DEBTS
      case "GET_DEBTS": response = handleGetDebts(authToken); break;
      case "CREATE_DEBT": response = handleCreateDebt(authToken, payload); break;
      case "UPDATE_DEBT": response = handleGenericUpdate("tb_debts", payload.id, payload, authToken); break;
      case "DELETE_DEBT": response = handleGenericDelete("tb_debts", payload.id, authToken); break;

      // GOALS
      case "GET_GOALS": response = handleGetGoals(authToken); break;
      case "CREATE_GOAL": response = handleCreateGoal(authToken, payload); break;

      // Schedules
      case "GET_SCHEDULES": response = handleGetSchedules(authToken); break;
      case "CREATE_SCHEDULE": response = handleCreateSchedule(authToken, payload); break;
      case "UPDATE_SCHEDULE": response = handleUpdateSchedule(authToken, payload); break;
      case "DELETE_SCHEDULE": response = handleDeleteSchedule(authToken, payload); break;
      case "UPDATE_GOAL": response = handleGenericUpdate("tb_goals", payload.id, payload, authToken); break;
      case "DELETE_GOAL": response = handleGenericDelete("tb_goals", payload.id, authToken); break;

      default: response = createErrorResponse(400, "Unknown action");
    }

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify(createErrorResponse(500, error.stack || error.message)))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

