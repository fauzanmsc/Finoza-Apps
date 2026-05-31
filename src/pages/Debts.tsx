import { useState, useEffect } from 'react';
import { Users, Clock, AlertTriangle, Plus, MoreVertical, Edit2, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';
import DebtModal from '../components/debts/DebtModal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function Debts() {
  const [debts, setDebts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<any>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean; id: string | null}>({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);


  const token = useAuth(state => state.token);

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    setIsLoading(true);
    const res = await fetchApi('GET_DEBTS', {}, token!);
    if (res.status === 'success') {
      setDebts(res.data || []);
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
      await fetchApi('DELETE_DEBT', { id: confirmModal.id }, token!);
      setIsDeleting(false);
      setConfirmModal({ isOpen: false, id: null });
      loadDebts();
    }
  };

  const handleEdit = (debt: any) => {
    setEditingDebt(debt);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleMarkPaid = async (debt: any) => {
    await fetchApi('UPDATE_DEBT', { ...debt, status: 'Paid' }, token!);
    loadDebts();
    setActiveMenuId(null);
  };

  const openCreateModal = () => {
    setEditingDebt(null);
    setIsModalOpen(true);
  };

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-stabilo)]" /></div>;
  }

  const totalHutang = debts.filter(d => (d.type || '').includes('Saya Berhutang') && d.status !== 'Paid').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalPiutang = debts.filter(d => (d.type || '').includes('Piutang') && d.status !== 'Paid').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div className="p-4 lg:p-8 w-full max-w-5xl mx-auto space-y-6 lg:space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-bold">Hutang & Piutang</h2>
        <button onClick={openCreateModal} className="bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl flex items-center gap-2 text-xs lg:text-sm font-medium transition-colors shadow-[0_0_15px_rgba(204,255,0,0.2)]">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Catat Baru</span><span className="sm:hidden">Catat</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className="glass p-4 lg:p-6 rounded-2xl border-t-4 border-negative">
          <p className="text-[10px] lg:text-sm text-slate-400 mb-0.5 lg:mb-1">Total Hutang Saya</p>
          <p className="text-2xl lg:text-3xl font-bold text-negative">{formatRp(totalHutang)}</p>
        </div>
        <div className="glass p-4 lg:p-6 rounded-2xl border-t-4 border-[var(--color-stabilo)]">
          <p className="text-[10px] lg:text-sm text-slate-400 mb-0.5 lg:mb-1">Total Piutang (Uang Saya di Orang)</p>
          <p className="text-2xl lg:text-3xl font-bold text-[var(--color-stabilo)]">{formatRp(totalPiutang)}</p>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {debts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Bebas Hutang Piutang"
            description="Belum ada catatan hutang atau piutang. Catat jika ada agar tidak lupa!"
            actionLabel="Catat Baru"
            onAction={openCreateModal}
          />
        ) : (
          <div className="divide-y divide-white/5">
            {debts.map((d, i) => (
              <div key={i} className="p-4 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 lg:gap-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center bg-surface-light ${d.status === 'Overdue' ? 'text-negative border border-negative/30' : d.status === 'Paid' ? 'text-slate-500' : 'text-[var(--color-stabilo)]'}`}>
                    {d.status === 'Paid' ? <CheckCircle2 className="w-5 lg:w-6 h-5 lg:h-6" /> : <Users className="w-5 lg:w-6 h-5 lg:h-6" />}
                  </div>
                  <div>
                    <h3 className={`font-bold text-base lg:text-lg ${d.status === 'Paid' ? 'line-through text-slate-500' : ''}`}>{d.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] lg:text-xs text-slate-400 mt-1">
                      <span className={(d.type || '').includes('Piutang') ? (d.status === 'Paid' ? 'text-slate-500' : 'text-[var(--color-stabilo)]') : 'text-negative'}>{d.type}</span>
                      <span className="hidden sm:inline">•</span>
                      <Clock className="w-3 h-3 hidden sm:block" />
                      <span className={d.status === 'Overdue' ? 'text-negative font-medium' : ''}>Jatuh tempo: {d.due}</span>
                      {d.status === 'Paid' && <span className="ml-1 lg:ml-2 px-1.5 lg:px-2 py-0.5 bg-white/10 rounded-full text-slate-300">Lunas</span>}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 lg:gap-4 text-left sm:text-right sm:pl-0 pl-12 lg:pl-16">
                  <div>
                    <p className={`text-lg lg:text-xl font-bold ${d.status === 'Paid' ? 'text-slate-500 line-through' : ''}`}>{formatRp(d.amount)}</p>
                    {d.status === 'Overdue' && (
                      <p className="text-[10px] lg:text-xs text-negative flex items-center gap-1 sm:justify-end mt-1">
                        <AlertTriangle className="w-3 h-3" /> Terlambat
                      </p>
                    )}
                  </div>
                  
                  <div className="relative">
                    <button onClick={() => setActiveMenuId(activeMenuId === d.id ? null : d.id)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {activeMenuId === d.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-surface-light border border-white/10 rounded-xl shadow-xl overflow-hidden z-10">
                        {d.status !== 'Paid' && (
                          <button onClick={() => handleMarkPaid(d)} className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2 text-positive">
                            <CheckCircle2 className="w-4 h-4" /> Tandai Lunas
                          </button>
                        )}
                        <button onClick={() => handleEdit(d)} className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2">
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => handleDelete(d.id)} className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 text-negative flex items-center gap-2">
                          <Trash2 className="w-4 h-4" /> Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <DebtModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDebt(null);
        }}
        onRefresh={loadDebts}
        initialData={editingDebt}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        message="Yakin ingin menghapus catatan ini?"
        isLoading={isDeleting}
      />
    </div>
  );
}
