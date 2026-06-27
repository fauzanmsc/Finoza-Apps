import { useState, useEffect } from 'react';
import { Target, Loader2, Plus, MoreVertical, Edit2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import ModernDropdown from '../components/ui/ModernDropdown';
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';
import GoalModal from '../components/goals/GoalModal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function Goals() {
  const [goals, setGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const token = useAuth(state => state.token);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setIsLoading(true);
    const res = await fetchApi('GET_GOALS', {}, token!);
    if (res.status === 'success') {
      setGoals(res.data || []);
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
      await fetchApi('DELETE_GOAL', { id: confirmModal.id }, token!);
      setIsDeleting(false);
      setConfirmModal({ isOpen: false, id: null });
      loadGoals();
    }
  };

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const formatRp = (value: number | string) => {
    if (!value) return 'Rp 0';
    return 'Rp ' + Number(value).toLocaleString('id-ID');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-bold">Tujuan Finansial</h2>
        <button onClick={() => { setEditingGoal(null); setIsModalOpen(true); }} className="bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black px-3 lg:px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-[0_0_15px_rgba(204,255,0,0.2)]">
          <Plus className="w-4 h-4" /> Tambah Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState 
          icon={Target}
          title="Belum ada tujuan finansial" 
          description="Mulai rencanakan tabungan impian Anda seperti liburan, beli gadget, atau dana darurat." 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {goals.map((goal, i) => {
            const target = Number(goal.target_amount) || 0;
            const current = Number(goal.current_amount) || 0;
            const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
            const isCompleted = current >= target;

            return (
              <div key={i} className="glass rounded-2xl p-5 relative group border border-black/5 dark:border-white/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (goal.color_hex || '#10B981') + '20' }}>
                      <Target className="w-5 h-5" style={{ color: goal.color_hex || '#10B981' }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{goal.name}</h3>
                      {goal.deadline && <p className="text-xs text-[var(--color-text-muted)]">Target: {new Date(goal.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(goal)} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-400 hover:text-[var(--color-text-foreground)]" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-slate-400 hover:text-red-500" title="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-[var(--color-text-muted)]">Terkumpul</span>
                    <span className="font-bold">{formatRp(current)}</span>
                  </div>
                  
                  <div className="h-3 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${percentage}%`, backgroundColor: goal.color_hex || '#10B981' }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-1">
                    <span>{percentage}%</span>
                    <span>Target: {formatRp(target)}</span>
                  </div>
                </div>

                {isCompleted && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-positive rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-[#1E1E1E]">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <GoalModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingGoal(null); }}
          onSuccess={loadGoals}
          editingData={editingGoal}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Hapus Tujuan Finansial"
        message="Apakah Anda yakin ingin menghapus tujuan finansial ini? Data tidak dapat dikembalikan."
        isLoading={isDeleting}
      />
    </div>
  );
}
