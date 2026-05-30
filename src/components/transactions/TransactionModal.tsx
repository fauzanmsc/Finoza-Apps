import { useState, useEffect } from 'react';
import { X, Calendar, WalletCards, FileText, ArrowUpRight, ArrowDownRight, ArrowLeftRight } from 'lucide-react';
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
  const [accountId, setAccountId] = useState('Bank BCA');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useAuth(state => state.token);

  useEffect(() => {
    if (initialData && isOpen) {
      setTxType((initialData.tx_type || 'Expense') as TxType);
      setAmount(formatRupiah(initialData.amount?.toString() || '0'));
      setNote(initialData.note || '');
      setTxDate(initialData.tx_date || new Date().toISOString().split('T')[0]);
      setAccountId(initialData.account_src_id || 'Bank BCA');
    } else {
      setTxType('Expense');
      setAmount('');
      setNote('');
      setTxDate(new Date().toISOString().split('T')[0]);
      setAccountId('Bank BCA');
    }
  }, [initialData, isOpen]);

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
      category_id: 'CAT-123', // demo default
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
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-surface border border-white/10 rounded-t-3xl lg:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 lg:slide-in-from-bottom-0 lg:zoom-in-95 duration-200">
        
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
                    (type === 'Expense' ? "bg-negative text-white" : type === 'Income' ? "bg-[var(--color-stabilo)] text-black" : "bg-primary text-white") 
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
                    >
                      <option value="Bank BCA">Bank BCA</option>
                      <option value="GoPay">GoPay</option>
                    </select>
                  </div>
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
                  placeholder="Makan siang..."
                  className="w-full bg-surface-light border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--color-stabilo)]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black font-medium py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] disabled:opacity-70"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>
    </div>
  );
}
