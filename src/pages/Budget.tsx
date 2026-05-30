import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Edit2, Trash2, Loader2 } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';
import BudgetModal from '../components/budget/BudgetModal';

export default function Budget() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const token = useAuth(state => state.token);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    setIsLoading(true);
    const res = await fetchApi('GET_BUDGETS', {}, token!);
    if (res.status === 'success') {
      setBudgets(res.data || []);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus anggaran ini?')) {
      await fetchApi('DELETE_BUDGET', { id }, token!);
      loadBudgets();
    }
    setActiveMenuId(null);
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
    <div className="p-4 lg:p-8 w-full max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Anggaran Bulanan</h2>
        <button onClick={openCreateModal} className="bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-[0_0_15px_rgba(204,255,0,0.2)]">
          <Plus className="w-4 h-4" /> Buat Anggaran
        </button>
      </div>

      <div className="glass p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 border border-white/5">
        <div className="relative w-48 h-48 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="20" fill="transparent" className="text-white/5" />
            <circle 
              cx="96" cy="96" r="80" 
              stroke="currentColor" 
              strokeWidth="20" 
              fill="transparent" 
              strokeDasharray="502" 
              strokeDashoffset={502 - (502 * Number(totalPercent)) / 100} 
              className="text-[var(--color-stabilo)] transition-all duration-1000" 
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{totalPercent}%</span>
            <span className="text-xs text-slate-400">Terpakai</span>
          </div>
        </div>
        
        <div className="flex-1 space-y-2 w-full text-center md:text-left">
          <h3 className="text-xl font-bold">Anggaran Total Bulan Ini</h3>
          <p className="text-slate-400 mb-4">Anda telah menghabiskan {formatRp(totalUsed)} dari total {formatRp(totalLimit)} anggaran bulan ini.</p>
          <div className="inline-block px-4 py-2 rounded-lg bg-surface-light border border-white/5 text-sm font-medium text-[var(--color-stabilo)]">
            Tersisa {formatRp(Math.max(0, totalLimit - totalUsed))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg mb-4">Amplop Kategori</h3>
        
        {budgets.length === 0 ? (
          <div className="text-center text-slate-500 py-12 border border-dashed border-white/10 rounded-2xl">
            Belum ada anggaran yang dibuat.
          </div>
        ) : (
          budgets.map((b, i) => {
            const percent = Math.min(((b.used || 0) / (b.limit || 1)) * 100, 100);
            const isOver = (b.used || 0) > b.limit;
            
            return (
              <div key={i} className="glass p-5 rounded-2xl transition-colors relative group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${b.color || 'bg-[var(--color-stabilo)]'}`}></div>
                    <span className="font-medium text-white">{b.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`font-bold ${isOver ? 'text-negative' : 'text-white'}`}>{formatRp(b.used || 0)}</span>
                      <span className="text-xs text-slate-400 ml-1">/ {formatRp(b.limit)}</span>
                    </div>
                    
                    <div className="relative">
                      <button onClick={() => setActiveMenuId(activeMenuId === b.id ? null : b.id)} className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {activeMenuId === b.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-surface-light border border-white/10 rounded-xl shadow-xl overflow-hidden z-10">
                          <button onClick={() => handleEdit(b)} className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2">
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button onClick={() => handleDelete(b.id)} className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 text-negative flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="h-3 w-full bg-surface-light rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-negative' : (b.color || 'bg-[var(--color-stabilo)]')}`} 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                
                {isOver && <p className="text-xs text-negative mt-2">Melebihi anggaran sebesar {formatRp(b.used - b.limit)}</p>}
              </div>
            )
          })
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
    </div>
  );
}
