import { useState, useEffect } from 'react';
import { Target, Loader2, Calendar, X } from 'lucide-react';
import { fetchApi } from '../../services/api';
import { useAuth } from '../../store/useAuth';
import CurrencyInput, { parseRupiah } from '../ui/CurrencyInput';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingData?: any;
}

const COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'
];

export default function GoalModal({ isOpen, onClose, onSuccess, editingData }: GoalModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    deadline: '',
    color_hex: '#10B981',
    icon_name: 'target'
  });

  const token = useAuth(state => state.token);

  useEffect(() => {
    if (editingData) {
      setFormData({
        name: editingData.name || '',
        target_amount: editingData.target_amount || '',
        current_amount: editingData.current_amount || '',
        deadline: editingData.deadline ? new Date(editingData.deadline).toISOString().split('T')[0] : '',
        color_hex: editingData.color_hex || '#10B981',
        icon_name: editingData.icon_name || 'target'
      });
    } else {
      setFormData({
        name: '',
        target_amount: '',
        current_amount: '',
        deadline: '',
        color_hex: '#10B981',
        icon_name: 'target'
      });
    }
  }, [editingData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      ...formData,
      target_amount: parseRupiah(formData.target_amount),
      current_amount: parseRupiah(formData.current_amount),
      id: editingData?.id
    };

    const action = editingData ? 'UPDATE_GOAL' : 'CREATE_GOAL';
    const res = await fetchApi(action, payload, token!);

    if (res.status === 'success') {
      onSuccess();
      onClose();
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md glass border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5 flex-shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-[var(--color-stabilo)]" />
            {editingData ? 'Edit Tujuan' : 'Tambah Tujuan'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-[var(--color-text-foreground)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 scrollbar-hide">
          <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Nama Tujuan</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-[var(--color-text-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-stabilo)] transition-all"
            placeholder="Misal: Dana Darurat, Liburan ke Jepang"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Target Dana</label>
            <div className="relative">
              <CurrencyInput
                required
                value={formData.target_amount}
                onChange={(val) => setFormData({ ...formData, target_amount: val })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Terkumpul Saat Ini</label>
            <div className="relative">
              <CurrencyInput
                value={formData.current_amount}
                onChange={(val) => setFormData({ ...formData, current_amount: val })}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Tenggat Waktu (Target Selesai)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              <Calendar className="w-5 h-5" />
            </span>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-[var(--color-text-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-stabilo)] transition-all [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Warna Identitas</label>
          <div className="flex flex-wrap gap-3">
            {COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color_hex: color })}
                className={`w-10 h-10 rounded-xl transition-all duration-200 flex items-center justify-center ${formData.color_hex === color ? 'ring-2 ring-offset-2 ring-offset-[var(--color-background)] ring-white scale-110 shadow-lg' : 'hover:scale-105'}`}
                style={{ backgroundColor: color }}
              >
                {formData.color_hex === color && <div className="w-2 h-2 bg-white rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingData ? 'Simpan Perubahan' : 'Buat Tujuan')}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
