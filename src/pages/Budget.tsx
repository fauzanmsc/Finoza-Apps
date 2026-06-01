import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, PieChart, Pizza, Car, Briefcase, ArrowDownLeft, ShoppingBag, Coffee, Smartphone, Monitor, Home, Heart, Smile, Tags, WalletCards } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';
import BudgetModal from '../components/budget/BudgetModal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmModal from '../components/ui/ConfirmModal';

const ICON_MAP: Record<string, any> = {
  'pizza': Pizza, 'car': Car, 'briefcase': Briefcase, 'arrow-down-left': ArrowDownLeft, 'shopping-bag': ShoppingBag, 'coffee': Coffee, 'smartphone': Smartphone, 'monitor': Monitor, 'home': Home, 'heart': Heart, 'smile': Smile, 'tags': Tags, 'wallet': WalletCards
};

export default function Budget() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean; id: string | null}>({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const token = useAuth(state => state.token);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    setIsLoading(true);
    try {
      const [resBudgets, resTx, resCat] = await Promise.all([
        fetchApi('GET_BUDGETS', {}, token!),
        fetchApi('GET_TRANSACTIONS', {}, token!),
        fetchApi('GET_CATEGORIES', {}, token!)
      ]);

      const budgetsData = resBudgets.status === 'success' ? resBudgets.data || [] : [];
      const txData = resTx.status === 'success' ? resTx.data || [] : [];
      const catData = resCat.status === 'success' ? resCat.data || [] : [];

      const catMap = catData.reduce((acc: any, cat: any) => {
        acc[cat.id] = cat;
        return acc;
      }, {});

      const now = new Date();
      const currentMonthTx = txData.filter((tx: any) => {
        const d = new Date(tx.tx_date);
        return tx.tx_type === 'Expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      const enrichedBudgets = budgetsData.map((b: any) => {
        const targetCat = catData.find((c: any) => c.id === b.category_id || (c.name || c.category_name)?.toLowerCase() === (b.name || '').toLowerCase());
        
        const usedAmount = currentMonthTx.reduce((sum: number, tx: any) => {
          const txCatName = catMap[tx.category_id]?.name || catMap[tx.category_id]?.category_name || 'Lainnya';
          if (txCatName.toLowerCase() === (b.name || '').toLowerCase() || tx.category_id === targetCat?.id) {
            return sum + Number(tx.amount || 0);
          }
          return sum;
        }, 0);

        const limitVal = Number(b.limit || b.amount_limit || 0);

        return {
          ...b,
          name: targetCat?.name || targetCat?.category_name || b.name || 'Tanpa Kategori',
          limit: limitVal,
          used: usedAmount,
          color: targetCat?.color_hex || '#10B981',
          icon_name: targetCat?.icon_name || 'wallet'
        };
      });
      setBudgets(enrichedBudgets);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    setConfirmModal({ isOpen: true, id });
    setActiveMenuId(null);
  };

  const confirmDelete = async () => {
    if (!confirmModal.id) return;
    setIsDeleting(true);
    await fetchApi('DELETE_BUDGET', { id: confirmModal.id }, token!);
    setIsDeleting(false);
    setConfirmModal({ isOpen: false, id: null });
    loadBudgets();
  };

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const openCreateModal = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-stabilo)]" /></div>;
  }

  const totalUsed = budgets.reduce((acc, curr) => acc + Number(curr.used || 0), 0);
  const totalLimit = budgets.reduce((acc, curr) => acc + Number(curr.limit || curr.amount_limit || 0), 0);
  const totalPercentRaw = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;
  const totalPercent = totalPercentRaw.toFixed(0);
  const totalPercentCapped = Math.min(totalPercentRaw, 100);

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6 lg:space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-bold">Anggaran Bulanan</h2>
        <button onClick={openCreateModal} className="bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl flex items-center gap-2 text-xs lg:text-sm font-medium transition-colors shadow-[0_0_15px_rgba(204,255,0,0.2)]">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Buat Anggaran</span><span className="sm:hidden">Buat</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Column 1: Existing Content */}
        <div className="xl:col-span-2 space-y-6 lg:space-y-8">
          <div className="glass p-5 lg:p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6 lg:gap-8 border border-white/5">
        <div className="relative w-32 h-32 lg:w-48 lg:h-48 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-black/5 dark:text-white/5" />
            <circle 
              cx="96" cy="96" r="80" 
              stroke="currentColor" 
              strokeWidth="16" 
              fill="transparent" 
              strokeDasharray="502" 
              strokeDashoffset={502 - (502 * totalPercentCapped) / 100} 
              className={`transition-all duration-1000 ${totalPercentRaw > 100 ? 'text-negative' : 'text-[var(--color-stabilo)]'}`}
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl lg:text-3xl font-bold ${totalPercentRaw > 100 ? 'text-negative' : 'text-[var(--color-text-foreground)]'}`}>{totalPercent}%</span>
            <span className="text-[10px] lg:text-xs text-[var(--color-text-muted)]">Terpakai</span>
          </div>
        </div>
        
        <div className="flex-1 space-y-2 w-full text-center md:text-left">
          <h3 className="text-lg lg:text-xl font-bold">Anggaran Total Bulan Ini</h3>
          <p className="text-[10px] lg:text-sm text-slate-400 mb-4">Anda telah menghabiskan {formatRp(totalUsed)} dari total {formatRp(totalLimit)} anggaran bulan ini.</p>
          <div className="inline-block px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg bg-surface-light border border-white/5 text-xs lg:text-sm font-medium text-[var(--color-stabilo)]">
            Tersisa {formatRp(Math.max(0, totalLimit - totalUsed))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg lg:text-xl mb-4">Rincian Anggaran Kategori</h3>
        
        {budgets.length === 0 ? (
          <EmptyState
            icon={PieChart}
            title="Belum Ada Anggaran"
            description="Batasi pengeluaran Anda dengan membuat anggaran untuk tiap kategori."
            actionLabel="Buat Anggaran"
            onAction={openCreateModal}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {budgets.map((b, i) => {
              const percent = Math.min(((b.used || 0) / (b.limit || 1)) * 100, 100);
              const isOver = (b.used || 0) > b.limit;
              const IconComp = ICON_MAP[b.icon_name] || WalletCards;
              
              return (
                <div key={i} className="glass p-5 lg:p-6 rounded-[24px] hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 relative group overflow-hidden border border-white/5">
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ backgroundColor: `${b.color}20` }}>
                         <IconComp className="w-5 h-5 lg:w-6 lg:h-6 drop-shadow-sm" style={{ color: b.color }} />
                      </div>
                      <div>
                        <h4 className="font-bold text-base lg:text-lg text-[var(--color-text-foreground)] mb-1">{b.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`font-extrabold text-sm lg:text-base ${isOver ? 'text-negative' : 'text-[var(--color-text-foreground)]'}`}>{formatRp(b.used || 0)}</span>
                          <span className="text-xs text-[var(--color-text-muted)]">/ {formatRp(b.limit)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(b)} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-blue-500/20 text-[var(--color-text-muted)] hover:text-blue-500 rounded-xl transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-negative/20 text-[var(--color-text-muted)] hover:text-negative rounded-xl transition-colors" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Penggunaan</span>
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${isOver ? 'bg-negative/15 text-negative' : 'bg-white/5 text-[var(--color-text-foreground)]'}`}>{percent.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-black/10 dark:bg-white/[0.07] rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 relative ${isOver ? 'bg-gradient-to-r from-red-500 to-rose-400' : ''}`} 
                        style={{ width: `${percent}%`, backgroundColor: !isOver ? b.color : undefined }}
                      >
                         {!isOver && <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/25 rounded-full" />}
                      </div>
                    </div>
                    {isOver && (
                      <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-gradient-to-r from-negative/10 to-negative/5 border border-negative/15">
                        <div className="w-5 h-5 rounded-full bg-negative/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px]">🔴</span>
                        </div>
                        <p className="text-[11px] text-negative font-semibold tracking-tight">Over {formatRp((b.used || 0) - b.limit)}</p>
                      </div>
                    )}
                    {!isOver && (b.limit - (b.used || 0) > 0) && (
                      <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-gradient-to-r from-positive/10 to-positive/5 border border-positive/15">
                        <div className="w-5 h-5 rounded-full bg-positive/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px]">🟢</span>
                        </div>
                        <p className="text-[11px] text-positive font-semibold tracking-tight">Tersisa {formatRp(b.limit - (b.used || 0))}</p>
                      </div>
                    )}
                  </div>

                  <div className="absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.03] pointer-events-none rounded-full" style={{ backgroundColor: b.color }} />
                </div>
              )
            })}
          </div>
        )}
      </div>
      </div>

      {/* Column 2: Budget Capacity List */}
      <div className="space-y-4 lg:space-y-6">
        <h3 className="font-bold text-lg lg:text-xl mb-4">Kapasitas Anggaran</h3>
        <div className="glass p-5 lg:p-6 rounded-[24px] border border-white/5 space-y-2 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-stabilo)]/5 blur-[50px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between mb-6 pb-4 border-b border-white/5">
             <span className="text-sm font-medium text-[var(--color-text-muted)]">Kategori</span>
             <span className="text-sm font-medium text-[var(--color-text-muted)]">Plafon Anggaran</span>
          </div>

          <div className="relative z-10 space-y-3">
            {budgets.length === 0 ? (
              <p className="text-sm text-center text-[var(--color-text-muted)] py-4">Belum ada anggaran.</p>
            ) : (
              budgets.map((b, i) => {
                const IconCompList = ICON_MAP[b.icon_name] || WalletCards;
                return (
                  <div key={i} className="flex items-center justify-between p-3 lg:p-4 rounded-2xl bg-black/10 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-all border border-transparent hover:border-[var(--color-stabilo)]/20 group cursor-default">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: `${b.color}20` }}>
                         <IconCompList className="w-4 h-4 lg:w-5 lg:h-5 drop-shadow-sm" style={{ color: b.color }} />
                      </div>
                    <span className="font-bold text-sm lg:text-base text-[var(--color-text-foreground)] group-hover:text-[var(--color-stabilo)] transition-colors">{b.name}</span>
                  </div>
                  <span className="font-extrabold text-sm lg:text-base tracking-tight">{formatRp(b.limit)}</span>
                </div>
              );
              })
            )}
          </div>
        </div>
      </div>
      
      </div>

      <BudgetModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onRefresh={loadBudgets}
        initialData={editingBudget}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        message="Yakin ingin menghapus anggaran ini?"
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
