import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Edit2, Trash2, Loader2 } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';
import BudgetModal from '../components/budget/BudgetModal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmModal from '../components/ui/ConfirmModal';
import { PieChart } from 'lucide-react';

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
          limit: limitVal,
          used: usedAmount,
          color: targetCat?.color_hex || '#10B981'
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

  const totalUsed = budgets.reduce((acc, curr) => acc + (curr.used || 0), 0);
  const totalLimit = budgets.reduce((acc, curr) => acc + (curr.limit || 0), 0);
  const totalPercent = totalLimit > 0 ? Math.min((totalUsed / totalLimit) * 100, 100).toFixed(0) : 0;

  return (
    <div className="p-4 lg:p-8 w-full max-w-4xl mx-auto space-y-6 lg:space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-bold">Anggaran Bulanan</h2>
        <button onClick={openCreateModal} className="bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl flex items-center gap-2 text-xs lg:text-sm font-medium transition-colors shadow-[0_0_15px_rgba(204,255,0,0.2)]">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Buat Anggaran</span><span className="sm:hidden">Buat</span>
        </button>
      </div>

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
              strokeDashoffset={502 - (502 * Number(totalPercent)) / 100} 
              className="text-[var(--color-stabilo)] transition-all duration-1000" 
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl lg:text-3xl font-bold text-[var(--color-text-foreground)]">{totalPercent}%</span>
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
        <h3 className="font-bold text-lg mb-4">Amplop Kategori</h3>
        
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
              
              return (
                <div key={i} className="glass p-5 lg:p-6 rounded-[24px] hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 relative group overflow-hidden border border-white/5">
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ backgroundColor: `${b.color}20` }}>
                         <div className="w-4 h-4 rounded-full" style={{ backgroundColor: b.color, boxShadow: `0 0 10px ${b.color}` }}></div>
                      </div>
                      <div>
                        <h4 className="font-bold text-base lg:text-lg text-[var(--color-text-foreground)] mb-1">{b.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`font-extrabold text-sm lg:text-base ${isOver ? 'text-negative' : 'text-[var(--color-text-foreground)]'}`}>{formatRp(b.used || 0)}</span>
                          <span className="text-xs text-[var(--color-text-muted)]">/ {formatRp(b.limit)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button onClick={() => setActiveMenuId(activeMenuId === b.id ? null : b.id)} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)]">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {activeMenuId === b.id && (
                        <div className="absolute right-0 top-full mt-2 w-36 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                          <button onClick={() => handleEdit(b)} className="w-full px-4 py-3 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 font-medium transition-colors">
                            <Edit2 className="w-4 h-4 text-blue-500" /> Edit
                          </button>
                          <div className="h-px w-full bg-black/5 dark:bg-white/5" />
                          <button onClick={() => handleDelete(b.id)} className="w-full px-4 py-3 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 text-negative flex items-center gap-3 font-medium transition-colors">
                            <Trash2 className="w-4 h-4" /> Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[11px] font-medium text-[var(--color-text-muted)]">Penggunaan Anggaran</span>
                      <span className={`text-xs font-bold ${isOver ? 'text-negative' : 'text-[var(--color-text-foreground)]'}`}>{percent.toFixed(0)}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 relative ${isOver ? 'bg-negative' : ''}`} 
                        style={{ width: `${percent}%`, backgroundColor: !isOver ? b.color : undefined }}
                      >
                         {!isOver && <div className="absolute inset-0 bg-white/20" />}
                      </div>
                    </div>
                    {isOver && <p className="text-[11px] text-negative mt-2.5 font-medium bg-negative/10 inline-block px-2.5 py-1.5 rounded-lg shadow-sm">⚠️ Melebihi anggaran sebesar {formatRp((b.used || 0) - b.limit)}</p>}
                    {!isOver && (b.limit - (b.used || 0) > 0) && <p className="text-[11px] text-[var(--color-text-muted)] mt-2 font-medium">Tersisa {formatRp(b.limit - (b.used || 0))}</p>}
                  </div>

                  <div className="absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.03] pointer-events-none rounded-full" style={{ backgroundColor: b.color }} />
                </div>
              )
            })}
          </div>
        )}
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
        isLoading={isDeleting}
      />
    </div>
  );
}
