import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';

const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

interface ReportOverviewProps {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
}

export default function ReportOverview({ totalIncome, totalExpense, netIncome }: ReportOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="glass p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-positive/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
        <div className="flex items-center justify-between mb-4 relative">
          <p className="text-sm font-medium text-slate-400">Total Pemasukan</p>
          <div className="w-10 h-10 rounded-full bg-positive/20 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5 text-positive" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-positive relative">{formatRp(totalIncome)}</h3>
      </div>

      <div className="glass p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-negative/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
        <div className="flex items-center justify-between mb-4 relative">
          <p className="text-sm font-medium text-slate-400">Total Pengeluaran</p>
          <div className="w-10 h-10 rounded-full bg-negative/20 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-negative" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-negative relative">{formatRp(totalExpense)}</h3>
      </div>

      <div className="glass p-5 rounded-2xl border border-[var(--color-stabilo)]/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-stabilo)]/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
        <div className="flex items-center justify-between mb-4 relative">
          <p className="text-sm font-medium text-slate-400">Net (Bersih)</p>
          <div className="w-10 h-10 rounded-full bg-[var(--color-stabilo)]/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-[var(--color-stabilo)]" />
          </div>
        </div>
        <h3 className={`text-2xl font-bold relative ${netIncome >= 0 ? 'text-[var(--color-text-foreground)]' : 'text-negative'}`}>
          {formatRp(netIncome)}
        </h3>
      </div>
    </div>
  );
}
