function handleGetDashboardData(authToken) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");

  const txSheet = getSheet("tb_transactions");
  const accSheet = getSheet("tb_accounts");
  
  const accounts = mapIdField(getRowsData(accSheet).filter(r => String(r.user_id) === String(userId)));
  const txs = mapIdField(getRowsData(txSheet).filter(r => String(r.user_id) === String(userId)));

  let netBalance = 0;
  let totalIncome = 0;
  let totalExpense = 0;
  
  accounts.forEach(acc => netBalance += Number(acc.initial_balance || 0));
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  let cashflowData = [
    { name: monthNames[(currentMonth - 2 + 12) % 12], income: 0, expense: 0 },
    { name: monthNames[(currentMonth - 1 + 12) % 12], income: 0, expense: 0 },
    { name: monthNames[currentMonth], income: 0, expense: 0 }
  ];

  let expensesThisMonth = {};
  let currentMonthTxCount = 0;

  txs.forEach(tx => {
    const amt = Number(tx.amount) || 0;
    if (tx.tx_type === 'Income') netBalance += amt;
    if (tx.tx_type === 'Expense') netBalance -= amt;

    const txDate = new Date(tx.tx_date);
    const m = txDate.getMonth();
    const y = txDate.getFullYear();

    const monthDiff = (y - currentYear) * 12 + (m - currentMonth);
    
    if (monthDiff === 0) {
      currentMonthTxCount++;
      if (tx.tx_type === 'Income') {
        totalIncome += amt;
        cashflowData[2].income += amt;
      } else if (tx.tx_type === 'Expense') {
        totalExpense += amt;
        cashflowData[2].expense += amt;
        const cat = tx.note || tx.category_id || 'Lainnya';
        if (!expensesThisMonth[cat]) expensesThisMonth[cat] = 0;
        expensesThisMonth[cat] += amt;
      }
    } else if (monthDiff === -1) {
      if (tx.tx_type === 'Income') cashflowData[1].income += amt;
      else if (tx.tx_type === 'Expense') cashflowData[1].expense += amt;
    } else if (monthDiff === -2) {
      if (tx.tx_type === 'Income') cashflowData[0].income += amt;
      else if (tx.tx_type === 'Expense') cashflowData[0].expense += amt;
    }
  });

  let topExpenses = Object.keys(expensesThisMonth).map(name => ({
    name: name,
    amount: expensesThisMonth[name]
  })).sort((a, b) => b.amount - a.amount).slice(0, 3);
  
  const colors = ['bg-[var(--color-stabilo)]', 'bg-positive', 'bg-negative'];
  topExpenses.forEach((exp, i) => exp.color = colors[i % colors.length]);

  return createSuccessResponse(200, "Dashboard data retrieved", {
    net_balance: netBalance,
    total_income: totalIncome,
    total_expense: totalExpense,
    cashflow: cashflowData,
    recent_transactions: txs.slice(-5).reverse(),
    accounts: accounts,
    top_expenses: topExpenses,
    current_month_tx_count: currentMonthTxCount
  });
}


function handleGetReports(authToken, payload) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  
  const month = payload.month || new Date().getMonth() + 1;
  const year = payload.year || new Date().getFullYear();
  
  const txSheet = getSheet("tb_transactions");
  const txs = getRowsData(txSheet).filter(r => String(r.user_id) === String(userId));
  
  let totalIncome = 0;
  let totalExpense = 0;
  const dailyData = {};
  
  txs.forEach(tx => {
    const d = new Date(tx.tx_date);
    if (d.getMonth() + 1 === month && d.getFullYear() === year) {
       const day = d.getDate();
       const amt = Number(tx.amount) || 0;
       
       if (!dailyData[day]) dailyData[day] = { income: 0, expense: 0, net: 0, transactions: [] };
       
       if (tx.tx_type === 'Income') {
         dailyData[day].income += amt;
         dailyData[day].net += amt;
         totalIncome += amt;
       } else if (tx.tx_type === 'Expense') {
         dailyData[day].expense += amt;
         dailyData[day].net -= amt;
         totalExpense += amt;
       }
       dailyData[day].transactions.push(tx);
    }
  });

  return createSuccessResponse(200, "Reports data retrieved", {
    month: month,
    year: year,
    total_income: totalIncome,
    total_expense: totalExpense,
    net_income: totalIncome - totalExpense,
    daily_data: dailyData
  });
}


