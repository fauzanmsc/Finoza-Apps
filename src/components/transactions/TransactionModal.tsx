import { useState, useEffect } from 'react';
import { X, Calendar, WalletCards, FileText, ArrowUpRight, ArrowDownRight, ArrowLeftRight, Tags } from 'lucide-react';
import { cn } from '../../lib/utils';
import { fetchApi } from '../../services/api';
import { useAuth } from '../../store/useAuth';

type TxType = 'Expense' | 'Income' | 'Transfer';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  initialData?: any;
}

export default function TransactionModal({ isOpen, onClose, onRefresh, initialData }: TransactionModalProps) {
  const [txType, setTxType] = useState<TxType>('Expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useAuth(state => state.token);

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        const [resAcc, resCat] = await Promise.all([
          fetchApi('GET_ACCOUNTS', {}, token!),
          fetchApi('GET_CATEGORIES', {}, token!)
        ]);
        if (resAcc.status === 'success' && Array.isArray(resAcc.data)) {
          setAccounts(resAcc.data);
          if (initialData?.account_src_id) {
            setAccountId(initialData.account_src_id);
          } else if (resAcc.data.length > 0) {
            setAccountId(resAcc.data[0].id);
          }
        }
        if (resCat.status === 'success' && Array.isArray(resCat.data)) {
          setCategories(resCat.data);
          if (initialData?.category_id) {
            setCategoryId(initialData.category_id);
          }
        }
      };
      loadData();
      
      if (initialData) {
        setTxType((initialData.tx_type || 'Expense') as TxType);
        setAmount(formatRupiah(initialData.amount?.toString() || '0'));
        setNote(initialData.note || '');
        setTxDate(initialData.tx_date || new Date().toISOString().split('T')[0]);
      } else {
        setTxType('Expense');
        setAmount('');
        setNote('');
        setTxDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [initialData, isOpen, token]);

  const filteredCategories = categories.filter(c => (c.category_type || c.type) === txType);

  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.find(c => c.id === categoryId)) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [txType, categories, categoryId, filteredCategories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      id: initialData?.id,
      tx_type: txType,
      amount: Number(amount.replace(/\D/g, '')),
      note: note,
      tx_date: txDate,
      account_src_id: accountId,
      category_id: categoryId,
    };

    const action = initialData ? 'UPDATE_TRANSACTION' : 'CREATE_TRANSACTION';
    await fetchApi(action, payload, token!);

    setIsSubmitting(false);
    onRefresh();
    onClose();
  };

  const formatRupiah = (val: string) => {
    const numberString = val.replace(/[^,\d]/g, '').toString();
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
    return rupiah ? 'Rp ' + rupiah : '';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface border border-white/10 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Transaksi' : 'Catat Transaksi'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex p-1 bg-surface-light rounded-xl">
            {(['Expense', 'Income', 'Transfer'] as TxType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTxType(type)}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2",
                  txType === type ? 
                    "bg-[var(--color-stabilo)] text-white shadow-[0_4px_12px_rgba(204,255,0,0.2)]" 
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)]"
                )}
              >
                {type === 'Expense' && <ArrowDownRight className="w-4 h-4" />}
                {type === 'Income' && <ArrowUpRight className="w-4 h-4" />}
                {type === 'Transfer' && <ArrowLeftRight className="w-4 h-4" />}
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Nominal</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(formatRupiah(e.target.value))}
                placeholder="Rp 0"
                required
                className="w-full bg-surface-light border border-black/5 dark:border-white/5 rounded-xl py-4 px-4 text-3xl font-bold text-[var(--color-text-foreground)] placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-stabilo)] transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-sm text-slate-400 block mb-2">Tanggal</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="date" 
                      required 
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      className="w-full bg-surface-light border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--color-stabilo)]" 
                    />
                  </div>
               </div>
               <div>
                  <label className="text-sm text-slate-400 block mb-2">Rekening</label>
                  <div className="relative">
                    <WalletCards className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full bg-surface-light border border-black/5 dark:border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--color-text-foreground)] focus:outline-none focus:border-[var(--color-stabilo)] appearance-none"
                      required
                    >
                      {accounts.length === 0 && <option value="">Buat rekening dulu</option>}
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.account_name}</option>
                      ))}
                    </select>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 block mb-2">Kategori</label>
                <div className="relative">
                  <Tags className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-surface-light border border-black/5 dark:border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--color-text-foreground)] focus:outline-none focus:border-[var(--color-stabilo)] appearance-none"
                    required
                  >
                    {filteredCategories.length === 0 && <option value="">Buat kategori dulu</option>}
                    {filteredCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">Catatan</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Keterangan..."
                    className="w-full bg-surface-light border border-black/5 dark:border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--color-text-foreground)] focus:outline-none focus:border-[var(--color-stabilo)] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-white font-medium py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] disabled:opacity-70"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>
    </div>
  );
}
