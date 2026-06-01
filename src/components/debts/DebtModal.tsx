import { useState, useEffect } from 'react';
import { X, User, Calendar } from 'lucide-react';
import { fetchApi } from '../../services/api';
import { useAuth } from '../../store/useAuth';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  initialData?: any;
}

export default function DebtModal({ isOpen, onClose, onRefresh, initialData }: DebtModalProps) {
  const [debtName, setDebtName] = useState('');
  const [debtType, setDebtType] = useState('Saya Berhutang');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useAuth(state => state.token);

  useEffect(() => {
    if (initialData && isOpen) {
      setDebtName(initialData.name || '');
      setDebtType(initialData.type || 'Saya Berhutang');
      setAmount(formatRupiah(initialData.amount?.toString() || '0'));
      setDueDate(initialData.due || new Date().toISOString().split('T')[0]);
    } else {
      setDebtName('');
      setDebtType('Saya Berhutang');
      setAmount('');
      setDueDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      id: initialData?.id,
      name: debtName,
      type: debtType,
      amount: Number(amount.replace(/\D/g, '')),
      due: dueDate,
      status: 'Active'
    };

    const action = initialData ? 'UPDATE_DEBT' : 'CREATE_DEBT';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md glass border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Hutang / Piutang' : 'Catat Baru'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Nama Peminjam / Yang Dihutangi</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={debtName}
                  onChange={(e) => setDebtName(e.target.value)}
                  placeholder="Nama orang..."
                  required
                  className="w-full bg-surface-light border border-black/5 dark:border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--color-text-foreground)] focus:outline-none focus:border-[var(--color-stabilo)] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">Jenis</label>
              <select 
                value={debtType}
                onChange={(e) => setDebtType(e.target.value)}
                className="w-full bg-surface-light border border-black/5 dark:border-white/5 rounded-xl py-3 px-4 text-sm text-[var(--color-text-foreground)] focus:outline-none focus:border-[var(--color-stabilo)] transition-all appearance-none"
              >
                <option value="Saya Berhutang">Saya Berhutang</option>
                <option value="Piutang (Dia Berhutang)">Piutang (Dia Berhutang)</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">Nominal</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(formatRupiah(e.target.value))}
                placeholder="Rp 0"
                required
                className="w-full bg-surface-light border border-black/5 dark:border-white/5 rounded-xl py-3 px-4 text-xl font-bold text-[var(--color-text-foreground)] placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-stabilo)] transition-all"
              />
            </div>
            
            <div>
               <label className="text-sm text-slate-400 block mb-2">Jatuh Tempo</label>
               <div className="relative">
                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="date" 
                   required 
                   value={dueDate}
                   onChange={(e) => setDueDate(e.target.value)}
                   className="w-full bg-surface-light border border-black/5 dark:border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--color-text-foreground)] focus:outline-none focus:border-[var(--color-stabilo)]" 
                 />
               </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black font-medium py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] disabled:opacity-70"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
          </button>
        </form>
      </div>
    </div>
  );
}
