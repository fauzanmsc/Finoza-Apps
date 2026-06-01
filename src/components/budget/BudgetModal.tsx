import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Tag } from 'lucide-react';
import { fetchApi } from '../../services/api';
import { useAuth } from '../../store/useAuth';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  initialData?: any;
}

export default function BudgetModal({ isOpen, onClose, onRefresh, initialData }: BudgetModalProps) {
  const [budgetName, setBudgetName] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useAuth(state => state.token);

  useEffect(() => {
    if (initialData && isOpen) {
      setBudgetName(initialData.name || '');
      setBudgetLimit(formatRupiah(initialData.limit?.toString() || '0'));
    } else {
      setBudgetName('');
      setBudgetLimit('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      id: initialData?.id,
      name: budgetName,
      limit: Number(budgetLimit.replace(/\D/g, '')),
      color: 'bg-[var(--color-stabilo)]'
    };

    const action = initialData ? 'UPDATE_BUDGET' : 'CREATE_BUDGET';
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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-surface border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 lg:slide-in-from-bottom-0 lg:zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Anggaran' : 'Buat Anggaran Baru'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Kategori Anggaran</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={budgetName}
                  onChange={(e) => setBudgetName(e.target.value)}
                  placeholder="Misal: Makanan & Minuman"
                  required
                  className="w-full bg-surface-light border border-black/5 dark:border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--color-text-foreground)] focus:outline-none focus:border-[var(--color-stabilo)] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">Batas Nominal (Limit)</label>
              <input
                type="text"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(formatRupiah(e.target.value))}
                placeholder="Rp 0"
                required
                className="w-full bg-surface-light border border-black/5 dark:border-white/5 rounded-xl py-3 px-4 text-xl font-bold text-[var(--color-text-foreground)] placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-stabilo)] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black font-medium py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] disabled:opacity-70"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Anggaran'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
