import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, WalletCards, Building2, Smartphone, Banknote, CreditCard, PiggyBank, Landmark, CircleDollarSign, Wallet } from 'lucide-react';
import { fetchApi } from '../../services/api';
import { useAuth } from '../../store/useAuth';

const ICON_OPTIONS = [
  { name: 'WalletCards', icon: WalletCards },
  { name: 'Building2', icon: Building2 },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Banknote', icon: Banknote },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'PiggyBank', icon: PiggyBank },
  { name: 'Landmark', icon: Landmark },
  { name: 'CircleDollarSign', icon: CircleDollarSign },
  { name: 'Wallet', icon: Wallet },
];

const COLOR_OPTIONS = [
  '#1E3A8A', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
  '#D946EF', '#84CC16', '#0EA5E9', '#E11D48',
];

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  initialData?: any;
}

export default function AccountModal({ isOpen, onClose, onRefresh, initialData }: AccountModalProps) {
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('Bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState('#1E3A8A');
  const [selectedIcon, setSelectedIcon] = useState('WalletCards');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useAuth(state => state.token);

  useEffect(() => {
    if (initialData && isOpen) {
      setAccountName(initialData.account_name || '');
      setAccountType(initialData.account_type || 'Bank');
      setInitialBalance(formatRupiah(initialData.initial_balance?.toString() || '0'));
      setSelectedColor(initialData.color_hex || '#1E3A8A');
      setSelectedIcon(initialData.icon_name || 'WalletCards');
    } else if (isOpen) {
      setAccountName('');
      setAccountType('Bank');
      setInitialBalance('');
      setSelectedColor('#1E3A8A');
      setSelectedIcon('WalletCards');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      id: initialData?.id,
      account_name: accountName,
      account_type: accountType,
      initial_balance: Number(initialBalance.replace(/\D/g, '')),
      color_hex: selectedColor,
      icon_name: selectedIcon,
    };

    const action = initialData ? 'UPDATE_ACCOUNT' : 'CREATE_ACCOUNT';
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

  const SelectedIconComponent = ICON_OPTIONS.find(ic => ic.name === selectedIcon)?.icon || WalletCards;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-surface border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        
        <div className="flex items-center justify-between p-5 border-b border-black/5 dark:border-white/5 sticky top-0 bg-surface z-30 shrink-0">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Rekening' : 'Tambah Rekening'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Preview Card */}
            <div className="rounded-2xl p-4 text-white relative z-0 overflow-hidden" style={{ background: selectedColor }}>
            <div className="absolute right-4 top-4 opacity-20">
              <SelectedIconComponent className="w-16 h-16" />
            </div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <SelectedIconComponent className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">{accountName || 'Nama Rekening'}</p>
                <p className="text-white/60 text-xs">{accountType}</p>
              </div>
            </div>
            <p className="text-2xl font-bold relative z-10">{initialBalance || 'Rp 0'}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Nama Rekening</label>
              <div className="relative">
                <SelectedIconComponent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Misal: Bank BCA"
                  required
                  className="w-full bg-surface-light border border-black/5 dark:border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--color-text-foreground)] focus:outline-none focus:border-[var(--color-stabilo)] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">Jenis Rekening</label>
              <select 
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full bg-surface-light border border-black/5 dark:border-white/5 rounded-xl py-3 px-4 text-sm text-[var(--color-text-foreground)] focus:outline-none focus:border-[var(--color-stabilo)] transition-all appearance-none"
              >
                <option value="Bank">Bank</option>
                <option value="E-Wallet">E-Wallet</option>
                <option value="Cash">Cash / Tunai</option>
                <option value="Investment">Investasi</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">Saldo Awal</label>
              <input
                type="text"
                value={initialBalance}
                onChange={(e) => setInitialBalance(formatRupiah(e.target.value))}
                placeholder="Rp 0"
                required
                className="w-full bg-surface-light border border-black/5 dark:border-white/5 rounded-xl py-3 px-4 text-xl font-bold text-[var(--color-text-foreground)] placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-stabilo)] transition-all"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="text-sm text-slate-400 block mb-2">Warna Kartu</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="text-sm text-slate-400 block mb-2">Ikon</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((ic) => (
                  <button
                    key={ic.name}
                    type="button"
                    onClick={() => setSelectedIcon(ic.name)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${selectedIcon === ic.name ? 'bg-[var(--color-stabilo)] text-black shadow-lg' : 'bg-surface-light text-slate-400 border border-white/5'}`}
                  >
                    <ic.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black font-medium py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] disabled:opacity-70 mt-2"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Rekening'}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
