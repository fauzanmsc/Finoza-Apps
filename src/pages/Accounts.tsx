import { useState, useEffect } from 'react';
import { WalletCards, Plus, Loader2, MoreVertical, Edit2, Trash2, X, ArrowUpRight, ArrowDownRight, Building2, Smartphone, Banknote, CreditCard, PiggyBank, Landmark, CircleDollarSign, Wallet, Eye, EyeOff } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';
import AccountModal from '../components/accounts/AccountModal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmModal from '../components/ui/ConfirmModal';

const ICON_MAP: Record<string, any> = {
  WalletCards, Building2, Smartphone, Banknote, CreditCard, PiggyBank, Landmark, CircleDollarSign, Wallet
};

export default function Accounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean; id: string | null}>({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showNominal, setShowNominal] = useState(true);


  const token = useAuth(state => state.token);

  useEffect(() => {
    loadAccounts();
    loadTransactions();

    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    const res = await fetchApi('GET_ACCOUNTS', {}, token!);
    if (res.status === 'success') {
      setAccounts(res.data || []);
    }
    setIsLoading(false);
  };

  const loadTransactions = async () => {
    const res = await fetchApi('GET_TRANSACTIONS', {}, token!);
    if (res.status === 'success') {
      setTransactions(res.data || []);
    }
  };

  const handleDelete = (id: string) => {
    setActiveMenuId(null);
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (confirmModal.id) {
      setIsDeleting(true);
      await fetchApi('DELETE_ACCOUNT', { id: confirmModal.id }, token!);
      setIsDeleting(false);
      setConfirmModal({ isOpen: false, id: null });
      loadAccounts();
    }
  };

  const handleEdit = (acc: any) => {
    setEditingAccount(acc);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const openCreateModal = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  const getAccountTx = (accId: string) => transactions.filter(tx => tx.account_src_id === accId || tx.account_dst_id === accId);

  const getIcon = (name: string) => ICON_MAP[name] || WalletCards;

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-bold">Aset & Rekening</h2>
        <button onClick={openCreateModal} className="bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black px-3 lg:px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-[0_0_15px_rgba(204,255,0,0.2)]">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {/* Total Assets Summary */}
      <div className="glass rounded-2xl p-4 lg:p-6 border border-black/5 dark:border-white/10 relative overflow-hidden group">
        <div className="absolute right-0 top-0 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
          <WalletCards className="w-20 lg:w-32 h-20 lg:h-32 -mr-4 lg:-mr-6 -mt-4 lg:-mt-6" />
        </div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[var(--color-text-muted)] text-xs lg:text-sm font-medium">Total Seluruh Aset</p>
          <button 
            onClick={() => setShowNominal(!showNominal)} 
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-[var(--color-text-foreground)]"
            title={showNominal ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
          >
            {showNominal ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
          </button>
        </div>
        <p className="text-2xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-[var(--color-stabilo)] drop-shadow-sm dark:drop-shadow-md transition-all">
          {showNominal ? formatRp(accounts.reduce((acc, curr) => acc + Number(curr.initial_balance), 0)) : 'Rp ••••••••'}
        </p>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {accounts.map((acc: any, i: number) => {
          const IconComp = getIcon(acc.icon_name);
          return (
            <div 
              key={i} 
              className="glass rounded-2xl p-4 lg:p-6 flex flex-col justify-between h-36 lg:h-48 border-t-[4px] lg:border-t-[6px] transition-all hover:-translate-y-1 relative cursor-pointer active:scale-[0.98]" 
              style={{ borderTopColor: acc.color_hex || '#1E3A8A', zIndex: activeMenuId === acc.id ? 20 : 1 }}
              onClick={(e) => { e.stopPropagation(); setSelectedAccount(acc); setActiveMenuId(null); }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-8 lg:w-10 h-8 lg:h-10 rounded-xl flex items-center justify-center border border-white/5" style={{ backgroundColor: acc.color_hex ? acc.color_hex + '20' : '#1E3A8A20' }}>
                    <IconComp className="w-4 lg:w-5 h-4 lg:h-5" style={{ color: acc.color_hex || '#94a3b8' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm lg:text-lg leading-tight">{acc.account_name}</h3>
                    <p className="text-[10px] lg:text-xs text-slate-400">{acc.account_type}</p>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setActiveMenuId(activeMenuId === acc.id ? null : acc.id); 
                    }} 
                    className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)]"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {activeMenuId === acc.id && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-surface-light border border-white/10 rounded-xl shadow-xl overflow-hidden z-10">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(acc); }} className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2">
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(acc.id); }} className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 text-negative flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
                  {/* Account Balance */}
                  <div className="mt-4 lg:mt-6">
                    <p className="text-[10px] lg:text-xs text-slate-400 mb-1 lg:mb-1.5 font-medium">Saldo Saat Ini</p>
                    <p className="text-lg lg:text-2xl font-bold tracking-tight text-[var(--color-text-foreground)] drop-shadow-sm transition-all">
                      {showNominal ? formatRp(acc.initial_balance) : 'Rp ••••••••'}
                    </p>
                  </div>
            </div>
          );
        })}
        
        {accounts.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={WalletCards}
              title="Belum Ada Rekening"
              description="Anda belum memiliki rekening atau aset. Tambahkan sekarang untuk mulai melacak keuangan Anda."
              actionLabel="Tambah Rekening"
              onAction={openCreateModal}
            />
          </div>
        )}
      </div>

      {/* Account Detail Modal (show transactions for selected account) */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 lg:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAccount(null)} />
          <div className="relative w-full max-w-lg glass border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header with account card */}
            <div className="p-4 lg:p-6 text-white relative" style={{ background: selectedAccount.color_hex || '#1E3A8A' }}>
              <button onClick={() => setSelectedAccount(null)} className="absolute top-3 right-3 lg:top-4 lg:right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                <X className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
              </button>
              <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                {(() => { const IC = getIcon(selectedAccount.icon_name); return <div className="w-10 lg:w-12 h-10 lg:h-12 rounded-xl bg-white/20 flex items-center justify-center"><IC className="w-5 lg:w-6 h-5 lg:h-6" /></div>; })()}
                <div>
                  <h3 className="font-bold text-base lg:text-lg">{selectedAccount.account_name}</h3>
                  <p className="text-white/60 text-xs lg:text-sm">{selectedAccount.account_type}</p>
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-bold">{formatRp(selectedAccount.initial_balance)}</p>
            </div>

            {/* Transaction list */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              <h4 className="font-medium text-sm text-[var(--color-text-muted)] mb-4">Riwayat Transaksi</h4>
              <div className="space-y-3">
                {getAccountTx(selectedAccount.id).length > 0 ? getAccountTx(selectedAccount.id).map((tx: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-light/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.tx_type === 'Income' ? 'bg-positive/10' : 'bg-negative/10'}`}>
                        {tx.tx_type === 'Income' ? <ArrowDownRight className="w-4 h-4 text-positive" /> : <ArrowUpRight className="w-4 h-4 text-negative" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.note || 'Transaksi'}</p>
                        <p className="text-[10px] text-slate-500">{tx.tx_date}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold ${tx.tx_type === 'Income' ? 'text-positive' : 'text-negative'}`}>
                      {tx.tx_type === 'Income' ? '+' : '-'}{formatRp(tx.amount)}
                    </p>
                  </div>
                )) : (
                  <p className="text-center text-slate-500 text-sm py-8">Belum ada transaksi untuk rekening ini</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAccount(null);
        }}
        onRefresh={loadAccounts}
        initialData={editingAccount}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        message="Yakin ingin menghapus rekening ini?"
        confirmText="Hapus"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
