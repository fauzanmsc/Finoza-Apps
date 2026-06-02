import { useState, useEffect } from 'react';
import { MoreHorizontal, ArrowUpRight, ArrowDownRight, Wallet, Loader2, User, Eye, EyeOff, Plus, Landmark, Pizza, Car, Briefcase, ArrowDownLeft, ShoppingBag, Coffee, Smartphone, Monitor, Home, Heart, Smile, Tags, Crown } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  'pizza': Pizza,
  'car': Car,
  'briefcase': Briefcase,
  'arrow-down-left': ArrowDownLeft,
  'shopping-bag': ShoppingBag,
  'coffee': Coffee,
  'smartphone': Smartphone,
  'monitor': Monitor,
  'home': Home,
  'heart': Heart,
  'smile': Smile,
  'tags': Tags,
};
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import TransactionModal from '../components/transactions/TransactionModal';
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';
import OnboardingModal from '../components/ui/OnboardingModal';
import { Link, useNavigate } from 'react-router-dom';
import ModernDropdown from '../components/ui/ModernDropdown';

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

const parseTxDate = (val: any): Date | null => {
  if (!val) return null;
  if (typeof val === 'number') {
    return val < 100000 ? new Date((val - 25569) * 86400000) : new Date(val);
  }
  const str = String(val).trim();
  const iso = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const dm = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dm) {
    const p1 = Number(dm[1]), p2 = Number(dm[2]), y = Number(dm[3]);
    return p2 > 12 ? new Date(y, p1 - 1, p2) : new Date(y, p2 - 1, p1);
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  return null;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const fullDate = payload[0].payload.fullDate || label;
    return (
      <div className="bg-[#131823]/95 backdrop-blur-md border border-white/10 p-4 rounded-[16px] shadow-2xl shadow-black/40 min-w-[220px]">
        <p className="text-white/60 text-[13px] mb-3 font-medium">{fullDate}</p>
        <div className="space-y-2.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }}
                />
                <span className="text-[13px] text-white/80 font-medium">{entry.name}</span>
              </div>
              <span className="text-[13px] font-bold text-white tracking-tight">{formatRp(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const PieCustomTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percent = total > 0 ? Math.round((data.value / total) * 100) : 0;
    return (
      <div className="bg-[#121620]/95 backdrop-blur-md border border-white/10 p-3 lg:p-4 rounded-xl lg:rounded-2xl shadow-2xl shadow-black/50 min-w-[140px]">
        <div className="flex items-center justify-between gap-4 mb-2">
          <p className="text-[11px] lg:text-[12px] text-slate-400 font-medium">{data.name}</p>
          <span className="text-[14px] lg:text-[18px] font-extrabold text-white">{percent}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full shadow-lg flex-shrink-0"
            style={{ backgroundColor: data.payload.color, boxShadow: `0 0 10px ${data.payload.color}` }}
          />
          <span className="text-[14px] lg:text-[16px] font-bold text-white tracking-tight">{formatRp(data.value)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [periodFilter, setPeriodFilter] = useState('weekly');
  const [chartMonthOffset, setChartMonthOffset] = useState(0);
  const [insightMonthOffset, setInsightMonthOffset] = useState(0);
  const [topExpenseMonthOffset, setTopExpenseMonthOffset] = useState(0);
  const [catMap, setCatMap] = useState<any>({});
  const [imgError, setImgError] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [imgCacheBuster, setImgCacheBuster] = useState('');
  const [growthIndex, setGrowthIndex] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);

  const token = useAuth(state => state.token);
  const user = useAuth(state => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    setImgCacheBuster(`?t=${Date.now()}`);
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => {
        setGrowthIndex(prev => (prev + 1) % 3);
        setIsBlinking(false);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resTx, resAcc, resCat] = await Promise.all([
        fetchApi('GET_TRANSACTIONS', {}, token!),
        fetchApi('GET_ACCOUNTS', {}, token!),
        fetchApi('GET_CATEGORIES', {}, token!)
      ]);

      const transactions = resTx.status === 'success' && Array.isArray(resTx.data) ? resTx.data : [];
      const accounts = resAcc.status === 'success' && Array.isArray(resAcc.data) ? resAcc.data : [];
      const categories = resCat.status === 'success' && Array.isArray(resCat.data) ? resCat.data : [];

      setAllTransactions(transactions);

      const generatedCatMap = categories.reduce((acc: any, cat: any) => {
        acc[cat.id] = cat;
        return acc;
      }, {});
      setCatMap(generatedCatMap);

      const catMapToUse = generatedCatMap;

      const now = new Date();
      const currentMonthTx = transactions.filter((tx: any) => {
        const d = parseTxDate(tx.tx_date);
        if (!d) return false;
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      const total_income = currentMonthTx.filter((tx: any) => tx.tx_type === 'Income').reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0);
      const total_expense = currentMonthTx.filter((tx: any) => tx.tx_type === 'Expense').reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0);

      const expenseByCategory = currentMonthTx.filter((tx: any) => tx.tx_type === 'Expense').reduce((acc: any, tx: any) => {
        const catId = tx.category_id || 'Lainnya';
        if (!acc[catId]) {
          acc[catId] = {
            id: catId,
            name: catMapToUse[catId]?.name || 'Lainnya',
            icon_name: catMapToUse[catId]?.icon_name || 'tags',
            color_hex: catMapToUse[catId]?.color_hex || '#ef4444',
            amount: 0
          };
        }
        acc[catId].amount += (Number(tx.amount) || 0);
        return acc;
      }, {} as Record<string, any>);

      const top_expenses = Object.values(expenseByCategory)
        .sort((a: any, b: any) => b.amount - a.amount)
        .slice(0, 5);

      const accountsTotal = accounts.reduce((sum: number, acc: any) => sum + (Number(acc.initial_balance) || 0), 0);
      const allTimeIncome = transactions.filter((tx: any) => tx.tx_type === 'Income').reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0);
      const allTimeExpense = transactions.filter((tx: any) => tx.tx_type === 'Expense').reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0);
      const net_balance = accountsTotal + allTimeIncome - allTimeExpense;

      const nowTime = new Date().getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      const yesterdayEnd = new Date(new Date().setHours(0, 0, 0, 0) - 1).getTime();
      const lastWeekEnd = new Date(new Date().setHours(0, 0, 0, 0) - 7 * oneDayMs - 1).getTime();
      const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0, 23, 59, 59, 999).getTime();

      const getBalanceAtDate = (timeLimit: number) => {
        const pastIncome = transactions.filter((tx: any) => tx.tx_type === 'Income' && parseTxDate(tx.tx_date) && parseTxDate(tx.tx_date)!.getTime() <= timeLimit).reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0);
        const pastExpense = transactions.filter((tx: any) => tx.tx_type === 'Expense' && parseTxDate(tx.tx_date) && parseTxDate(tx.tx_date)!.getTime() <= timeLimit).reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0);
        return accountsTotal + pastIncome - pastExpense;
      };

      const calcGrowth = (past: number, current: number) => {
        if (past === 0) return current > 0 ? 100 : 0;
        return ((current - past) / Math.abs(past)) * 100;
      };

      const growth = [
        { label: 'kemarin', value: calcGrowth(getBalanceAtDate(yesterdayEnd), net_balance) },
        { label: 'minggu lalu', value: calcGrowth(getBalanceAtDate(lastWeekEnd), net_balance) },
        { label: 'bulan lalu', value: calcGrowth(getBalanceAtDate(lastMonthEnd), net_balance) }
      ];

      const recent_transactions = [...transactions]
        .sort((a, b) => (parseTxDate(b.tx_date)?.getTime() || 0) - (parseTxDate(a.tx_date)?.getTime() || 0))
        .slice(0, 5)
        .map(tx => ({
          ...tx,
          category_name: catMapToUse[tx.category_id]?.name || tx.category_id || (tx.tx_type === 'Income' ? 'Pemasukan' : 'Pengeluaran'),
          icon_name: catMapToUse[tx.category_id]?.icon_name || (tx.tx_type === 'Income' ? 'arrow-down-left' : 'tags'),
          color_hex: catMapToUse[tx.category_id]?.color_hex || (tx.tx_type === 'Income' ? '#1EE494' : '#FF4D4D')
        }));

      setData({
        net_balance,
        total_income,
        total_expense,
        top_expenses,
        recent_transactions,
        accounts,
        growth
      });
    } catch (err) {
      console.error(err);
      setData({ net_balance: 0, total_income: 0, total_expense: 0, top_expenses: [], recent_transactions: [], accounts: [] });
    }
    setIsLoading(false);

    const hasOnboarded = localStorage.getItem('finoza_onboarded');
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading || !data) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-stabilo)]" /></div>;
  }



  const openModal = (type?: string) => {
    setModalInitialData(type ? { tx_type: type } : null);
    setIsModalOpen(true);
  };

  // Pie chart data moved to dynamic block

  const getBankColor = (name: string, colorHex?: string) => {
    if (colorHex) return colorHex;
    const n = (name || '').toLowerCase();
    if (n.includes('bca')) return '#264391';
    if (n.includes('bni')) return '#02BDCE';
    if (n.includes('mandiri')) return '#003D79';
    if (n.includes('bri')) return '#00529C';
    if (n.includes('bsi')) return '#00A39D';
    if (n.includes('jago')) return '#FF7A00';
    if (n.includes('jenius')) return '#FF6A00';
    return '#1E3A8A';
  };

  const getPeriodLabel = () => {
    const now = new Date();
    if (periodFilter === 'weekly') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + (chartMonthOffset * 7));
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (chartMonthOffset * 7));
      return `${start.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}`;
    }
    if (periodFilter === 'monthly') {
      return new Date(now.getFullYear(), now.getMonth() + chartMonthOffset, 1).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    }
    if (periodFilter === 'yearly') {
      return (now.getFullYear() + chartMonthOffset).toString();
    }
    return '';
  };

  const getFilteredCashflow = () => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    let formatFullDate = (d: Date) => d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    let formatLabel = (d: Date) => d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

    let datesToGenerate: Date[] = [];

    if (periodFilter === 'weekly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + (chartMonthOffset * 7), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (chartMonthOffset * 7), 23, 59, 59);

      for (let i = 0; i <= 6; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        datesToGenerate.push(d);
      }
    } else if (periodFilter === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth() + chartMonthOffset, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + chartMonthOffset + 1, 0, 23, 59, 59);
      formatLabel = (d: Date) => d.getDate().toString().padStart(2, '0');

      const daysInMonth = endDate.getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(startDate);
        d.setDate(i);
        datesToGenerate.push(d);
      }
    } else if (periodFilter === 'yearly') {
      startDate = new Date(now.getFullYear() + chartMonthOffset, 0, 1);
      endDate = new Date(now.getFullYear() + chartMonthOffset, 11, 31, 23, 59, 59);
      formatLabel = (d: Date) => d.toLocaleDateString('id-ID', { month: 'short' });
      formatFullDate = (d: Date) => d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

      for (let i = 0; i < 12; i++) {
        const d = new Date(startDate.getFullYear(), i, 1);
        datesToGenerate.push(d);
      }
    }

    let result = datesToGenerate.map(d => ({
      name: formatLabel(d),
      fullDate: formatFullDate(d),
      income: 0,
      expense: 0,
      date: d
    }));

    if (!allTransactions || allTransactions.length === 0) return result;

    const filtered = allTransactions.filter(tx => {
      const d = parseTxDate(tx.tx_date);
      if (!d) return false;
      return d >= startDate && d <= endDate;
    });

    filtered.forEach(tx => {
      const d = parseTxDate(tx.tx_date)!;
      let matchIndex = -1;
      if (periodFilter === 'yearly') {
        matchIndex = result.findIndex(r => r.date.getMonth() === d.getMonth() && r.date.getFullYear() === d.getFullYear());
      } else {
        matchIndex = result.findIndex(r => r.date.getDate() === d.getDate() && r.date.getMonth() === d.getMonth() && r.date.getFullYear() === d.getFullYear());
      }

      if (matchIndex !== -1) {
        if (tx.tx_type === 'Income') result[matchIndex].income += Number(tx.amount || 0);
        if (tx.tx_type === 'Expense') result[matchIndex].expense += Number(tx.amount || 0);
      }
    });

    return result;
  };

  const cashflowData = getFilteredCashflow();

  // Dynamic Insight and Top Expenses
  const renderNow = new Date();

  const insightTargetDate = new Date(renderNow.getFullYear(), renderNow.getMonth() + insightMonthOffset, 1);
  const insightMonthTx = allTransactions.filter(tx => {
    const d = parseTxDate(tx.tx_date);
    if (!d) return false;
    return d.getMonth() === insightTargetDate.getMonth() && d.getFullYear() === insightTargetDate.getFullYear();
  });
  const dynamicInsightIncome = insightMonthTx.filter(tx => tx.tx_type === 'Income').reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  const dynamicInsightExpense = insightMonthTx.filter(tx => tx.tx_type === 'Expense').reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const topExpenseTargetDate = new Date(renderNow.getFullYear(), renderNow.getMonth() + topExpenseMonthOffset, 1);
  const topExpenseMonthTx = allTransactions.filter(tx => {
    const d = parseTxDate(tx.tx_date);
    if (!d) return false;
    return d.getMonth() === topExpenseTargetDate.getMonth() && d.getFullYear() === topExpenseTargetDate.getFullYear();
  });
  const expenseByCategory = topExpenseMonthTx.filter(tx => tx.tx_type === 'Expense').reduce((acc: any, tx: any) => {
    const catId = tx.category_id || 'Lainnya';
    if (!acc[catId]) {
      acc[catId] = {
        id: catId,
        name: catMap[catId]?.name || 'Lainnya',
        icon_name: catMap[catId]?.icon_name || 'tags',
        color_hex: catMap[catId]?.color_hex || '#ef4444',
        amount: 0
      };
    }
    acc[catId].amount += (Number(tx.amount) || 0);
    return acc;
  }, {} as Record<string, any>);
  const dynamicTopExpenses = Object.values(expenseByCategory)
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 5);

  const formatFilterMonth = (offset: number) => {
    return new Date(renderNow.getFullYear(), renderNow.getMonth() + offset, 1).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
  };

  const pieData = [
    { name: 'Pemasukan', value: dynamicInsightIncome || 0, color: '#1EE494' },
    { name: 'Pengeluaran', value: dynamicInsightExpense || 0, color: '#FF4D4D' },
  ].filter(d => d.value > 0);

  const savingRatio = dynamicInsightIncome > 0 ? Math.max(0, Math.round(((dynamicInsightIncome - dynamicInsightExpense) / dynamicInsightIncome) * 100)) : 0;
  const dynamicInsightTotal = dynamicInsightIncome + dynamicInsightExpense;

  return (
    <div className="w-full overflow-x-hidden lg:overflow-x-visible">
      {/* ========================================= */}
      {/* MOBILE LAYOUT (< lg)                     */}
      {/* ========================================= */}
      <div className="block lg:hidden px-4 pt-4 w-full max-w-md mx-auto relative">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {user?.profile_picture_url && !imgError && user?.profile_picture_url !== 'null' ? (
            <img
              src={`${user.profile_picture_url}${imgCacheBuster}`}
              alt="Profile"
              onError={() => setImgError(true)}
              className="w-12 h-12 rounded-full object-cover bg-slate-800 border-2 border-white dark:border-slate-800 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center flex-shrink-0 border-2 border-white dark:border-slate-800">
              <User className="w-6 h-6 text-slate-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-[16px] leading-tight truncate text-[var(--color-text-foreground)]">
              Selamat datang, <span className="text-[var(--color-stabilo)]">{user?.full_name?.split(' ')[0] || 'User'}</span> 👋
            </h2>
            <p className="text-[var(--color-text-muted)] text-[11px]">Berikut ringkasan keuanganmu saat ini</p>
          </div>
        </div>

        {/* Saldo Bersih Hero Card */}
        <div className="glass rounded-2xl p-5 mb-4 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[var(--color-text-muted)] text-xs font-medium">Saldo Bersih</p>
            <button onClick={() => setShowBalance(!showBalance)} className="p-1 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-[var(--color-text-muted)]">
              {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-[28px] font-extrabold text-[var(--color-text-foreground)] tracking-tight leading-none mb-1 truncate pr-2">
            {showBalance ? formatRp(data.net_balance) : 'Rp ••••••••'}
          </p>
          {data?.growth && (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold mt-2 transition-opacity duration-300 ${isBlinking ? 'opacity-0' : 'opacity-100'} ${data.growth[growthIndex].value >= 0 ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>
              {data.growth[growthIndex].value >= 0 ? <ArrowUpRight className="w-3 h-3 stroke-[2.5px]" /> : <ArrowDownRight className="w-3 h-3 stroke-[2.5px]" />}
              {Math.abs(data.growth[growthIndex].value).toFixed(1)}% dari {data.growth[growthIndex].label}
            </div>
          )}

          {/* Sub-cards: Pemasukan & Pengeluaran */}
          <div className="flex gap-2 mt-4">
            <button onClick={() => openModal('Income')} className="flex-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-3 py-2 flex items-center gap-2 active:scale-95 transition-transform">
              <div className="w-8 h-8 rounded-lg bg-positive/10 flex items-center justify-center flex-shrink-0">
                <ArrowDownRight className="w-4 h-4 text-positive stroke-[2.5px]" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[10px] text-[var(--color-text-muted)] leading-tight">Pemasukan</p>
                <p className="font-bold text-[12px] text-[var(--color-text-foreground)] tracking-tight truncate">{showBalance ? formatRp(data.total_income) : 'Rp ••••'}</p>
              </div>
            </button>
            <button onClick={() => openModal('Expense')} className="flex-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-3 py-2 flex items-center gap-2 active:scale-95 transition-transform">
              <div className="w-8 h-8 rounded-lg bg-negative/10 flex items-center justify-center flex-shrink-0">
                <ArrowUpRight className="w-4 h-4 text-negative stroke-[2.5px]" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[10px] text-[var(--color-text-muted)] leading-tight">Pengeluaran</p>
                <p className="font-bold text-[12px] text-[var(--color-text-foreground)] tracking-tight truncate">{showBalance ? formatRp(data.total_expense) : 'Rp ••••'}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Row 2: Akun Rekening + Insight Side by Side */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Akun Rekening */}
          <div className="glass rounded-2xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-medium text-[var(--color-text-foreground)]">Akun Rekening</h3>
              <button onClick={() => navigate('/accounts')} className="text-[10px] text-positive font-medium">Lihat Semua</button>
            </div>
            <div className="relative flex-1 [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]">
              <div className="flex flex-col gap-2 overflow-y-auto scrollbar-hide max-h-[220px] pb-4">
                {data.accounts && data.accounts.length > 0 ? data.accounts.map((acc: any, i: number) => (
                  <div key={i} className="rounded-xl p-3 flex flex-col justify-between text-white min-h-[80px] relative overflow-hidden flex-shrink-0" style={{ background: getBankColor(acc.account_name, acc.color_hex) }}>
                    <div className="flex justify-between items-start z-10 relative">
                      <div>
                        <span className="font-semibold text-[11px] block leading-tight">{acc.account_name}</span>
                        <span className="text-[9px] text-white/60 tracking-widest mt-0.5 block">•••• 1234</span>
                      </div>
                      <button className="text-white/50 hover:text-white"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                    </div>
                    <p className="font-bold text-sm drop-shadow-md z-10 relative mt-2">{showBalance ? formatRp(acc.initial_balance) : 'Rp ••••••••'}</p>
                    <div className="absolute right-0 bottom-0 opacity-15 translate-x-2 translate-y-2 pointer-events-none">
                      <Landmark className="w-[50px] h-[50px]" />
                    </div>
                  </div>
                )) : (
                  <div className="flex-1 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-[10px] text-[var(--color-text-muted)] border border-dashed border-black/10 dark:border-white/10 min-h-[80px]">Belum ada rekening</div>
                )}
              </div>
            </div>
          </div>

          {/* Insight Bulan Ini */}
          <div className="glass rounded-2xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-medium text-[var(--color-text-foreground)]">Insight Bulanan</h3>
                <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-md px-1 h-[22px]">
                  <button onClick={() => setInsightMonthOffset(p => p - 1)} className="px-1.5 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)]">&lt;</button>
                  <span className="text-[9px] min-w-[50px] text-center text-[var(--color-text-foreground)]">{formatFilterMonth(insightMonthOffset)}</span>
                  <button onClick={() => setInsightMonthOffset(p => p + 1)} disabled={insightMonthOffset >= 0} className={`px-1.5 text-[10px] ${insightMonthOffset >= 0 ? 'opacity-30 text-[var(--color-text-muted)] cursor-not-allowed' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)]'}`}>&gt;</button>
                </div>
              </div>
              <button className="text-[var(--color-text-muted)]"><MoreHorizontal className="w-3.5 h-3.5" /></button>
            </div>
            {pieData.length > 0 ? (
              <div className="flex flex-col items-center flex-1">
                <div className="w-[100px] h-[100px] relative flex-shrink-0 mb-3">
                  <div className="absolute inset-2 rounded-full bg-[#1EE494] opacity-[0.12] blur-[12px] animate-[pulse_4s_ease-in-out_infinite]" />
                  <ResponsiveContainer width="100%" height="100%" style={{ overflow: 'visible' }}>
                    <PieChart style={{ overflow: 'visible' }}>
                      <Tooltip content={<PieCustomTooltip total={dynamicInsightTotal} />} cursor={false} wrapperStyle={{ zIndex: 100 }} />
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius="60%" outerRadius="88%" paddingAngle={2} dataKey="value" stroke="none">
                        {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-extrabold leading-none">{dynamicInsightTotal > 0 ? Math.round((dynamicInsightIncome / dynamicInsightTotal) * 100) : 0}%</span>
                    <span className="text-[7px] text-[var(--color-text-muted)] mt-0.5 font-medium">Pemasukan</span>
                  </div>
                </div>
                <div className="w-full space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-positive" /><span className="text-[var(--color-text-muted)]">Pemasukan</span></div>
                    <span className="text-positive font-semibold">{formatRp(dynamicInsightIncome)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-negative" /><span className="text-[var(--color-text-muted)]">Pengeluaran</span></div>
                    <span className="text-negative font-semibold">{formatRp(dynamicInsightExpense)}</span>
                  </div>
                </div>
                <div className="w-full mt-3 pt-3 border-t border-black/5 dark:border-white/5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[var(--color-text-muted)]">Rasio Tabungan</span>
                    <span className="font-bold text-[var(--color-text-foreground)]">{savingRatio}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-[var(--color-text-muted)] text-center py-6 flex-1 flex items-center justify-center">Belum ada data</p>
            )}
          </div>
        </div>

        {/* Arus Kas Chart */}
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex flex-col gap-3 mb-3">
            <h3 className="text-xs font-medium text-[var(--color-text-foreground)]">Arus Kas Masuk/Keluar</h3>
            <div className="flex items-center gap-2">
              <ModernDropdown
                value={periodFilter}
                onChange={(val) => { setPeriodFilter(val); setChartMonthOffset(0); }}
                options={[
                  { value: 'weekly', label: 'Mingguan' },
                  { value: 'monthly', label: 'Bulanan' },
                  { value: 'yearly', label: 'Tahunan' }
                ]}
                className="w-28 flex-shrink-0"
                buttonClassName="!h-[28px] !text-[10px] !px-2"
              />
              <div className="flex items-center bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-lg border border-black/10 dark:border-white/10 h-[28px] flex-1 max-w-[200px]">
                <button onClick={() => setChartMonthOffset(prev => prev - 1)} className="px-2.5 h-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors rounded-l-lg border-r border-black/10 dark:border-white/10 text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)] text-[10px] flex items-center justify-center">
                  &lt;
                </button>
                <span className="text-[10px] px-2 font-medium flex-1 text-center text-[var(--color-text-foreground)] flex items-center justify-center h-full">
                  {getPeriodLabel()}
                </span>
                <button onClick={() => setChartMonthOffset(prev => prev + 1)} disabled={chartMonthOffset >= 0} className={`px-2.5 h-full transition-colors rounded-r-lg border-l border-black/10 dark:border-white/10 text-[10px] flex items-center justify-center ${chartMonthOffset >= 0 ? 'opacity-30 cursor-not-allowed text-[var(--color-text-muted)]' : 'hover:bg-black/5 dark:hover:bg-white/10 hover:text-[var(--color-text-foreground)] text-[var(--color-text-muted)]'}`}>
                  &gt;
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] mb-3">
            <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-positive rounded-full inline-block" /> Pemasukan</span>
            <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-negative rounded-full inline-block" /> Pengeluaran</span>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
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
                <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="4 4" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} interval={periodFilter === 'monthly' ? 0 : 'preserveStartEnd'} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }} tickLine={false} tickFormatter={formatAxisTick} width={35} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#mIncome)" name="Pemasukan" />
                <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#mExpense)" name="Pengeluaran" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Pengeluaran */}
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-medium text-[var(--color-text-foreground)]">Top Pengeluaran</h3>
              <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-md px-1 h-[22px]">
                <button onClick={() => setTopExpenseMonthOffset(p => p - 1)} className="px-1.5 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)]">&lt;</button>
                <span className="text-[9px] min-w-[50px] text-center text-[var(--color-text-foreground)]">{formatFilterMonth(topExpenseMonthOffset)}</span>
                <button onClick={() => setTopExpenseMonthOffset(p => p + 1)} disabled={topExpenseMonthOffset >= 0} className={`px-1.5 text-[10px] ${topExpenseMonthOffset >= 0 ? 'opacity-30 text-[var(--color-text-muted)] cursor-not-allowed' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)]'}`}>&gt;</button>
              </div>
            </div>
            <button onClick={() => navigate('/transactions')} className="text-[10px] text-positive font-medium">Lihat Semua</button>
          </div>
          <div className="space-y-4">
            {dynamicTopExpenses && dynamicTopExpenses.length > 0 ? dynamicTopExpenses.map((cat: any, i: number) => {
              const maxAmt = Math.max(...dynamicTopExpenses.map((c: any) => c.amount));
              const pct = maxAmt > 0 ? (cat.amount / maxAmt) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color_hex}15`, color: cat.color_hex }}>
                    {(() => {
                      const IconComp = ICON_MAP[cat.icon_name] || Tags;
                      return <IconComp className="w-4 h-4" style={{ color: cat.color_hex }} />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline text-[11px] mb-1">
                      <span className="text-[var(--color-text-foreground)] font-medium truncate pr-2">{cat.name}</span>
                      <span className="font-semibold whitespace-nowrap text-[var(--color-text-foreground)]">{formatRp(cat.amount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.color_hex, boxShadow: `0 0 6px ${cat.color_hex}` }} />
                      </div>
                      <span className="text-[9px] text-[var(--color-text-muted)] w-7 text-right">{Math.round(pct)}%</span>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-[11px] text-[var(--color-text-muted)] text-center py-4">Belum ada pengeluaran</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-medium text-[var(--color-text-foreground)]">Transaksi Terbaru</h3>
            <button onClick={() => navigate('/transactions')} className="text-[10px] text-positive font-medium">Lihat Semua</button>
          </div>
          <div className="space-y-2">
            {data.recent_transactions?.map((tx: any, i: number) => {
              const IconComp = ICON_MAP[tx.icon_name] || (tx.tx_type === 'Income' ? ArrowDownRight : ArrowUpRight);
              const d = parseTxDate(tx.tx_date);
              const formattedDate = d ? d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : tx.tx_date;
              return (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tx.color_hex}15`, color: tx.color_hex }}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-[var(--color-text-foreground)] truncate">{tx.note || tx.category_name}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] truncate">{tx.category_name} • {formattedDate}</p>
                    </div>
                  </div>
                  <p className={`text-[12px] font-semibold flex-shrink-0 ml-2 ${tx.tx_type === 'Income' ? 'text-positive' : 'text-negative'}`}>
                    {tx.tx_type === 'Income' ? '+' : '-'}{formatRp(tx.amount)}
                  </p>
                </div>
              );
            })}
            {(!data.recent_transactions || data.recent_transactions.length === 0) && (
              <p className="text-center text-[var(--color-text-muted)] text-[11px] py-4">Belum ada transaksi</p>
            )}
          </div>
        </div>

      </div>


      {/* ========================================= */}
      {/* DESKTOP LAYOUT (>= lg)                   */}
      {/* ========================================= */}
      <div className="hidden lg:block w-full">
        {/* Full-width sticky header */}
        <div className="sticky top-0 z-50 w-full bg-[var(--color-background)]/90 backdrop-blur-md pt-4 lg:pt-4 px-4 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between pb-4 lg:pb-6">
            <div className="flex items-center gap-4">
              {user?.profile_picture_url && !imgError && user.profile_picture_url !== 'null' ? (
                <img
                  src={`${user.profile_picture_url}${imgCacheBuster}`}
                  alt="Profile"
                  onError={() => setImgError(true)}
                  className="w-16 h-16 lg:w-[72px] lg:h-[72px] rounded-full object-cover bg-slate-800 border-[3px] border-white dark:border-slate-800 shadow-lg shadow-black/20"
                />
              ) : (
                <div className="w-16 h-16 lg:w-[72px] lg:h-[72px] rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center border-[3px] border-white dark:border-slate-800">
                  <User className="w-8 h-8 text-slate-500" />
                </div>
              )}
              <div>
                <h2 className="text-[28px] lg:text-[32px] font-extrabold tracking-tight mb-1">
                  Selamat datang, <span className="text-[var(--color-stabilo)]">{user?.full_name?.split(' ')[0] || 'User'}</span> 👋
                </h2>
                <p className="text-[var(--color-text-muted)] text-[15px]">Berikut ringkasan keuanganmu saat ini</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => openModal()} className="bg-[var(--color-stabilo)] hover:bg-[#d4ff00]/80 text-[#0B101E] px-6 py-3 rounded-2xl font-bold transition-colors shadow-[0_0_20px_var(--color-glow-stabilo)] flex items-center gap-2">
                <Plus className="w-5 h-5" /> Catat Transaksi
              </button>
            </div>
          </div>
          <div className="absolute top-full left-0 right-0 h-10 bg-gradient-to-b from-[var(--color-background)]/90 to-transparent pointer-events-none" />
        </div>

        {/* Constrained main content */}
        <div className="w-full max-w-7xl mx-auto p-4 lg:p-8 pt-[15px] lg:pt-[15px] mt-[15px] space-y-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            {/* Row 1: Saldo Bersih, Akun Rekening, Insight Bulan Ini */}

            {/* Saldo Bersih */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="glass hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 rounded-3xl p-8 relative overflow-hidden flex-1 flex flex-col justify-between min-h-[300px]">
                <div className="absolute top-6 right-6 p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10">
                  <Wallet className="w-8 h-8 text-slate-500 dark:text-slate-300" />
                </div>
                <div className="z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-[var(--color-text-muted)] text-[15px] font-medium">Saldo Bersih</h3>
                    <button onClick={() => setShowBalance(!showBalance)} className="p-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-[var(--color-text-muted)]">
                      {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[42px] font-extrabold tracking-tight mb-4 leading-none text-[var(--color-text-foreground)] truncate pr-16">{showBalance ? formatRp(data.net_balance) : 'Rp ••••••••'}</p>
                  {data?.growth && (
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-opacity duration-300 ${isBlinking ? 'opacity-0' : 'opacity-100'} ${data.growth[growthIndex].value >= 0 ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>
                      {data.growth[growthIndex].value >= 0 ? <ArrowUpRight className="w-4 h-4 stroke-[2.5px]" /> : <ArrowDownRight className="w-4 h-4 stroke-[2.5px]" />}
                      {Math.abs(data.growth[growthIndex].value).toFixed(1)}% dari {data.growth[growthIndex].label}
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-6 flex flex-row items-center gap-2 xl:gap-3 z-10 relative w-full">
                  <div className="flex-1 min-w-0 bg-black/5 dark:bg-white/5 rounded-xl xl:rounded-[20px] px-2 py-1.5 lg:px-3 lg:py-2 xl:px-4 xl:py-2.5 flex items-center gap-1.5 lg:gap-2 xl:gap-3 shadow-sm border border-black/5 dark:border-white/5 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20 hover:border-black/10 dark:hover:border-white/10 transition-all duration-300 cursor-pointer">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 xl:w-11 xl:h-11 rounded-lg xl:rounded-[14px] bg-positive/10 flex items-center justify-center flex-shrink-0">
                      <ArrowDownRight className="w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-positive stroke-[2.5px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] lg:text-[11px] xl:text-[13px] text-[var(--color-text-muted)] mb-0.5 truncate">Pemasukan</p>
                      <p className="font-bold text-[11px] lg:text-[12px] xl:text-[15px] text-[var(--color-text-foreground)] tracking-tight leading-tight">{showBalance ? formatRp(data.total_income) : 'Rp ••••'}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 bg-black/5 dark:bg-white/5 rounded-xl xl:rounded-[20px] px-2 py-1.5 lg:px-3 lg:py-2 xl:px-4 xl:py-2.5 flex items-center gap-1.5 lg:gap-2 xl:gap-3 shadow-sm border border-black/5 dark:border-white/5 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20 hover:border-black/10 dark:hover:border-white/10 transition-all duration-300 cursor-pointer">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 xl:w-11 xl:h-11 rounded-lg xl:rounded-[14px] bg-negative/10 flex items-center justify-center flex-shrink-0">
                      <ArrowUpRight className="w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-negative stroke-[2.5px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] lg:text-[11px] xl:text-[13px] text-[var(--color-text-muted)] mb-0.5 truncate">Pengeluaran</p>
                      <p className="font-bold text-[11px] lg:text-[12px] xl:text-[15px] text-[var(--color-text-foreground)] tracking-tight leading-tight">{showBalance ? formatRp(data.total_expense) : 'Rp ••••'}</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-[150px] opacity-40 pointer-events-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.cashflow || []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="glowWave" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-stabilo)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="var(--color-stabilo)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="income" stroke="var(--color-stabilo)" strokeWidth={3} fill="url(#glowWave)" fillOpacity={1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Akun Rekening */}
            <div className="lg:col-span-3 flex flex-col">
              <div className="glass hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 rounded-2xl p-6 flex-1 flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-[var(--color-text-foreground)]">Akun Rekening</h3>
                  <button onClick={() => navigate('/accounts')} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)]">Lihat Semua</button>
                </div>
                {/* Mobile: horizontal scroll with gradient fade */}
                <div className="relative flex-1 lg:max-h-[210px] lg:[mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)] lg:[-webkit-mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]">
                  {/* Left/Right gradient fade for mobile scroll indication */}
                  <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[var(--color-glass-bg)] to-transparent z-10 lg:hidden" />
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[var(--color-glass-bg)] to-transparent z-10 lg:hidden" />

                  <div className="h-full flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto scrollbar-hide pb-2 lg:pb-6 px-1 lg:px-0">
                    {data.accounts && data.accounts.length > 0 ? data.accounts.map((acc: any, i: number) => (
                      <div key={i} className="rounded-2xl p-5 flex-shrink-0 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden text-white min-h-[120px] w-[160px] lg:w-auto" style={{ background: getBankColor(acc.account_name, acc.color_hex) }}>
                        <div className="flex justify-between items-start z-10 relative mb-3">
                          <div>
                            <span className="font-semibold text-[15px] block">{acc.account_name}</span>
                            <span className="text-[11px] text-white/70 tracking-widest mt-0.5 block">•••• 1234</span>
                          </div>
                        </div>
                        <p className="font-bold text-xl drop-shadow-md z-10 relative">{showBalance ? formatRp(acc.initial_balance) : 'Rp ••••••••'}</p>
                        {/* Subtle bank icon overlay */}
                        <div className="absolute right-0 bottom-0 opacity-15 translate-x-3 translate-y-4 pointer-events-none">
                          <Landmark className="w-[100px] h-[100px]" />
                        </div>
                      </div>
                    )) : (
                      <div className="flex-1 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-sm text-[var(--color-text-muted)] border border-black/5 dark:border-white/10">Belum ada rekening</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Insight Bulan Ini */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="glass hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 rounded-2xl p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-medium text-[var(--color-text-foreground)]">Insight Bulanan</h3>
                  <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-md px-1.5 h-[28px]">
                    <button onClick={() => setInsightMonthOffset(p => p - 1)} className="px-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)]">&lt;</button>
                    <span className="text-[11px] min-w-[70px] text-center font-medium text-[var(--color-text-foreground)]">{formatFilterMonth(insightMonthOffset)}</span>
                    <button onClick={() => setInsightMonthOffset(p => p + 1)} disabled={insightMonthOffset >= 0} className={`px-2 text-xs ${insightMonthOffset >= 0 ? 'opacity-30 text-[var(--color-text-muted)] cursor-not-allowed' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)]'}`}>&gt;</button>
                  </div>
                </div>
                {pieData.length > 0 ? (
                  <div className="flex flex-row items-center justify-between flex-1 gap-4">
                    <div className="w-[120px] h-[120px] xl:w-[160px] xl:h-[160px] relative flex-shrink-0">
                      <div className="absolute inset-3 rounded-full bg-[#1EE494] opacity-[0.15] blur-[20px] animate-[pulse_4s_ease-in-out_infinite]" />
                      <ResponsiveContainer width="100%" height="100%" style={{ overflow: 'visible' }}>
                        <PieChart style={{ overflow: 'visible' }}>
                          <Tooltip content={<PieCustomTooltip total={dynamicInsightTotal} />} cursor={false} wrapperStyle={{ zIndex: 100 }} />
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" paddingAngle={0} dataKey="value" stroke="none">
                            {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl xl:text-3xl font-extrabold">{dynamicInsightTotal > 0 ? Math.round((dynamicInsightIncome / dynamicInsightTotal) * 100) : 0}%</span>
                        <span className="text-[9px] xl:text-[10px] text-[var(--color-text-muted)] mt-1 font-medium tracking-wide">Pemasukan</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-positive shadow-[0_0_5px_var(--color-positive)]" />
                          <span className="text-xs text-[var(--color-text-muted)]">Pemasukan</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-positive">{formatRp(dynamicInsightIncome)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-negative shadow-[0_0_5px_var(--color-negative)]" />
                          <span className="text-xs text-[var(--color-text-muted)]">Pengeluaran</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-negative">{formatRp(dynamicInsightExpense)}</span>
                        </div>
                      </div>

                      <div className="bg-black/5 dark:bg-white/5 rounded-xl px-4 py-2.5 border border-black/5 dark:border-white/10 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-[var(--color-text-muted)]">Rasio Tabungan</span>
                          <span className="text-xs font-bold">{savingRatio}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-[#6366f1] rounded-full shadow-[0_0_8px_#6366f1] transition-all" style={{ width: `${savingRatio}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-8 flex-1 flex items-center justify-center">Belum ada data bulan ini</p>
                )}
              </div>
            </div>

            {/* Row 2: Arus Kas, Top Pengeluaran */}

            {/* Chart Widget */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="glass hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 rounded-2xl p-6 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <h3 className="font-medium text-[var(--color-text-foreground)]">Arus Kas Masuk/Keluar</h3>
                    <div className="flex items-center gap-2">
                      <ModernDropdown
                        value={periodFilter}
                        onChange={(val) => { setPeriodFilter(val); setChartMonthOffset(0); }}
                        options={[
                          { value: 'weekly', label: 'Mingguan' },
                          { value: 'monthly', label: 'Bulanan' },
                          { value: 'yearly', label: 'Tahunan' }
                        ]}
                        className="w-32"
                        buttonClassName="!h-[32px] !text-xs !px-3"
                      />
                      <div className="flex items-center bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-lg border border-black/10 dark:border-white/10 h-[32px]">
                        <button onClick={() => setChartMonthOffset(prev => prev - 1)} className="px-3 h-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors rounded-l-lg border-r border-black/10 dark:border-white/10 text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)] flex items-center justify-center">
                          &lt;
                        </button>
                        <span className="text-xs px-3 font-medium min-w-[120px] text-center text-[var(--color-text-foreground)] flex items-center justify-center h-full">
                          {getPeriodLabel()}
                        </span>
                        <button onClick={() => setChartMonthOffset(prev => prev + 1)} disabled={chartMonthOffset >= 0} className={`px-3 h-full transition-colors rounded-r-lg border-l border-black/10 dark:border-white/10 flex items-center justify-center ${chartMonthOffset >= 0 ? 'opacity-30 cursor-not-allowed text-[var(--color-text-muted)]' : 'hover:bg-black/5 dark:hover:bg-white/10 hover:text-[var(--color-text-foreground)] text-[var(--color-text-muted)]'}`}>
                          &gt;
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-positive rounded-full shadow-[0_0_4px_var(--color-positive)] inline-block" /> Pemasukan</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-negative rounded-full shadow-[0_0_4px_var(--color-negative)] inline-block" /> Pengeluaran</span>
                  </div>
                </div>
                <div className="w-full flex-1 min-h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cashflowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1EE494" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#1EE494" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="dExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF4D4D" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#FF4D4D" stopOpacity={0} />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>
                      <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="4 4" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#ffffff20' }} tickLine={false} dy={10} interval={periodFilter === 'monthly' ? 0 : 'preserveStartEnd'} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }} tickLine={false} tickFormatter={formatAxisTick} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="income" stroke="#1EE494" strokeWidth={2} fillOpacity={1} fill="url(#dIncome)" name="Pemasukan" style={{ filter: 'url(#glow)' }} />
                      <Area type="monotone" dataKey="expense" stroke="#FF4D4D" strokeWidth={2} fillOpacity={1} fill="url(#dExpense)" name="Pengeluaran" style={{ filter: 'url(#glow)' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top Pengeluaran */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="glass hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 rounded-2xl p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--color-stabilo)]/10 text-[var(--color-stabilo)] rounded-xl border border-[var(--color-stabilo)]/20 shadow-[0_0_15px_rgba(204,255,0,0.1)]">
                      <Crown className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium text-[var(--color-text-foreground)]">Top Pengeluaran</h3>
                  </div>
                  <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-md px-1.5 h-[28px]">
                    <button onClick={() => setTopExpenseMonthOffset(p => p - 1)} className="px-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)]">&lt;</button>
                    <span className="text-[11px] min-w-[70px] text-center font-medium text-[var(--color-text-foreground)]">{formatFilterMonth(topExpenseMonthOffset)}</span>
                    <button onClick={() => setTopExpenseMonthOffset(p => p + 1)} disabled={topExpenseMonthOffset >= 0} className={`px-2 text-xs ${topExpenseMonthOffset >= 0 ? 'opacity-30 text-[var(--color-text-muted)] cursor-not-allowed' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)]'}`}>&gt;</button>
                  </div>
                </div>
                <div className="space-y-5 flex-1">
                  {dynamicTopExpenses && dynamicTopExpenses.length > 0 ? dynamicTopExpenses.map((cat: any, i: number) => {
                    const maxAmt = Math.max(...dynamicTopExpenses.map((c: any) => c.amount));
                    const pct = maxAmt > 0 ? (cat.amount / maxAmt) * 100 : 0;
                    return (
                      <div key={i} className="group">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color_hex}15`, color: cat.color_hex }}>
                            {(() => {
                              const IconComp = ICON_MAP[cat.icon_name] || Tags;
                              return <IconComp className="w-4 h-4" style={{ color: cat.color_hex }} />;
                            })()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-[var(--color-text-foreground)] font-medium truncate pr-2">{cat.name}</span>
                              <span className="font-semibold whitespace-nowrap">{formatRp(cat.amount)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.color_hex, boxShadow: `0 0 8px ${cat.color_hex}` }} />
                              </div>
                              <span className="text-[10px] text-[var(--color-text-muted)] ml-3 w-8 text-right">{Math.round(pct)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-sm text-slate-500 text-center py-4 flex-1 flex items-center justify-center">Belum ada pengeluaran</p>
                  )}
                </div>

              </div>
            </div>

            {/* Row 3: Transaksi Terbaru */}
            <div className="lg:col-span-12">
              <div className="glass rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-medium text-[var(--color-text-foreground)]">Transaksi Terbaru</h3>
                  <button onClick={() => navigate('/transactions')} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)]">Lihat Semua</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.recent_transactions?.map((tx: any, i: number) => {
                    const IconComp = ICON_MAP[tx.icon_name] || (tx.tx_type === 'Income' ? ArrowDownRight : ArrowUpRight);
                    const d = parseTxDate(tx.tx_date);
                    const formattedDate = d ? d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : tx.tx_date;
                    return (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tx.color_hex}15`, color: tx.color_hex }}>
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[var(--color-text-foreground)] truncate">{tx.note || tx.category_name}</p>
                            <p className="text-xs text-[var(--color-text-muted)] truncate">{tx.category_name} • {formattedDate}</p>
                          </div>
                        </div>
                        <p className={`text-sm font-semibold flex-shrink-0 ml-2 ${tx.tx_type === 'Income' ? 'text-positive' : 'text-negative'}`}>
                          {tx.tx_type === 'Income' ? '+' : '-'}{formatRp(tx.amount)}
                        </p>
                      </div>
                    );
                  })}
                  {(!data.recent_transactions || data.recent_transactions.length === 0) && (
                    <div className="col-span-full text-center text-slate-500 py-6">Belum ada transaksi</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={loadData} initialData={modalInitialData} />
      {showOnboarding && (
        <OnboardingModal onClose={() => {
          setShowOnboarding(false);
          localStorage.setItem('finoza_onboarded', 'true');
        }} />
      )}
    </div>
  );
}
