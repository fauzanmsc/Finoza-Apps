import { useState, useEffect, useMemo } from 'react';
import { Calendar, Loader2, FileText } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';

export default function Journal() {
  const [txs, setTxs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const token = useAuth(state => state.token);

  useEffect(() => {
    loadTxs();
  }, []);

  const loadTxs = async () => {
    setIsLoading(true);
    const res = await fetchApi('GET_TRANSACTIONS', {}, token!);
    if (res.status === 'success') {
      setTxs(res.data || []);
    }
    setIsLoading(false);
  };

  const filteredTxs = useMemo(() => {
    return txs.filter(tx => {
      if (!tx.tx_date) return false;
      const tDate = tx.tx_date.split('T')[0];
      return tDate >= startDate && tDate <= endDate;
    }).sort((a, b) => new Date(a.tx_date).getTime() - new Date(b.tx_date).getTime());
  }, [txs, startDate, endDate]);

  const { totalDebit, totalKredit } = useMemo(() => {
    let debit = 0;
    let kredit = 0;
    filteredTxs.forEach(tx => {
      if (tx.tx_type === 'Income') debit += Number(tx.amount || 0);
      else if (tx.tx_type === 'Expense') kredit += Number(tx.amount || 0);
    });
    return { totalDebit: debit, totalKredit: kredit };
  }, [filteredTxs]);

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-stabilo)]" /></div>;
  }

  return (
    <div className="p-4 lg:p-8 w-full max-w-6xl mx-auto space-y-4 lg:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold">Jurnal Keuangan</h2>
          <p className="text-[10px] lg:text-sm text-[var(--color-text-muted)]">Ringkasan transaksi dalam format debit dan kredit.</p>
        </div>
        
        <div className="w-full lg:w-auto">
          <div className="flex flex-col sm:flex-row items-center gap-2 bg-surface-light border border-black/5 dark:border-white/5 rounded-xl p-2 w-full">
            <div className="relative w-full sm:w-auto">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-auto bg-transparent py-2 pl-9 pr-3 text-sm focus:outline-none text-[var(--color-text-foreground)]"
              />
            </div>
            <span className="hidden sm:block text-[var(--color-text-muted)]">-</span>
            <div className="relative w-full sm:w-auto">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-auto bg-transparent py-2 pl-9 pr-3 text-sm focus:outline-none text-[var(--color-text-foreground)]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-surface-light/50 text-[var(--color-text-muted)] border-b border-white/5">
                <th className="px-4 py-3 lg:px-6 lg:py-4 font-semibold">Tanggal</th>
                <th className="px-4 py-3 lg:px-6 lg:py-4 font-semibold">Keterangan / Kategori</th>
                <th className="px-4 py-3 lg:px-6 lg:py-4 font-semibold">Rekening</th>
                <th className="px-4 py-3 lg:px-6 lg:py-4 font-semibold text-right">Debit (Masuk)</th>
                <th className="px-4 py-3 lg:px-6 lg:py-4 font-semibold text-right">Kredit (Keluar)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    Belum ada data jurnal pada rentang tanggal ini.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx: any, i: number) => (
                  <tr key={tx.id || i} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 lg:px-6 lg:py-4 text-slate-300">
                      {new Date(tx.tx_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 lg:px-6 lg:py-4">
                      <p className="font-medium text-[var(--color-text-foreground)]">{tx.note || 'Transaksi'}</p>
                      {tx.category_id && <p className="text-[10px] lg:text-xs text-[var(--color-text-muted)]">{tx.category_id}</p>}
                    </td>
                    <td className="px-4 py-3 lg:px-6 lg:py-4 text-slate-300">
                      {tx.account_src_id || '-'}
                    </td>
                    <td className="px-4 py-3 lg:px-6 lg:py-4 text-right text-positive font-medium">
                      {tx.tx_type === 'Income' ? formatRp(tx.amount) : '-'}
                    </td>
                    <td className="px-4 py-3 lg:px-6 lg:py-4 text-right text-negative font-medium">
                      {tx.tx_type === 'Expense' ? formatRp(tx.amount) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredTxs.length > 0 && (
              <tfoot className="bg-surface-light border-t-2 border-[var(--color-stabilo)]/20">
                <tr>
                  <td colSpan={3} className="px-4 py-3 lg:px-6 lg:py-4 text-right font-bold text-[var(--color-text-foreground)]">
                    Total Periode Ini
                  </td>
                  <td className="px-4 py-3 lg:px-6 lg:py-4 text-right font-bold text-positive text-sm lg:text-base">
                    {formatRp(totalDebit)}
                  </td>
                  <td className="px-4 py-3 lg:px-6 lg:py-4 text-right font-bold text-negative text-sm lg:text-base">
                    {formatRp(totalKredit)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
