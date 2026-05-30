import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, MoreHorizontal, ArrowUpRight, ArrowDownRight, Wallet, Loader2, Plus, LineChart as LineChartIcon, User } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis, PieChart, Pie, Cell, Legend } from 'recharts';
import TransactionModal from '../components/transactions/TransactionModal';
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [periodFilter, setPeriodFilter] = useState('3months');
  const [imgError, setImgError] = useState(false);

  const token = useAuth(state => state.token);
  const user = useAuth(state => state.user);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resTx, resAcc] = await Promise.all([
        fetchApi('GET_TRANSACTIONS', {}, token!),
        fetchApi('GET_ACCOUNTS', {}, token!)
      ]);

      const transactions = resTx.status === 'success' && Array.isArray(resTx.data) ? resTx.data : [];
      const accounts = resAcc.status === 'success' && Array.isArray(resAcc.data) ? resAcc.data : [];

      setAllTransactions(transactions);

      const now = new Date();
      const currentMonthTx = transactions.filter(tx => {
        const d = new Date(tx.tx_date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      const total_income = currentMonthTx.filter(tx => tx.tx_type === 'Income').reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
      const total_expense = currentMonthTx.filter(tx => tx.tx_type === 'Expense').reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

      const expenseByCategory = currentMonthTx.filter(tx => tx.tx_type === 'Expense').reduce((acc, tx) => {
        const cat = tx.category_id || 'Lainnya';
        if (!acc[cat]) acc[cat] = 0;
        acc[cat] += (Number(tx.amount) || 0);
        return acc;
      }, {} as Record<string, number>);

      const top_expenses = Object.keys(expenseByCategory)
        .map(name => ({ name, amount: expenseByCategory[name] }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      const accountsTotal = accounts.reduce((sum, acc) => sum + (Number(acc.initial_balance) || 0), 0);
      const allTimeIncome = transactions.filter(tx => tx.tx_type === 'Income').reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
      const allTimeExpense = transactions.filter(tx => tx.tx_type === 'Expense').reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
      const net_balance = accountsTotal + allTimeIncome - allTimeExpense;

      const recent_transactions = [...transactions].sort((a, b) => new Date(b.tx_date).getTime() - new Date(a.tx_date).getTime()).slice(0, 5);

      setData({
        net_balance,
        total_income,
        total_expense,
        top_expenses,
        recent_transactions,
        accounts
      });
    } catch (err) {
      console.error(err);
      setData({ net_balance: 0, total_income: 0, total_expense: 0, top_expenses: [], recent_transactions: [], accounts: [] });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading || !data) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-stabilo)]" /></div>;
  }

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
  const formatShort = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };
  const formatAxisTick = (v: number) => {
    if (v >= 1000000) return (v / 1000000).toFixed(0) + 'jt';
    if (v >= 1000) return (v / 1000).toFixed(0) + 'rb';
    return v.toString();
  };

  const openModal = (type?: string) => {
    setModalInitialData(type ? { tx_type: type } : null);
    setIsModalOpen(true);
  };

  // Pie chart data
  const pieData = [
    { name: 'Pemasukan', value: data.total_income || 0, color: '#10B981' },
    { name: 'Pengeluaran', value: data.total_expense || 0, color: '#EF4444' },
  ].filter(d => d.value > 0);

  const getFilteredCashflow = () => {
    if (!allTransactions || allTransactions.length === 0) return data?.cashflow || [];

    const now = new Date();
    let startDate = new Date();
    let formatLabel = (d: Date) => d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    let groupBy = (d: Date) => d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

    if (periodFilter === 'weekly') startDate.setDate(now.getDate() - 7);
    else if (periodFilter === 'monthly') startDate.setMonth(now.getMonth() - 1);
    else if (periodFilter === '3months') {
      startDate.setMonth(now.getMonth() - 3);
      formatLabel = (d: Date) => d.toLocaleDateString('id-ID', { month: 'short' });
      groupBy = (d: Date) => d.getFullYear() + '-' + d.getMonth();
    } else if (periodFilter === 'yearly') {
      startDate.setFullYear(now.getFullYear() - 1);
      formatLabel = (d: Date) => d.toLocaleDateString('id-ID', { month: 'short' });
      groupBy = (d: Date) => d.getFullYear() + '-' + d.getMonth();
    }

    const filtered = allTransactions.filter(tx => new Date(tx.tx_date) >= startDate);
    const grouped = filtered.reduce((acc, tx) => {
      const d = new Date(tx.tx_date);
      const key = groupBy(d);
      if (!acc[key]) acc[key] = { name: formatLabel(d), income: 0, expense: 0, date: d };
      if (tx.tx_type === 'Income') acc[key].income += Number(tx.amount || 0);
      if (tx.tx_type === 'Expense') acc[key].expense += Number(tx.amount || 0);
      return acc;
    }, {} as Record<string, any>);

    let result = Object.values(grouped).sort((a: any, b: any) => a.date.getTime() - b.date.getTime());
    if (result.length === 0) return data?.cashflow || [];
    return result;
  };

  const cashflowData = getFilteredCashflow();

  return (
    <div className="w-full overflow-x-hidden">
      {/* ========================================= */}
      {/* MOBILE LAYOUT (< lg)                     */}
      {/* ========================================= */}
      <div className="block lg:hidden px-4 pt-4 pb-28 w-full max-w-md mx-auto relative">

        {/* Header - compact */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {user?.profile_picture_url && !imgError && user.profile_picture_url !== 'null' ? (
              <img
                src={user.profile_picture_url}
                alt="Profile"
                onError={() => setImgError(true)}
                className="w-10 h-10 rounded-full object-cover bg-slate-800 border-2 border-white/5 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center flex-shrink-0 border-2 border-white/5">
                <User className="w-5 h-5 text-slate-500" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-semibold text-base leading-tight truncate">Hai, {user?.full_name?.split(' ')[0] || 'User'}</h2>
              <p className="text-slate-400 text-xs">Wallet • {user?.currency || 'IDR'}</p>
            </div>
          </div>
          <button onClick={() => openModal()} className="w-10 h-10 bg-[var(--color-stabilo)] rounded-xl flex items-center justify-center text-white shadow-[0_0_12px_rgba(204,255,0,0.3)] flex-shrink-0">
            <Plus className="w-5 h-5 stroke-[2.5px]" />
          </button>
        </div>

        {/* Account Cards (horizontal scroll) */}
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide mb-5">
          {/* Total balance card */}
          <div className="min-w-[200px] bg-surface-dark rounded-2xl p-4 flex flex-col justify-between flex-shrink-0 border border-black/5 dark:border-white/5">
            <p className="text-[var(--color-text-muted)] text-xs mb-1">Total Saldo</p>
            <p className="text-2xl font-bold text-[var(--color-stabilo)] tracking-tight">{formatShort(data.net_balance)}</p>
            <p className="text-[var(--color-text-muted)] text-[10px] mt-1">{formatRp(data.net_balance)}</p>
          </div>
          {data.accounts?.map((acc: any, i: number) => (
            <div key={i} className="min-w-[160px] rounded-2xl p-4 flex flex-col justify-between flex-shrink-0 border border-black/5 dark:border-white/5" style={{ background: acc.color_hex || '#1E3A8A' }}>
              <p className="text-white/70 text-xs truncate">{acc.account_name}</p>
              <p className="text-white font-bold text-lg mt-2">{formatShort(acc.initial_balance || 0)}</p>
              <p className="text-white/40 text-[10px]">{acc.account_type}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button onClick={() => openModal('Expense')} className="bg-surface rounded-2xl py-4 flex flex-col items-center gap-2 active:scale-95 transition-transform border border-black/5 dark:border-white/5">
            <div className="w-10 h-10 rounded-full bg-negative/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-negative stroke-[2.5px]" />
            </div>
            <span className="text-[var(--color-text-foreground)] font-medium text-sm">Pengeluaran</span>
          </button>
          <button onClick={() => openModal('Income')} className="bg-surface rounded-2xl py-4 flex flex-col items-center gap-2 active:scale-95 transition-transform border border-black/5 dark:border-white/5">
            <div className="w-10 h-10 rounded-full bg-positive/10 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-positive stroke-[2.5px]" />
            </div>
            <span className="text-[var(--color-text-foreground)] font-medium text-sm">Pemasukan</span>
          </button>
        </div>

        {/* Income vs Expense Insight (Pie) */}
        {pieData.length > 0 && (
          <div className="bg-surface rounded-2xl p-4 mb-5 border border-black/5 dark:border-white/5">
            <h3 className="text-sm font-medium text-[var(--color-text-foreground)] mb-3">Insight Bulan Ini</h3>
            <div className="flex items-center gap-2">
              <div className="w-[120px] h-[120px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--color-text-foreground)' }} formatter={(v: any) => formatRp(v)} />
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-positive" /><span className="text-xs text-[var(--color-text-muted)]">Pemasukan</span></div>
                  <span className="text-xs font-medium text-positive">{formatRp(data.total_income)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-negative" /><span className="text-xs text-[var(--color-text-muted)]">Pengeluaran</span></div>
                  <span className="text-xs font-medium text-negative">{formatRp(data.total_expense)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cashflow Chart (compact) */}
        <div className="bg-surface rounded-2xl p-4 mb-5 border border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[var(--color-text-foreground)]">Arus Kas</h3>
            <select
              value={periodFilter}
              onChange={e => setPeriodFilter(e.target.value)}
              className="bg-black/5 dark:bg-black/20 border border-black/5 dark:border-white/10 text-xs rounded-lg px-2 py-1 text-[var(--color-text-foreground)] focus:outline-none"
            >
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
              <option value="3months">3 Bulan Terakhir</option>
              <option value="yearly">Tahunan</option>
            </select>
          </div>
          <div className="h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData}>
                <defs>
                  <linearGradient id="mIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="mExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={formatAxisTick} width={40} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--color-text-foreground)', fontSize: 12 }} formatter={(v: any) => formatRp(v)} />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#mIncome)" name="Pemasukan" />
                <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#mExpense)" name="Pengeluaran" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-surface rounded-2xl p-4 border border-black/5 dark:border-white/5">
          <h3 className="text-sm font-medium text-[var(--color-text-foreground)] mb-3">Transaksi Terbaru</h3>
          <div className="space-y-3">
            {data.recent_transactions?.map((tx: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.tx_type === 'Income' ? 'bg-positive/10' : 'bg-negative/10'}`}>
                    {tx.tx_type === 'Income' ? <ArrowDownRight className="w-4 h-4 text-positive" /> : <ArrowUpRight className="w-4 h-4 text-negative" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-foreground)] truncate">{tx.note || tx.category_id || 'Transaksi'}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{tx.tx_date}</p>
                  </div>
                </div>
                <p className={`text-sm font-semibold flex-shrink-0 ml-2 ${tx.tx_type === 'Income' ? 'text-positive' : 'text-negative'}`}>
                  {tx.tx_type === 'Income' ? '+' : '-'}{formatShort(tx.amount)}
                </p>
              </div>
            ))}
            {(!data.recent_transactions || data.recent_transactions.length === 0) && (
              <p className="text-center text-[var(--color-text-muted)] text-sm py-4">Belum ada transaksi</p>
            )}
          </div>
        </div>
      </div>


      {/* ========================================= */}
      {/* DESKTOP LAYOUT (>= lg)                   */}
      {/* ========================================= */}
      <div className="hidden lg:block p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user?.profile_picture_url && !imgError && user.profile_picture_url !== 'null' ? (
              <img
                src={user.profile_picture_url}
                alt="Profile"
                onError={() => setImgError(true)}
                className="w-12 h-12 rounded-full object-cover bg-slate-800"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center">
                <User className="w-6 h-6 text-slate-500" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">Selamat datang, {user?.full_name?.split(' ')[0] || 'User'}! 👋</h2>
              <p className="text-[var(--color-text-muted)] text-sm">Berikut ringkasan keuangan Anda hari ini.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => openModal()} className="bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-lg shadow-[var(--color-stabilo)]/30">
              <span className="text-lg leading-none">+</span> Catat Transaksi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Balance Card */}
              <div className="glass rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Wallet className="w-24 h-24" />
                </div>
                <h3 className="text-[var(--color-text-muted)] text-sm font-medium mb-2">Saldo Bersih</h3>
                <p className="text-4xl font-bold tracking-tight mb-6">{formatRp(data.net_balance)}</p>

                <div className="flex gap-4">
                  <button onClick={() => openModal('Income')} className="flex-1 bg-surface-light hover:bg-black/5 dark:hover:bg-white/10 transition-colors py-3 rounded-xl flex items-center justify-center gap-2">
                    <ArrowDownRight className="w-5 h-5 text-positive" />
                    <span className="font-medium text-sm">Pemasukan</span>
                  </button>
                  <button onClick={() => openModal('Expense')} className="flex-1 bg-surface-light hover:bg-black/5 dark:hover:bg-white/10 transition-colors py-3 rounded-xl flex items-center justify-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-negative" />
                    <span className="font-medium text-sm">Pengeluaran</span>
                  </button>
                </div>
              </div>

              {/* Account Carousel */}
              <div className="glass rounded-2xl p-6 flex flex-col justify-between">
                <h3 className="font-medium mb-4">Akun Rekening</h3>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {data.accounts && data.accounts.length > 0 ? data.accounts.map((acc: any, i: number) => (
                    <div key={i} className="w-full min-w-[200px] h-28 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden text-white" style={{ background: acc.color_hex || '#1E3A8A' }}>
                      <div className="flex justify-between items-start z-10 relative">
                        <span className="font-medium text-sm drop-shadow-md">{acc.account_name}</span>
                        <MoreHorizontal className="w-5 h-5 text-white/70" />
                      </div>
                      <p className="font-bold text-xl drop-shadow-md z-10 relative">{formatRp(acc.initial_balance)}</p>
                    </div>
                  )) : (
                    <div className="w-full h-28 rounded-xl bg-surface-light flex items-center justify-center text-sm text-[var(--color-text-muted)]">Belum ada rekening</div>
                  )}
                </div>
              </div>
            </div>

            {/* Chart Widget with Axes */}
            <div className="glass rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <h3 className="font-medium">Arus Kas Masuk/Keluar</h3>
                  <select
                    value={periodFilter}
                    onChange={e => setPeriodFilter(e.target.value)}
                    className="bg-black/10 dark:bg-white/5 border border-black/10 dark:border-border text-sm rounded-lg px-3 py-1.5 focus:outline-none text-[var(--color-text-foreground)]"
                  >
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                    <option value="3months">3 Bulan Terakhir</option>
                    <option value="yearly">Tahunan</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-positive rounded-full inline-block" /> Pemasukan</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-negative rounded-full inline-block" /> Pengeluaran</span>
                </div>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashflowData}>
                    <defs>
                      <linearGradient id="dIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="dExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} tickFormatter={formatAxisTick} width={50} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--color-text-foreground)' }} formatter={(v: any) => formatRp(v)} />
                    <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#dIncome)" name="Pemasukan" />
                    <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#dExpense)" name="Pengeluaran" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transactions List */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-medium mb-6">Transaksi Terbaru</h3>
              <div className="space-y-4">
                {data.recent_transactions?.map((tx: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${tx.tx_type === 'Income' ? 'bg-positive/10' : 'bg-negative/10'}`}>
                        {tx.tx_type === 'Income' ? <ArrowDownRight className="w-5 h-5 text-positive" /> : <ArrowUpRight className="w-5 h-5 text-negative" />}
                      </div>
                      <div>
                        <p className="font-medium">{tx.note || tx.category_id || 'Transaksi'}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{tx.tx_date}</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${tx.tx_type === 'Income' ? 'text-positive' : 'text-negative'}`}>
                      {tx.tx_type === 'Income' ? '+' : '-'}{formatRp(tx.amount)}
                    </p>
                  </div>
                ))}
                {(!data.recent_transactions || data.recent_transactions.length === 0) && (
                  <div className="text-center text-slate-500 py-4">Belum ada transaksi</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Pie Chart Insight */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-medium mb-6">Insight Bulan Ini</h3>
              {pieData.length > 0 ? (
                <div className="flex flex-col items-center">
                  <div className="w-[180px] h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--color-text-foreground)' }} formatter={(v: any) => formatRp(v)} />
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                          {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-positive" /><span className="text-sm text-[var(--color-text-muted)]">Pemasukan</span></div>
                      <span className="text-sm font-semibold text-positive">{formatRp(data.total_income)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-negative" /><span className="text-sm text-[var(--color-text-muted)]">Pengeluaran</span></div>
                      <span className="text-sm font-semibold text-negative">{formatRp(data.total_expense)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">Belum ada data bulan ini</p>
              )}
            </div>

            {/* Top Expenses */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-medium mb-6">Top Pengeluaran</h3>
              <div className="space-y-4">
                {data.top_expenses && data.top_expenses.length > 0 ? data.top_expenses.map((cat: any, i: number) => {
                  const maxAmt = Math.max(...data.top_expenses.map((c: any) => c.amount));
                  const pct = maxAmt > 0 ? (cat.amount / maxAmt) * 100 : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-[var(--color-text-muted)]">{cat.name}</span>
                        <span className="font-medium">{formatRp(cat.amount)}</span>
                      </div>
                      <div className="h-2 w-full bg-surface-light rounded-full overflow-hidden">
                        <div className="h-full bg-negative rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-slate-500 text-center py-4">Belum ada pengeluaran</p>
                )}
              </div>
              <button onClick={() => openModal('Expense')} className="w-full mt-6 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium">
                + Catat Pengeluaran Baru
              </button>
            </div>
          </div>
        </div>
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={loadData} initialData={modalInitialData} />
    </div>
  );
}
