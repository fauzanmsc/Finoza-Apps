import { useState, useEffect, useMemo } from 'react';
import { Calendar, Loader2, FileText, ArrowUpDown, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';
import ModernDatePicker from '../components/ui/ModernDatePicker';

export default function Journal() {
  const [txs, setTxs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const token = useAuth(state => state.token);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [txRes, catRes, accRes] = await Promise.all([
      fetchApi('GET_TRANSACTIONS', {}, token!),
      fetchApi('GET_CATEGORIES', {}, token!),
      fetchApi('GET_ACCOUNTS', {}, token!)
    ]);
    
    if (txRes.status === 'success') setTxs(txRes.data || []);
    if (catRes.status === 'success') setCategories(catRes.data || []);
    if (accRes.status === 'success') setAccounts(accRes.data || []);
    setIsLoading(false);
  };

  const filteredTxs = useMemo(() => {
    return txs.filter(tx => {
      if (!tx.tx_date) return false;
      const tDate = tx.tx_date.split('T')[0];
      return tDate >= startDate && tDate <= endDate;
    }).sort((a, b) => {
      const diff = new Date(a.tx_date).getTime() - new Date(b.tx_date).getTime();
      return sortOrder === 'asc' ? diff : -diff;
    });
  }, [txs, startDate, endDate, sortOrder]);

  const catMap = useMemo(() => categories.reduce((acc: any, c: any) => ({ ...acc, [c.id]: c }), {}), [categories]);
  const accMap = useMemo(() => accounts.reduce((acc: any, a: any) => ({ ...acc, [a.id]: a }), {}), [accounts]);

  const { totalDebit, totalKredit } = useMemo(() => {
    let debit = 0;
    let kredit = 0;
    filteredTxs.forEach(tx => {
      if (tx.tx_type === 'Income') debit += Number(tx.amount || 0);
      else if (tx.tx_type === 'Expense') kredit += Number(tx.amount || 0);
    });
    return { totalDebit: debit, totalKredit: kredit };
  }, [filteredTxs]);

  const handleExportExcel = () => {
    const headers = ['Tanggal', 'Keterangan / Kategori', 'Rekening', 'Debit (Masuk)', 'Kredit (Keluar)'];
    const rows = filteredTxs.map(tx => {
      const date = tx.tx_date ? tx.tx_date.split('T')[0] : '-';
      const catName = catMap[tx.category_id]?.name || tx.category_id || (tx.tx_type === 'Transfer' ? 'Transfer' : tx.tx_type);
      const note = tx.note ? `${tx.note} - ${catName}` : catName;
      const accName = accMap[tx.account_src_id]?.account_name || tx.account_src_id;
      const debit = tx.tx_type === 'Income' ? Number(tx.amount || 0) : 0;
      const kredit = tx.tx_type === 'Expense' ? Number(tx.amount || 0) : 0;
      return [date, note, accName, debit, kredit];
    });
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jurnal Keuangan");
    XLSX.writeFile(workbook, `Jurnal_Keuangan_${startDate}_${endDate}.xlsx`);
  };

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
        
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-surface-light border border-black/5 dark:border-white/5 rounded-xl px-1.5 sm:px-2 h-10 sm:h-11 w-full sm:w-auto shadow-sm box-border">
            <div className="relative flex-1 h-full flex items-center min-w-[120px]">
              <ModernDatePicker 
                value={startDate}
                onChange={setStartDate}
                placeholder="Tanggal Awal"
                align="left"
              />
            </div>
            <span className="text-[var(--color-text-muted)] text-xs sm:text-sm font-medium opacity-50">-</span>
            <div className="relative flex-1 h-full flex items-center min-w-[120px]">
              <ModernDatePicker 
                value={endDate}
                onChange={setEndDate}
                placeholder="Tanggal Akhir"
                align="right"
              />
            </div>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 sm:p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors border border-black/10 dark:border-white/10 flex-shrink-0 bg-white/50 dark:bg-black/20 shadow-sm relative z-10 my-auto"
              title="Urutkan Tanggal"
            >
              <ArrowUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)]" />
            </button>
          </div>
          
          <button 
            onClick={handleExportExcel}
            className="w-full sm:w-auto h-10 sm:h-11 bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] box-border"
          >
            <Download className="w-4 h-4" /> Export Data
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-xl">
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto relative">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-white dark:bg-[#1a1f2e] text-[var(--color-text-muted)] border-b border-black/10 dark:border-white/10">
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
                filteredTxs.map((tx: any, i: number) => {
                  const txDate = tx.tx_date ? tx.tx_date.split('T')[0] : '-';
                  const catName = catMap[tx.category_id]?.name || tx.category_id;
                  const accName = accMap[tx.account_src_id]?.account_name || tx.account_src_id;
                  return (
                    <tr key={tx.id || i} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 lg:px-6 lg:py-4 text-slate-300">
                        {txDate}
                      </td>
                      <td className="px-4 py-3 lg:px-6 lg:py-4">
                        <p className="font-medium text-[var(--color-text-foreground)]">{tx.note || 'Transaksi'}</p>
                        {tx.category_id && <p className="text-[10px] lg:text-xs text-[var(--color-text-muted)]">{catName}</p>}
                      </td>
                      <td className="px-4 py-3 lg:px-6 lg:py-4 text-slate-300">
                        {accName || '-'}
                      </td>
                    <td className="px-4 py-3 lg:px-6 lg:py-4 text-right text-positive font-medium">
                      {tx.tx_type === 'Income' ? formatRp(tx.amount) : '-'}
                    </td>
                    <td className="px-4 py-3 lg:px-6 lg:py-4 text-right text-negative font-medium">
                      {tx.tx_type === 'Expense' ? formatRp(tx.amount) : '-'}
                    </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredTxs.length > 0 && (
              <tfoot className="bg-slate-50 dark:bg-white/[0.02] border-t-2 border-slate-200 dark:border-white/10">
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
