import { useState, useEffect } from 'react';
import { Download, Loader2, Search, Plus, MoreVertical, Edit2, Trash2, Eye, EyeOff, AlertCircle, Clock, CheckCircle2, Check, Users, ChevronDown, Receipt, HandCoins } from 'lucide-react';
import ModernDropdown from '../components/ui/ModernDropdown';

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
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showNominal, setShowNominal] = useState(true);
  const [filterType, setFilterType] = useState('Semua');
  const [filterDue, setFilterDue] = useState('Semua');
  const [sortBy, setSortBy] = useState('Terbaru');

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

  const totalHutang = debts.filter(d => {
    const type = d.type || '';
    return (type === 'Hutang' || type === 'Saya Berhutang') && d.status !== 'Paid';
  }).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalPiutang = debts.filter(d => {
    const type = d.type || '';
    return (type === 'Piutang' || type === 'Piutang (Dia Berhutang)') && d.status !== 'Paid';
  }).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const filteredDebts = debts.filter(d => {
    if (filterType !== 'Semua') {
      const type = d.type || '';
      const isHutang = type === 'Hutang' || type === 'Saya Berhutang';
      if (filterType === 'Hutang' && !isHutang) return false;
      if (filterType === 'Piutang' && isHutang) return false;
    }

    if (filterDue !== 'Semua' && d.due) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const dueDate = new Date(d.due);
      dueDate.setHours(0, 0, 0, 0);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (filterDue === 'Overdue') return diffDays < 0 && d.status !== 'Paid';
      if (filterDue === 'Akan Jatuh Tempo') return diffDays >= 0 && diffDays <= 7 && d.status !== 'Paid';
      if (filterDue === 'Bulan Ini') return dueDate.getMonth() === now.getMonth() && dueDate.getFullYear() === now.getFullYear();
      if (filterDue === 'Tahun Ini') return dueDate.getFullYear() === now.getFullYear();
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'Terlama') return new Date(a.due || 0).getTime() - new Date(b.due || 0).getTime();
    if (sortBy === 'Nominal Tertinggi') return (b.amount || 0) - (a.amount || 0);
    if (sortBy === 'Nominal Terendah') return (a.amount || 0) - (b.amount || 0);
    // Default 'Terbaru'
    return new Date(b.due || 0).getTime() - new Date(a.due || 0).getTime();
  });

  const getStatusInfo = (debt: any) => {
    if (debt.status === 'Paid') return { label: 'Lunas', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    if (!debt.due) return { label: 'Belum Lunas', color: 'bg-[var(--color-stabilo)]/10 text-[var(--color-stabilo)] border-[var(--color-stabilo)]/20' };

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dueDate = new Date(debt.due);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));


    if (diffDays < 0) return { label: 'Sudah Jatuh Tempo', color: 'bg-negative/10 text-negative border-negative/20', isOverdue: true };
    if (diffDays <= 7) return { label: 'Akan Jatuh Tempo', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' };

    return { label: 'Belum Lunas', color: 'bg-[var(--color-stabilo)]/10 text-[var(--color-stabilo)] border-[var(--color-stabilo)]/20' };
  };

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6 lg:space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-bold flex items-center gap-3">
            Hutang & Piutang
          </h2>
          <button onClick={openCreateModal} className="bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black px-4 h-10 rounded-xl flex items-center gap-2 text-xs lg:text-sm font-bold transition-all shadow-[0_0_15px_rgba(204,255,0,0.3)] whitespace-nowrap">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Catat Baru</span><span className="sm:hidden">Catat</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:gap-3 w-full">
          <ModernDropdown
            value={filterType}
            onChange={setFilterType}
            options={[
              { value: 'Semua', label: 'Semua Tipe' },
              { value: 'Hutang', label: 'Hutang Saya' },
              { value: 'Piutang', label: 'Piutang (Uang di Orang)' }
            ]}
          />
          <ModernDropdown
            value={filterDue}
            onChange={setFilterDue}
            options={[
              { value: 'Semua', label: 'Semua Waktu' },
              { value: 'Akan Jatuh Tempo', label: 'Akan Jatuh Tempo (≤ 7 Hari)' },
              { value: 'Overdue', label: 'Sudah Jatuh Tempo' },
              { value: 'Bulan Ini', label: 'Bulan Ini' },
              { value: 'Tahun Ini', label: 'Tahun Ini' }
            ]}
          />
          <ModernDropdown
            className="col-span-2 sm:col-span-1"
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'Terbaru', label: 'Urutkan: Terbaru' },
              { value: 'Terlama', label: 'Urutkan: Terlama' },
              { value: 'Nominal Tertinggi', label: 'Nominal Tertinggi' },
              { value: 'Nominal Terendah', label: 'Nominal Terendah' }
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-negative/5 to-transparent p-5 lg:p-7 rounded-[1.5rem] border border-negative/30 hover:border-negative/50 hover:shadow-[0_8px_30px_rgba(255,77,77,0.15)] transition-all duration-300 group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Receipt className="w-32 h-32 text-negative" strokeWidth={1.5} />
          </div>
          <div className="relative z-10 flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-negative/10 text-negative backdrop-blur-sm border border-negative/20">
                  <Receipt className="w-5 h-5" />
                </div>
                <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">Total Hutang Saya</p>
              </div>
              <button onClick={() => setShowNominal(!showNominal)} className="p-1.5 rounded-lg bg-negative/5 hover:bg-negative/10 text-negative/70 hover:text-negative transition-colors">
                {showNominal ? <Eye className="w-4 h-4 md:w-5 md:h-5" /> : <EyeOff className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
            </div>
            <p className="text-3xl lg:text-4xl font-black text-negative tracking-tight mt-1">
              {showNominal ? formatRp(totalHutang) : 'Rp ••••••••'}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-[var(--color-stabilo)]/10 dark:from-[var(--color-stabilo)]/5 to-transparent p-5 lg:p-7 rounded-[1.5rem] border border-black/10 dark:border-[var(--color-stabilo)]/30 hover:border-[var(--color-stabilo)]/50 hover:shadow-[0_8px_30px_rgba(204,255,0,0.15)] transition-all duration-300 group">
          <div className="absolute -right-4 -bottom-4 opacity-[0.15] dark:opacity-5 group-hover:opacity-20 dark:group-hover:opacity-10 transition-opacity duration-500">
            <HandCoins className="w-32 h-32 text-emerald-600 dark:text-[var(--color-stabilo)]" strokeWidth={1.5} />
          </div>
          <div className="relative z-10 flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-[var(--color-stabilo)]/10 text-emerald-600 dark:text-[var(--color-stabilo)] backdrop-blur-sm border border-black/10 dark:border-[var(--color-stabilo)]/20">
                  <HandCoins className="w-5 h-5" />
                </div>
                <p className="text-xs lg:text-sm text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Total Piutang (Uang di Orang)</p>
              </div>
              <button onClick={() => setShowNominal(!showNominal)} className="p-1.5 rounded-lg bg-emerald-600/5 dark:bg-[var(--color-stabilo)]/10 hover:bg-emerald-600/10 dark:hover:bg-[var(--color-stabilo)]/20 text-emerald-600/70 dark:text-[var(--color-stabilo)]/70 hover:text-emerald-600 dark:hover:text-[var(--color-stabilo)] transition-colors">
                {showNominal ? <Eye className="w-4 h-4 md:w-5 md:h-5" /> : <EyeOff className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
            </div>
            <p className="text-3xl lg:text-4xl font-black text-emerald-600 dark:text-[var(--color-stabilo)] tracking-tight mt-1">
              {showNominal ? formatRp(totalPiutang) : 'Rp ••••••••'}
            </p>
          </div>
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
          <div className="flex flex-col gap-2 p-2 sm:gap-3 sm:p-3">
            {filteredDebts.map((d, i) => {
              const statusInfo = getStatusInfo(d);
              const isPiutang = (d.type || '').includes('Piutang');

              return (
                <div key={i} className="group px-4 py-3 sm:px-5 sm:py-3.5 lg:px-6 lg:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 lg:gap-6 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 relative border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 rounded-[1.5rem] bg-white/50 dark:bg-white/5 shadow-sm hover:shadow-md overflow-visible">

                  {/* Header Section (Avatar + Name + Status) */}
                  <div className="flex items-start sm:items-center gap-3 lg:gap-4 w-full sm:w-auto">
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-inner ${d.status === 'Paid' ? 'bg-slate-500/10 text-slate-500' : isPiutang ? 'bg-black/5 dark:bg-[var(--color-stabilo)]/15 text-emerald-600 dark:text-[var(--color-stabilo)]' : 'bg-negative/15 text-negative'}`}>
                      {d.status === 'Paid' ? <CheckCircle2 className="w-6 lg:w-7 h-6 lg:h-7" /> : <Users className="w-6 lg:w-7 h-6 lg:h-7 drop-shadow-md" />}
                    </div>

                    <div className="flex-1 min-w-0 pr-6 sm:pr-0">
                      <div className="flex flex-col gap-1 mb-1.5">
                        <h3 className={`font-bold text-base lg:text-[1.1rem] truncate leading-tight ${d.status === 'Paid' ? 'line-through text-slate-500' : 'text-slate-800 dark:text-white'}`}>
                          {d.name || 'Tanpa Nama'}
                        </h3>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] lg:text-[11px] font-bold ${statusInfo.color}`}>
                            {statusInfo.label === 'Sudah Jatuh Tempo' && <AlertCircle className="w-3.5 h-3.5" />}
                            {statusInfo.label === 'Akan Jatuh Tempo' && <Clock className="w-3.5 h-3.5" />}
                            {statusInfo.label === 'Sudah Lunas' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile context menu button */}
                    <div className="sm:hidden absolute top-4 right-2">
                      <button onClick={() => setActiveMenuId(activeMenuId === d.id ? null : d.id)} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {activeMenuId === d.id && (
                        <>
                          <div className="fixed inset-0 z-[40]" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                          <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-[#1a1f2e] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/5 overflow-hidden z-[50]">
                            <button onClick={(e) => { e.stopPropagation(); handleEdit(d); }} className="w-full px-4 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2">
                              <Edit2 className="w-4 h-4" /> Edit
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }} className="w-full px-4 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 text-negative flex items-center gap-2">
                              <Trash2 className="w-4 h-4" /> Hapus
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Due Date & Amount Section */}
                  <div className="flex items-center sm:items-end justify-between sm:justify-end gap-3 lg:gap-5 pl-14 sm:pl-0 w-full sm:w-auto mt-1 sm:mt-0">

                    {d.status !== 'Paid' && (
                      <button
                        onClick={() => handleMarkPaid(d)}
                        title="Tandai Lunas"
                        className="flex-shrink-0 self-center sm:self-auto p-2.5 sm:px-4 sm:py-2 bg-black/5 dark:bg-white/5 hover:bg-positive/20 border border-black/5 dark:border-white/5 hover:border-positive/30 rounded-xl transition-all duration-300 text-emerald-600 dark:text-positive group-hover:shadow-[0_0_15px_rgba(30,228,148,0.2)] flex items-center gap-2"
                      >
                        <Check className="w-5 h-5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline text-xs font-bold">Lunas</span>
                      </button>
                    )}

                    <div className="flex flex-col gap-0.5 sm:text-right flex-1 sm:flex-none">
                      <span className="inline-flex items-center gap-1.5 text-[11px] lg:text-xs text-slate-400 font-medium bg-black/10 sm:bg-transparent px-2 sm:px-0 py-0.5 rounded-md w-max sm:ml-auto">
                        <Clock className="w-3 h-3 opacity-70" />
                        Jatuh tempo: {d.due ? new Date(d.due).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </span>
                      <p className={`text-xl lg:text-2xl font-black tracking-tight mt-0.5 ${d.status === 'Paid' ? 'text-slate-500 line-through' : ''}`}>
                        {showNominal ? formatRp(d.amount) : 'Rp ••••••••'}
                      </p>
                    </div>

                    <div className="flex items-center flex-shrink-0">
                      {/* Desktop Context Menu */}
                      <div className="hidden sm:block relative">
                        <button onClick={() => setActiveMenuId(activeMenuId === d.id ? null : d.id)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-slate-800 dark:hover:text-white">
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {activeMenuId === d.id && (
                          <>
                            <div className="fixed inset-0 z-[40]" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                            <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-[#1a1f2e] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/5 overflow-hidden z-[50]">
                              <button onClick={(e) => { e.stopPropagation(); handleEdit(d); }} className="w-full px-4 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2">
                                <Edit2 className="w-4 h-4" /> Edit
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }} className="w-full px-4 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 text-negative flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> Hapus
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
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
