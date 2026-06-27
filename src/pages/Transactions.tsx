import { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, Search, Filter, Loader2, FileText, MoreVertical, Edit2, Trash2, Pizza, Car, Briefcase, ArrowDownLeft, ShoppingBag, Coffee, Smartphone, Monitor, Home, Heart, Smile, Tags, Landmark } from 'lucide-react';
import ModernDropdown from '../components/ui/ModernDropdown';

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
  'tags': Tags
};
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';
import TransactionModal from '../components/transactions/TransactionModal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function Transactions() {
  const [txs, setTxs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTx, setEditingTx] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('Semua');
  const [filterCategory, setFilterCategory] = useState<string>('Semua');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const token = useAuth(state => state.token);

  useEffect(() => {
    loadTxs();
  }, []);

  const loadTxs = async () => {
    setIsLoading(true);
    try {
      const [resTx, resCat, resAcc] = await Promise.all([
        fetchApi('GET_TRANSACTIONS', {}, token!),
        fetchApi('GET_CATEGORIES', {}, token!),
        fetchApi('GET_ACCOUNTS', {}, token!)
      ]);
      if (resTx.status === 'success') setTxs(resTx.data || []);
      if (resCat.status === 'success') setCategories(resCat.data || []);
      if (resAcc.status === 'success') setAccounts(resAcc.data || []);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleDelete = (id: string) => {
    setActiveMenuId(null);
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (confirmModal.id) {
      setIsDeleting(true);
      await fetchApi('DELETE_TRANSACTION', { id: confirmModal.id }, token!);
      setIsDeleting(false);
      setConfirmModal({ isOpen: false, id: null });
      loadTxs();
    }
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
    if (filterCategory !== 'Semua') {
      result = result.filter(tx => tx.category_id === filterCategory);
    }
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(tx => {
        const catName = String(categories.find(c => c.id === tx.category_id)?.name || tx.category_id || '');
        const accName = String(accounts.find(a => a.id === tx.account_src_id)?.account_name || tx.account_src_id || '');
        const note = String(tx.note || '');

        return (
          note.toLowerCase().includes(lowerQuery) ||
          catName.toLowerCase().includes(lowerQuery) ||
          accName.toLowerCase().includes(lowerQuery)
        );
      });
    }
    return result;
  }, [txs, searchQuery, filterType, filterCategory, categories, accounts]);

  const catMap = useMemo(() => categories.reduce((acc: any, c: any) => ({ ...acc, [c.id]: c }), {}), [categories]);
  const accMap = useMemo(() => accounts.reduce((acc: any, a: any) => ({ ...acc, [a.id]: a }), {}), [accounts]);

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h2 className="text-xl lg:text-2xl font-bold">Jurnal Lengkap</h2>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
          <div className="relative flex-1 sm:w-64 h-11">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full glass border border-white/10 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--color-stabilo)] transition-all"
            />
          </div>

          <ModernDropdown
            value={filterCategory}
            onChange={setFilterCategory}
            options={[
              { value: 'Semua', label: 'Semua Kategori' },
              ...categories.map(cat => ({ value: cat.id, label: cat.name }))
            ]}
            className="flex-1 sm:flex-none sm:w-48"
          />

          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`h-11 w-11 flex items-center justify-center glass border rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${filterType !== 'Semua' ? 'border-[var(--color-stabilo)] text-[var(--color-stabilo)]' : 'border-black/10 dark:border-white/10 text-[var(--color-text-muted)]'}`}
            >
              <Filter className="w-4 h-4" />
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-surface-light border border-black/10 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                {['Semua', 'Pemasukan', 'Pengeluaran', 'Transfer'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilterType(type);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 ${filterType === type ? 'text-[var(--color-stabilo)] font-medium' : 'text-[var(--color-text-muted)]'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => { setEditingTx(null); setIsModalOpen(true); }} className="h-11 ml-1 lg:ml-3 bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-stabilo-btn px-4 lg:px-6 rounded-xl font-bold text-sm lg:text-base transition-colors shadow-[0_0_15px_rgba(204,255,0,0.3)] flex items-center justify-center gap-2 whitespace-nowrap">
            <span className="text-lg leading-none">+</span> Catat Transaksi
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {filteredTxs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={searchQuery ? 'Tidak Ditemukan' : 'Belum Ada Transaksi'}
            description={searchQuery ? 'Tidak ada transaksi yang cocok dengan pencarian' : 'Mulai catat pemasukan atau pengeluaran pertama Anda hari ini.'}
            actionLabel={!searchQuery ? 'Catat Transaksi' : undefined}
            onAction={!searchQuery ? () => { setEditingTx(null); setIsModalOpen(true); } : undefined}
          />
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {filteredTxs.map((tx: any, i: number) => {
              const menuId = tx.id || `idx-${i}`;
              const cat = catMap[tx.category_id] || {};
              const acc = accMap[tx.account_src_id] || {};
              const catName = cat.name || tx.category_id || (tx.tx_type === 'Income' ? 'Pemasukan' : tx.tx_type === 'Transfer' ? 'Transfer' : 'Pengeluaran');
              const catColor = cat.color_hex || (tx.tx_type === 'Income' ? '#1EE494' : tx.tx_type === 'Transfer' ? '#6366f1' : '#FF4D4D');
              const iconName = cat.icon_name || (tx.tx_type === 'Income' ? 'arrow-down-left' : tx.tx_type === 'Transfer' ? 'arrow-left-right' : 'tags');
              const IconComp = ICON_MAP[iconName] || Tags;

              return (
                <div key={tx.id || i} className="group flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 hover:bg-white/5 dark:hover:bg-white/[0.03] transition-all duration-300 gap-4 lg:gap-6 relative hover:shadow-[0_4px_24px_rgba(0,0,0,0.1)] rounded-xl m-1 border border-transparent hover:border-black/5 dark:hover:border-white/5">
                  <div className="flex items-start sm:items-center gap-4 lg:gap-5">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm relative overflow-hidden" style={{ backgroundColor: `${catColor}15`, color: catColor }}>
                      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white/40 to-transparent" />
                      <IconComp className="w-5 lg:w-6 h-5 lg:h-6 relative z-10 drop-shadow-md" style={{ filter: `drop-shadow(0 2px 8px ${catColor}60)` }} />
                    </div>
                    <div>
                      <p className="font-bold text-base lg:text-[1.1rem] text-[var(--color-text-foreground)] leading-tight mb-1 group-hover:text-white transition-colors">{tx.note || 'Transaksi'}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] lg:text-xs text-slate-400/90 font-medium">
                          {new Date(tx.tx_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-500/50" />
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] lg:text-[11px] font-semibold tracking-wide border" style={{ backgroundColor: `${catColor}10`, color: catColor, borderColor: `${catColor}25` }}>
                          {catName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 lg:gap-4 pl-16 sm:pl-0 mt-2 sm:mt-0 w-full sm:w-auto">
                    <div className="text-left sm:text-right flex-1 sm:flex-none">
                      <p className={`font-extrabold text-lg lg:text-xl tracking-tight mb-0.5 ${tx.tx_type === 'Income' ? 'text-positive drop-shadow-[0_0_8px_rgba(30,228,148,0.3)]' : tx.tx_type === 'Transfer' ? 'text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]' : 'text-negative drop-shadow-[0_0_8px_rgba(255,77,77,0.3)]'}`}>
                        {tx.tx_type === 'Income' ? '+' : tx.tx_type === 'Expense' ? '-' : ''}{formatRp(tx.amount)}
                      </p>
                      <p className="inline-flex items-center gap-1.5 text-[11px] lg:text-xs font-medium text-slate-400/80 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-black/5 dark:border-white/5">
                        <Landmark className="w-3 h-3 opacity-70" />
                        {acc.account_name || tx.account_src_id}
                      </p>
                    </div>
                    <div className="relative flex-shrink-0">
                      <button onClick={() => setActiveMenuId(activeMenuId === menuId ? null : menuId)} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all duration-300 text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)] focus:ring-2 focus:ring-white/10">
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeMenuId === menuId && (
                        <>
                          <div className="fixed inset-0 z-[40]" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                          <div className="absolute right-0 top-full mt-2 w-36 bg-surface border border-black/10 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden z-[50] transform origin-top-right animate-[fadeIn_0.15s_ease-out]">
                            <button onClick={() => handleEdit(tx)} className="w-full px-4 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2">
                              <Edit2 className="w-4 h-4" /> Edit
                            </button>
                            <button onClick={() => handleDelete(tx.id)} className="w-full px-4 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 text-negative flex items-center gap-2">
                              <Trash2 className="w-4 h-4" /> Hapus
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        message="Yakin ingin menghapus transaksi ini?"
        confirmText="Hapus"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
