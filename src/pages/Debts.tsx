import { useState, useEffect } from 'react';
import { Users, Clock, AlertTriangle, Plus, MoreVertical, Edit2, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';
import DebtModal from '../components/debts/DebtModal';

export default function Debts() {
  const [debts, setDebts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<any>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus catatan ini?')) {
      await fetchApi('DELETE_DEBT', { id }, token!);
      loadDebts();
    }
    setActiveMenuId(null);
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
    <div className="p-4 lg:p-8 w-full max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Hutang & Piutang</h2>
        <button onClick={openCreateModal} className="bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-[0_0_15px_rgba(204,255,0,0.2)]">
          <Plus className="w-4 h-4" /> Catat Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border-t-4 border-negative">
          <p className="text-slate-400 mb-1">Total Hutang Saya</p>
          <p className="text-3xl font-bold text-negative">{formatRp(totalHutang)}</p>
        </div>
        <div className="glass p-6 rounded-2xl border-t-4 border-[var(--color-stabilo)]">
          <p className="text-slate-400 mb-1">Total Piutang (Uang Saya di Orang)</p>
          <p className="text-3xl font-bold text-[var(--color-stabilo)]">{formatRp(totalPiutang)}</p>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {debts.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            Belum ada catatan hutang / piutang.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {debts.map((d, i) => (
              <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-surface-light ${d.status === 'Overdue' ? 'text-negative border border-negative/30' : d.status === 'Paid' ? 'text-slate-500' : 'text-[var(--color-stabilo)]'}`}>
                    {d.status === 'Paid' ? <CheckCircle2 className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${d.status === 'Paid' ? 'line-through text-slate-500' : ''}`}>{d.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className={(d.type || '').includes('Piutang') ? (d.status === 'Paid' ? 'text-slate-500' : 'text-[var(--color-stabilo)]') : 'text-negative'}>{d.type}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span className={d.status === 'Overdue' ? 'text-negative font-medium' : ''}>Jatuh tempo: {d.due}</span>
                      {d.status === 'Paid' && <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-slate-300">Lunas</span>}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-left sm:text-right sm:pl-0 pl-16">
                  <div>
                    <p className={`text-xl font-bold ${d.status === 'Paid' ? 'text-slate-500 line-through' : ''}`}>{formatRp(d.amount)}</p>
                    {d.status === 'Overdue' && (
                      <p className="text-xs text-negative flex items-center gap-1 sm:justify-end mt-1">
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
    </div>
  );
}
