import { useState, useEffect } from 'react';
import { Users, Clock, AlertTriangle, Plus, MoreVertical, Edit2, Trash2, Loader2, CheckCircle2, Eye, EyeOff, Filter, Check } from 'lucide-react';
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
  const [showNominal, setShowNominal] = useState(true);
  const [filterType, setFilterType] = useState('Semua');
  const [filterDue, setFilterDue] = useState('Semua');


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

  const filteredDebts = debts.filter(d => {
    if (filterType !== 'Semua') {
      const isHutang = (d.type || '').includes('Saya Berhutang');
      if (filterType === 'Hutang' && !isHutang) return false;
      if (filterType === 'Piutang' && isHutang) return false;
    }
    
    if (filterDue !== 'Semua' && d.due) {
      const now = new Date();
      now.setHours(0,0,0,0);
      const dueDate = new Date(d.due);
      dueDate.setHours(0,0,0,0);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (filterDue === 'Overdue') return diffDays < 0 && d.status !== 'Paid';
      if (filterDue === 'Akan Jatuh Tempo') return diffDays >= 0 && diffDays <= 7 && d.status !== 'Paid';
      if (filterDue === 'Bulan Ini') return dueDate.getMonth() === now.getMonth() && dueDate.getFullYear() === now.getFullYear();
      if (filterDue === 'Tahun Ini') return dueDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const getStatusInfo = (debt: any) => {
    if (debt.status === 'Paid') return { label: 'Lunas', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    if (!debt.due) return { label: 'Belum Lunas', color: 'bg-[var(--color-stabilo)]/10 text-[var(--color-stabilo)] border-[var(--color-stabilo)]/20' };
    
    const now = new Date();
    now.setHours(0,0,0,0);
    const dueDate = new Date(debt.due);
    dueDate.setHours(0,0,0,0);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Overdue (Sudah Jatuh Tempo)', color: 'bg-negative/10 text-negative border-negative/20', isOverdue: true };
    if (diffDays <= 7) return { label: 'Akan Jatuh Tempo', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
    
    return { label: 'Belum Lunas', color: 'bg-[var(--color-stabilo)]/10 text-[var(--color-stabilo)] border-[var(--color-stabilo)]/20' };
  };

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl lg:text-2xl font-bold flex items-center gap-3">
          Hutang & Piutang
          <button onClick={() => setShowNominal(!showNominal)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
            {showNominal ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </h2>
        
        <div className="flex items-center gap-2 lg:gap-3">
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-surface glass border border-white/10 text-xs lg:text-sm rounded-xl px-3 h-10 focus:outline-none focus:border-[var(--color-stabilo)] transition-colors cursor-pointer">
            <option value="Semua">Semua Tipe</option>
            <option value="Hutang">Hutang Saya</option>
            <option value="Piutang">Piutang (Uang di Orang)</option>
          </select>
          <select value={filterDue} onChange={e => setFilterDue(e.target.value)} className="bg-surface glass border border-white/10 text-xs lg:text-sm rounded-xl px-3 h-10 focus:outline-none focus:border-[var(--color-stabilo)] transition-colors cursor-pointer">
            <option value="Semua">Semua Waktu</option>
            <option value="Akan Jatuh Tempo">Akan Jatuh Tempo (≤ 7 Hari)</option>
            <option value="Overdue">Overdue (Terlewat)</option>
            <option value="Bulan Ini">Bulan Ini</option>
            <option value="Tahun Ini">Tahun Ini</option>
          </select>
          <button onClick={openCreateModal} className="bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black px-3 lg:px-4 h-10 rounded-xl flex items-center gap-2 text-xs lg:text-sm font-bold transition-colors shadow-[0_0_15px_rgba(204,255,0,0.3)] whitespace-nowrap">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Catat Baru</span><span className="sm:hidden">Catat</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className="glass p-5 lg:p-6 rounded-2xl border-t-4 border-negative hover:shadow-[0_4px_24px_rgba(255,77,77,0.1)] transition-all">
          <p className="text-[11px] lg:text-sm text-slate-400 mb-1 lg:mb-2 font-medium">Total Hutang Saya</p>
          <p className={`text-2xl lg:text-3xl font-extrabold text-negative ${!showNominal && 'filter blur-[6px] opacity-70'}`}>
            {showNominal ? formatRp(totalHutang) : 'Rp ••••••••'}
          </p>
        </div>
        <div className="glass p-5 lg:p-6 rounded-2xl border-t-4 border-[var(--color-stabilo)] hover:shadow-[0_4px_24px_rgba(204,255,0,0.15)] transition-all">
          <p className="text-[11px] lg:text-sm text-slate-400 mb-1 lg:mb-2 font-medium">Total Piutang (Uang Saya di Orang)</p>
          <p className={`text-2xl lg:text-3xl font-extrabold text-[var(--color-stabilo)] ${!showNominal && 'filter blur-[6px] opacity-70'}`}>
            {showNominal ? formatRp(totalPiutang) : 'Rp ••••••••'}
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {filteredDebts.length === 0 ? (
          <EmptyState
            icon={Users}
            title={filterType !== 'Semua' || filterDue !== 'Semua' ? 'Tidak Ada Data' : 'Bebas Hutang Piutang'}
            description={filterType !== 'Semua' || filterDue !== 'Semua' ? 'Tidak ada data yang sesuai dengan filter.' : 'Belum ada catatan hutang atau piutang. Catat jika ada agar tidak lupa!'}
            actionLabel="Catat Baru"
            onAction={openCreateModal}
          />
        ) : (
          <div className="divide-y divide-white/5">
            {filteredDebts.map((d, i) => {
              const statusInfo = getStatusInfo(d);
              const isPiutang = (d.type || '').includes('Piutang');
              
              return (
              <div key={i} className="group p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 lg:gap-6 hover:bg-white/5 transition-all duration-300 relative border border-transparent hover:border-white/5 m-1 rounded-2xl hover:shadow-lg">
                <div className="flex items-start sm:items-center gap-4 lg:gap-5">
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm ${d.status === 'Paid' ? 'bg-slate-500/10 text-slate-500' : isPiutang ? 'bg-[var(--color-stabilo)]/10 text-[var(--color-stabilo)]' : 'bg-negative/10 text-negative'}`}>
                    {d.status === 'Paid' ? <CheckCircle2 className="w-6 lg:w-7 h-6 lg:h-7" /> : <Users className="w-6 lg:w-7 h-6 lg:h-7 drop-shadow-md" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className={`font-bold text-base lg:text-[1.1rem] ${d.status === 'Paid' ? 'line-through text-slate-500' : 'text-white'}`}>
                        {d.name || 'Tanpa Nama'}
                      </h3>
                      <span className={`px-2 py-0.5 rounded border text-[10px] lg:text-[11px] font-semibold tracking-wide ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[11px] lg:text-xs text-slate-400 font-medium flex-wrap">
                      <span className={d.status === 'Paid' ? 'text-slate-500' : isPiutang ? 'text-[var(--color-stabilo)]' : 'text-negative'}>{d.type}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-500/50" />
                      <span className="inline-flex items-center gap-1.5 bg-black/10 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-black/5 dark:border-white/5">
                        <Clock className="w-3 h-3 opacity-70" />
                        Jatuh tempo: {d.due ? new Date(d.due).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-3 lg:gap-5 pl-16 sm:pl-0 mt-2 sm:mt-0 w-full sm:w-auto">
                  <div className="text-left sm:text-right flex-1 sm:flex-none">
                    <p className={`text-lg lg:text-xl font-extrabold tracking-tight ${!showNominal && 'filter blur-[5px] opacity-70'} ${d.status === 'Paid' ? 'text-slate-500 line-through' : ''}`}>
                      {showNominal ? formatRp(d.amount) : 'Rp ••••••••'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {d.status !== 'Paid' && (
                      <button 
                        onClick={() => handleMarkPaid(d)} 
                        title="Tandai Lunas"
                        className="p-2 lg:px-3 lg:py-2 bg-black/10 dark:bg-white/5 hover:bg-positive/20 border border-white/5 hover:border-positive/30 rounded-xl transition-all duration-300 text-positive group-hover:shadow-[0_0_10px_rgba(30,228,148,0.2)] flex items-center gap-2"
                      >
                        <Check className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span className="hidden lg:inline text-xs font-bold">Lunas</span>
                      </button>
                    )}

                    <div className="relative">
                      <button onClick={() => setActiveMenuId(activeMenuId === d.id ? null : d.id)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {activeMenuId === d.id && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-surface border border-white/10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden z-50 transform origin-top-right animate-[fadeIn_0.15s_ease-out]">
                          <button onClick={() => handleEdit(d)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 flex items-center gap-2">
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button onClick={() => handleDelete(d.id)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 text-negative flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )})}
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
        confirmText="Hapus"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
