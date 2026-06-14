import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Type, FileText } from 'lucide-react';
import clsx from 'clsx';

interface Schedule {
  id: string;
  title: string;
  amount: number;
  due_date: string;
  status: 'Pending' | 'Completed';
  note?: string;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Schedule>) => void;
  onDelete?: (id: string) => void;
  initialData?: Schedule | null;
  selectedDate?: string | null;
  isLoading?: boolean;
}

export default function ScheduleModal({ isOpen, onClose, onSubmit, onDelete, initialData, selectedDate, isLoading }: ScheduleModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    due_date: '',
    status: 'Pending',
    note: ''
  });

  const formatRupiah = (val: string | number | null | undefined) => {
    if (val === undefined || val === null) return '';
    const numberString = String(val).replace(/[^,\d]/g, '').toString();
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

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          title: initialData.title,
          amount: formatRupiah(initialData.amount),
          due_date: initialData.due_date,
          status: initialData.status,
          note: initialData.note || ''
        });
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          title: '',
          amount: '',
          due_date: selectedDate || new Date().toISOString().substring(0, 10),
          status: 'Pending',
          note: ''
        });
      }
    }
  }, [isOpen, initialData, selectedDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...initialData,
      ...formData,
      amount: Number(String(formData.amount).replace(/\D/g, ''))
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-[#121620] border border-black/5 dark:border-white/10 rounded-3xl p-6 shadow-2xl animate-[popIn_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden">

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-stabilo)] rounded-full blur-[80px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-10 pointer-events-none" />

        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-xl font-bold text-[var(--color-text-foreground)] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--color-stabilo)]" />
            {initialData ? 'Edit Jadwal' : 'Buat Jadwal Baru'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Judul / Nama Tagihan</label>
            <div className="relative group">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[var(--color-stabilo)] transition-colors" />
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Cicilan Rumah, Listrik"
                className="w-full bg-slate-50 dark:bg-[#1c2230] border border-slate-200 dark:border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-stabilo)] transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nominal (Rp)</label>
            <div className="relative group">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[var(--color-stabilo)] transition-colors" />
              <input
                type="text"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: formatRupiah(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-[#1c2230] border border-slate-200 dark:border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-stabilo)] transition-all font-bold"
                placeholder="Rp 0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Tgl Jatuh Tempo</label>
              <div className="relative group">
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#1c2230] border border-slate-200 dark:border-none rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-stabilo)] transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as 'Pending' | 'Completed' })}
                className={clsx(
                  "w-full border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-stabilo)] transition-all appearance-none font-bold",
                  formData.status === 'Completed'
                    ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400"
                    : "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400"
                )}
              >
                <option value="Pending">⏳ Pending</option>
                <option value="Completed">✅ Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Catatan (Opsional)</label>
            <div className="relative group">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-[var(--color-stabilo)] transition-colors" />
              <textarea
                value={formData.note}
                onChange={e => setFormData({ ...formData, note: e.target.value })}
                placeholder="Catatan tambahan..."
                className="w-full bg-slate-50 dark:bg-[#1c2230] border border-slate-200 dark:border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-stabilo)] transition-all resize-none h-20"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {initialData && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(initialData.id)}
                disabled={isLoading}
                className="px-4 py-3 bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 font-bold rounded-xl hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors text-sm"
              >
                Hapus
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black font-extrabold py-3 rounded-xl transition-colors disabled:opacity-70 text-sm shadow-[0_0_15px_rgba(204,255,0,0.3)]"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
