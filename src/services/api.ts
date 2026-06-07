const API_URL = import.meta.env.VITE_API_URL || '';

// In-memory mock data
let mockTransactions = [
  { id: '1', note: 'Gaji Bulanan', tx_date: '2026-05-28', tx_type: 'Income', amount: 8000000, category_id: 'Gaji', account_src_id: 'Bank BCA' },
  { id: '2', note: 'Makan Siang', tx_date: '2026-05-29', tx_type: 'Expense', amount: 45000, category_id: 'Makanan', account_src_id: 'GoPay' },
];

let mockAccounts = [
  { id: '1', account_name: 'Bank BCA', account_type: 'Bank', initial_balance: 12500000, color_hex: '#1E3A8A' },
  { id: '2', account_name: 'GoPay', account_type: 'E-Wallet', initial_balance: 3000000, color_hex: '#10B981' }
];

let mockBudgets = [
  { id: '1', name: 'Makanan & Minuman', used: 1500000, limit: 3000000, color: 'bg-indigo-500' },
  { id: '2', name: 'Transportasi', used: 800000, limit: 1000000, color: 'bg-amber-500' },
  { id: '3', name: 'Hiburan', used: 1200000, limit: 1000000, color: 'bg-rose-500' },
];

let mockDebts = [
  { id: '1', name: 'Andi Setiawan', type: 'Saya Berhutang', amount: 500000, due: '2023-08-15', status: 'Active' },
  { id: '2', name: 'Siska', type: 'Piutang (Dia Berhutang)', amount: 1200000, due: '2023-07-30', status: 'Overdue' },
];

let mockGoals = [
  { id: '1', name: 'Dana Darurat', target_amount: 50000000, current_amount: 15000000, deadline: '2027-12-31', color_hex: '#10B981', icon_name: 'shield' },
  { id: '2', name: 'Liburan ke Jepang', target_amount: 25000000, current_amount: 5000000, deadline: '2026-10-15', color_hex: '#F43F5E', icon_name: 'plane' },
];

let mockCategories = [
  { id: '1', name: 'Makanan & Minuman', category_type: 'Expense', icon_name: 'pizza', color_hex: '#F43F5E' },
  { id: '2', name: 'Transportasi', category_type: 'Expense', icon_name: 'car', color_hex: '#EAB308' },
  { id: '3', name: 'Gaji', category_type: 'Income', icon_name: 'briefcase', color_hex: '#10B981' },
  { id: '4', name: 'Transfer Masuk', category_type: 'Transfer', icon_name: 'arrow-down-left', color_hex: '#3B82F6' },
];

export async function fetchApi(action: string, payload: any = {}, authToken?: string) {
  if (!API_URL) {
    console.warn("VITE_API_URL is not defined! Using mock responses for", action);
    // Fallback for development if URL is not yet provided
    return handleMockApi(action, payload);
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action,
        payload,
        authToken,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { status: 'error', message: 'Failed to connect to backend', data: null };
  }
}

// Temporary Mock API to allow local development before Apps Script is deployed
function handleMockApi(action: string, payload: any = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const generateId = () => Math.random().toString(36).substr(2, 9);
      
      if (action === 'LOGIN') {
        resolve({
          status: 'success',
          data: {
            authToken: 'MOCK-TOKEN-123',
            user: { full_name: 'Mock User', email: 'mock@moniq.com', currency: 'IDR' }
          }
        });
      } else if (action === 'UPDATE_PROFILE') {
        resolve({
          status: 'success',
          message: 'Profile updated',
          data: {
            full_name: payload.full_name,
            profile_picture_url: payload.base64_image ? 'data:image/png;base64,...' : undefined
          }
        });
      } else if (action === 'GET_DASHBOARD_DATA') {
        // Calculate net balance and recent transactions dynamically
        const income = mockTransactions.filter(t => t.tx_type === 'Income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const expense = mockTransactions.filter(t => t.tx_type === 'Expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        
        resolve({
          status: 'success',
          data: {
            net_balance: income - expense + 15000000, // starting balance mock
            cashflow: [
              { name: 'Jan', income: 4000000, expense: 2400000 },
              { name: 'Feb', income: 3000000, expense: 1398000 },
              { name: 'Mar', income: 2000000, expense: 980000 },
              { name: 'Apr', income: 2780000, expense: 3908000 },
              { name: 'May', income: 1890000, expense: 4800000 },
              { name: 'Jun', income: 2390000, expense: 3800000 },
            ],
            recent_transactions: [...mockTransactions].reverse().slice(0, 5)
          }
        });
      } else if (action === 'GET_ACCOUNTS') {
        resolve({ status: 'success', data: mockAccounts });
      } else if (action === 'GET_TRANSACTIONS') {
        resolve({ status: 'success', data: mockTransactions });
      } else if (action === 'GET_BUDGETS') {
        resolve({ status: 'success', data: mockBudgets });
      } else if (action === 'GET_DEBTS') {
        resolve({ status: 'success', data: mockDebts });
      } else if (action === 'GET_GOALS') {
        resolve({ status: 'success', data: mockGoals });
      } else if (action === 'GET_REPORTS') {
        resolve({
          status: 'success',
          data: {
            cashflow: [
              { name: 'Week 1', income: 4000, expense: 2400 },
              { name: 'Week 2', income: 3000, expense: 1398 },
              { name: 'Week 3', income: 2000, expense: 9800 },
              { name: 'Week 4', income: 2780, expense: 3908 },
            ],
            topCategories: [
              { cat: 'Makanan & Minuman', amount: 'Rp 2.400.000', pct: '45%' },
              { cat: 'Transportasi', amount: 'Rp 1.200.000', pct: '22%' },
              { cat: 'Tagihan', amount: 'Rp 800.000', pct: '15%' },
            ]
          }
        });
        
      // TRANSACTIONS CRUD
      } else if (action === 'CREATE_TRANSACTION') {
        const newTx = { ...payload, id: generateId() };
        mockTransactions.push(newTx);
        
        // Update Account Balances
        if (payload.tx_type === 'Transfer') {
          const srcAcc = mockAccounts.find(a => a.id === payload.account_src_id);
          const dstAcc = mockAccounts.find(a => a.id === payload.account_dst_id);
          if (srcAcc) srcAcc.initial_balance = Number(srcAcc.initial_balance) - payload.amount;
          if (dstAcc) dstAcc.initial_balance = Number(dstAcc.initial_balance) + payload.amount;
        } else if (payload.tx_type === 'Expense') {
          const srcAcc = mockAccounts.find(a => a.id === payload.account_src_id);
          if (srcAcc) srcAcc.initial_balance = Number(srcAcc.initial_balance) - payload.amount;
        } else if (payload.tx_type === 'Income') {
          const srcAcc = mockAccounts.find(a => a.id === payload.account_src_id);
          if (srcAcc) srcAcc.initial_balance = Number(srcAcc.initial_balance) + payload.amount;
        }

        resolve({ status: 'success', message: 'Success', data: newTx });
      } else if (action === 'UPDATE_TRANSACTION') {
        mockTransactions = mockTransactions.map(t => t.id === payload.id ? { ...t, ...payload } : t);
        resolve({ status: 'success', message: 'Success', data: payload });
      } else if (action === 'DELETE_TRANSACTION') {
        mockTransactions = mockTransactions.filter(t => t.id !== payload.id);
        resolve({ status: 'success', message: 'Success', data: {} });
        
      // ACCOUNTS CRUD
      } else if (action === 'CREATE_ACCOUNT') {
        const newAcc = { ...payload, id: generateId() };
        mockAccounts.push(newAcc);
        resolve({ status: 'success', message: 'Success', data: newAcc });
      } else if (action === 'UPDATE_ACCOUNT') {
        mockAccounts = mockAccounts.map(a => a.id === payload.id ? { ...a, ...payload } : a);
        resolve({ status: 'success', message: 'Success', data: payload });
      } else if (action === 'DELETE_ACCOUNT') {
        mockAccounts = mockAccounts.filter(a => a.id !== payload.id);
        resolve({ status: 'success', message: 'Success', data: {} });
        
      // BUDGETS CRUD
      } else if (action === 'CREATE_BUDGET') {
        const newBudget = { ...payload, id: generateId() };
        mockBudgets.push(newBudget);
        resolve({ status: 'success', message: 'Success', data: newBudget });
      } else if (action === 'UPDATE_BUDGET') {
        mockBudgets = mockBudgets.map(b => b.id === payload.id ? { ...b, ...payload } : b);
        resolve({ status: 'success', message: 'Success', data: payload });
      } else if (action === 'DELETE_BUDGET') {
        mockBudgets = mockBudgets.filter(b => b.id !== payload.id);
        resolve({ status: 'success', message: 'Success', data: {} });
        
      // DEBTS CRUD
      } else if (action === 'CREATE_DEBT') {
        const newDebt = { ...payload, id: generateId() };
        mockDebts.push(newDebt);
        resolve({ status: 'success', message: 'Success', data: newDebt });
      } else if (action === 'UPDATE_DEBT') {
        mockDebts = mockDebts.map(d => d.id === payload.id ? { ...d, ...payload } : d);
        resolve({ status: 'success', message: 'Success', data: payload });
      } else if (action === 'DELETE_DEBT') {
        mockDebts = mockDebts.filter(d => d.id !== payload.id);
        resolve({ status: 'success', message: 'Success', data: {} });
        
      // GOALS CRUD
      } else if (action === 'CREATE_GOAL') {
        const newGoal = { ...payload, id: generateId() };
        mockGoals.push(newGoal);
        resolve({ status: 'success', message: 'Success', data: newGoal });
      } else if (action === 'UPDATE_GOAL') {
        mockGoals = mockGoals.map(g => g.id === payload.id ? { ...g, ...payload } : g);
        resolve({ status: 'success', message: 'Success', data: payload });
      } else if (action === 'DELETE_GOAL') {
        mockGoals = mockGoals.filter(g => g.id !== payload.id);
        resolve({ status: 'success', message: 'Success', data: {} });
        
      // CATEGORIES CRUD
      } else if (action === 'GET_CATEGORIES') {
        resolve({ status: 'success', data: mockCategories });
      } else if (action === 'CREATE_CATEGORY') {
        const newCat = { ...payload, id: generateId() };
        mockCategories.push(newCat);
        resolve({ status: 'success', message: 'Success', data: newCat });
      } else if (action === 'UPDATE_CATEGORY') {
        mockCategories = mockCategories.map(c => c.id === payload.id ? { ...c, ...payload } : c);
        resolve({ status: 'success', message: 'Success', data: payload });
      } else if (action === 'DELETE_CATEGORY') {
        mockCategories = mockCategories.filter(c => c.id !== payload.id);
        resolve({ status: 'success', message: 'Success', data: {} });
        
      } else {
        resolve({ status: 'error', message: 'Action not mapped in mock', data: null });
      }
    }, 300);
  });
}
