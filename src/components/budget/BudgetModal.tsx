import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Pizza, Car, Briefcase, ArrowDownLeft, ShoppingBag, Coffee, Smartphone, Monitor, Home, Heart, Smile, Tags, WalletCards, Check } from 'lucide-react';
import { fetchApi } from '../../services/api';
import { useAuth } from '../../store/useAuth';

const ICON_MAP: Record<string, any> = {
  'pizza': Pizza, 'car': Car, 'briefcase': Briefcase, 'arrow-down-left': ArrowDownLeft, 'shopping-bag': ShoppingBag, 'coffee': Coffee, 'smartphone': Smartphone, 'monitor': Monitor, 'home': Home, 'heart': Heart, 'smile': Smile, 'tags': Tags, 'wallet': WalletCards
};

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
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const token = useAuth(state => state.token);

  useEffect(() => {
    if (isOpen && !initialData) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData && isOpen) {
      setBudgetName(initialData.name || '');
      setBudgetLimit(formatRupiah(initialData.limit?.toString() || '0'));
      setSelectedCatId(null);
    } else {
      setBudgetName('');
      setBudgetLimit('');
      setSelectedCatId(null);
    }
  }, [initialData, isOpen]);

  const loadCategories = async () => {
    const res = await fetchApi('GET_CATEGORIES', {}, token!);
    if (res.status === 'success') {
      const expenseOnly = (res.data || []).filter((c: any) => (c.category_type || '').toLowerCase() === 'expense');
      setCategories(expenseOnly);
    }
  };

  if (!isOpen) return null;

  const handleSelectCategory = (cat: any) => {
    setSelectedCatId(cat.id);
    setBudgetName(cat.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData && !selectedCatId) return;
    setIsSubmitting(true);
    
    const limitValue = Number(budgetLimit.replace(/\D/g, ''));
    const payload = {
      id: initialData?.id,
      name: budgetName,
      limit: limitValue,
      amount: limitValue,
      amount_limit: limitValue,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      category_id: selectedCatId || initialData?.category_id,
      color: 'bg-[var(--color-stabilo)]'
    };

    const action = initialData ? 'UPDATE_BUDGET' : 'CREATE_BUDGET';
    const res = await fetchApi(action, payload, token!);

    if (res && res.status === 'success') {
      onRefresh();
      onClose();
    } else {
      alert("Gagal menyimpan anggaran: " + (res?.message || 'Terjadi kesalahan pada server'));
    }
    
    setIsSubmitting(false);
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
            {!initialData && (
            <div>
              <label className="text-sm text-slate-400 block mb-3">Pilih Kategori Anggaran</label>
              <div className="max-h-[200px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {categories.length === 0 ? (
                  <p className="text-sm text-center text-[var(--color-text-muted)] py-4">Memuat kategori...</p>
                ) : (
                  categories.map(cat => {
                    const IconComp = ICON_MAP[cat.icon_name] || Tags;
                    const isSelected = selectedCatId === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 group ${
                          isSelected 
                            ? 'bg-[var(--color-stabilo)]/15 border-[var(--color-stabilo)]/50 border ring-1 ring-[var(--color-stabilo)]/30' 
                            : 'bg-black/5 dark:bg-white/5 border border-transparent hover:bg-black/10 dark:hover:bg-white/10 hover:border-white/10'
                        }`}
                      >
                        <div 
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${isSelected ? 'shadow-lg' : ''}`} 
                          style={{ backgroundColor: `${cat.color_hex || '#64748b'}20` }}
                        >
                          <IconComp className="w-4 h-4" style={{ color: cat.color_hex || '#64748b' }} />
                        </div>
                        <span className={`text-sm font-semibold flex-1 truncate transition-colors ${isSelected ? 'text-[var(--color-stabilo)]' : 'text-[var(--color-text-foreground)]'}`}>
                          {cat.name}
                        </span>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[var(--color-stabilo)] flex items-center justify-center flex-shrink-0">
                            <Check className="w-3.5 h-3.5 text-black" />
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            )}

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
            disabled={isSubmitting || (!initialData && !selectedCatId)}
            className="w-full bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black font-medium py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <span>Menyimpan</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-[bounce_1s_infinite_0ms]"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-[bounce_1s_infinite_400ms]"></div>
                </div>
              </div>
            ) : 'Simpan Anggaran'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
