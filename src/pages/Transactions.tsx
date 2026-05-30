import { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, Search, Filter, Loader2, FileText, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';
import TransactionModal from '../components/transactions/TransactionModal';

export default function Transactions() {
  const [txs, setTxs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTx, setEditingTx] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('Semua');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      await fetchApi('DELETE_TRANSACTION', { id }, token!);
      loadTxs();
    }
    setActiveMenuId(null);
  };

  const handleEdit = (tx: any) => {
    setEditingTx(tx);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const filteredTxs = useMemo(() => {
    let result = txs;
    if (filterType !== 'Semua') {
      const mappedType = filterType === 'Pemasukan' ? 'Income' : filterType === 'Pengeluaran' ? 'Expense' : 'Transfer';
      result = result.filter(tx => tx.tx_type === mappedType);
    }
    if (searchQuery) {
      result = result.filter(tx => 
        tx.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.account_src_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [txs, searchQuery, filterType]);

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 lg:p-8 w-full max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Jurnal Lengkap</h2>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--color-stabilo)] transition-all"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`p-2.5 bg-surface border rounded-xl hover:bg-white/5 transition-colors ${filterType !== 'Semua' ? 'border-[var(--color-stabilo)] text-[var(--color-stabilo)]' : 'border-white/10 text-slate-400'}`}
            >
              <Filter className="w-4 h-4" />
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-surface-light border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                {['Semua', 'Pemasukan', 'Pengeluaran', 'Transfer'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilterType(type);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2 ${filterType === type ? 'text-[var(--color-stabilo)] font-medium' : 'text-slate-300'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {filteredTxs.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p>{searchQuery ? 'Pencarian tidak ditemukan.' : 'Belum ada data transaksi.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredTxs.map((tx: any, i: number) => {
              const menuId = tx.id || `idx-${i}`;
              return (
              <div key={tx.id || i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-white/5 transition-colors gap-4 relative">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-light flex items-center justify-center flex-shrink-0">
                    {tx.tx_type === 'Income' ? <ArrowUpRight className="w-5 h-5 text-positive" /> : 
                     tx.tx_type === 'Transfer' ? <ArrowLeftRight className="w-5 h-5 text-primary" /> :
                     <ArrowDownRight className="w-5 h-5 text-negative" />}
                  </div>
                  <div>
                    <p className="font-medium text-lg">{tx.note || 'Transaksi'}</p>
                    <p className="text-sm text-slate-400">
                      {new Date(tx.tx_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} 
                      {tx.category_id && ` • ${tx.category_id}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pl-16 sm:pl-0">
                  <div className="text-left sm:text-right flex-1">
                    <p className={`font-bold text-lg ${tx.tx_type === 'Income' ? 'text-positive' : tx.tx_type === 'Transfer' ? 'text-primary' : 'text-negative'}`}>
                      {tx.tx_type === 'Income' ? '+' : tx.tx_type === 'Expense' ? '-' : ''}{formatRp(tx.amount)}
                    </p>
                    <p className="text-xs text-slate-400">{tx.account_src_id}</p>
                  </div>
                  <div className="relative">
                    <button onClick={() => setActiveMenuId(activeMenuId === menuId ? null : menuId)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {activeMenuId === menuId && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-surface-light border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                        <button onClick={() => handleEdit(tx)} className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2">
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => handleDelete(tx.id)} className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 text-negative flex items-center gap-2">
                          <Trash2 className="w-4 h-4" /> Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingTx(null);
        }} 
        onRefresh={loadTxs}
        initialData={editingTx}
      />
    </div>
  );
}
