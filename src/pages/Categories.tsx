import { useState, useEffect } from 'react';
import {
  Pizza,
  Car,
  Briefcase,
  ArrowDownLeft,
  ShoppingBag,
  Coffee,
  Smartphone,
  Monitor,
  Home,
  Heart,
  Smile,
  Tags,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2
} from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';
import EmptyState from '../components/ui/EmptyState';
import ConfirmModal from '../components/ui/ConfirmModal';

const ICON_MAP: Record<string, any> = {
  'pizza': Pizza,
  'car': Car,
  'briefcase': Briefcase,
  'arrow-down-left': ArrowDownLeft,
  'shopping-bag': ShoppingBag,
  'coffee': Coffee,
  'smartphone': Smartphone,
  'monitor': Monitor,
  'home': Home,
  'heart': Heart,
  'smile': Smile,
  'tags': Tags,
};

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean; id: string | null}>({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const token = useAuth(state => state.token);

  const [formData, setFormData] = useState({
    name: '',
    category_type: 'Expense',
    icon_name: 'tags',
    color_hex: '#F43F5E'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    const res = await fetchApi('GET_CATEGORIES', {}, token!);
    if (res.status === 'success') {
      setCategories(res.data || []);
    }
    setIsLoading(false);
  };

  const handleDelete = (id: string) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (confirmModal.id) {
      setIsDeleting(true);
      await fetchApi('DELETE_CATEGORY', { id: confirmModal.id }, token!);
      setIsDeleting(false);
      setConfirmModal({ isOpen: false, id: null });
      loadCategories();
    }
  };

  const handleEdit = (cat: any) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name,
      category_type: cat.category_type || cat.type || 'Expense',
      icon_name: cat.icon_name || cat.icon || 'tags',
      color_hex: cat.color_hex || cat.color || '#F43F5E'
    });
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingCat(null);
    setFormData({
      name: '',
      category_type: 'Expense',
      icon_name: 'tags',
      color_hex: '#F43F5E'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      id: editingCat?.id,
      ...formData
    };

    const action = editingCat ? 'UPDATE_CATEGORY' : 'CREATE_CATEGORY';
    await fetchApi(action, payload, token!);

    setIsSubmitting(false);
    setIsModalOpen(false);
    loadCategories();
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-stabilo)]" /></div>;
  }

  const expenses = categories.filter(c => (c.category_type || c.type) === 'Expense');
  const incomes = categories.filter(c => (c.category_type || c.type) === 'Income');
  const transfers = categories.filter(c => (c.category_type || c.type) === 'Transfer');

  const renderCategoryGroup = (title: string, items: any[]) => (
    <div className="mb-10">
      <h3 className="text-lg font-bold mb-4 text-[var(--color-text-muted)]">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon_name || cat.icon] || Tags;
          const catColor = cat.color_hex || cat.color || '#F43F5E';
          return (
            <div key={cat.id} className="group glass rounded-3xl p-4 lg:p-5 relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-[var(--color-stabilo)]/10 cursor-pointer">
              <div 
                className="absolute top-0 right-0 w-16 h-16 lg:w-24 lg:h-24 rounded-full blur-2xl lg:blur-3xl opacity-20 -mr-6 -mt-6 lg:-mr-10 lg:-mt-10 transition-all group-hover:opacity-40"
                style={{ backgroundColor: catColor }}
              />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3 lg:mb-4">
                  <div 
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: `${catColor}20`, color: catColor }}
                  >
                    <IconComponent className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(cat); }} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(cat.id); }} className="p-1.5 hover:bg-negative/20 hover:text-negative rounded-lg text-slate-300 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <h4 className="font-bold text-sm lg:text-base text-[var(--color-text-foreground)] mb-1 leading-tight">{cat.name}</h4>
                <p className="text-[10px] lg:text-xs text-[var(--color-text-muted)] mt-auto">{cat.category_type || cat.type}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Kategori</h2>
          <p className="text-[10px] lg:text-sm text-[var(--color-text-muted)] mt-1">Atur kategori pengeluaran dan pemasukan Anda.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl flex items-center gap-2 text-xs lg:text-sm font-bold transition-all shadow-lg shadow-[var(--color-stabilo)]/20 hover:shadow-[var(--color-stabilo)]/40 hover:-translate-y-0.5 whitespace-nowrap"
        >
          <Plus className="w-4 lg:w-5 h-4 lg:h-5" /> Tambah Kategori
        </button>
      </div>

      <div className="mt-8">
        {expenses.length > 0 && renderCategoryGroup('Pengeluaran', expenses)}
        {incomes.length > 0 && renderCategoryGroup('Pemasukan', incomes)}
        {transfers.length > 0 && renderCategoryGroup('Transfer', transfers)}
        {categories.length === 0 && (
          <EmptyState
            icon={Tags}
            title="Belum Ada Kategori"
            description="Kategori membantu Anda mengelompokkan transaksi. Buat kategori pertama Anda sekarang."
            actionLabel="Tambah Kategori"
            onAction={openNewModal}
          />
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-md glass border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold">{editingCat ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="text-sm text-slate-400 block mb-2 font-medium">Nama Kategori</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Cth: Makanan & Minuman"
                  required
                  className="w-full bg-surface-light border border-black/5 dark:border-white/5 rounded-xl py-3 px-4 text-sm text-[var(--color-text-foreground)] focus:outline-none focus:border-[var(--color-stabilo)] transition-all"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-2 font-medium">Tipe Transaksi</label>
                <div className="flex p-1 bg-surface-light rounded-xl">
                  {['Expense', 'Income', 'Transfer'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({...formData, category_type: type as any})}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${formData.category_type === type ? 'bg-[var(--color-stabilo)] text-black shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                      {type === 'Expense' ? 'Pengeluaran' : type === 'Income' ? 'Pemasukan' : 'Transfer'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-2 font-medium">Warna</label>
                <div className="flex flex-wrap gap-3">
                  {['#F43F5E', '#EC4899', '#D946EF', '#8B5CF6', '#6366F1', '#3B82F6', '#0EA5E9', '#10B981', '#22C55E', '#EAB308', '#F97316', '#EF4444', '#94A3B8'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({...formData, color_hex: color})}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${formData.color_hex === color ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110' : 'hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-2 font-medium">Ikon</label>
                <div className="grid grid-cols-6 gap-2">
                  {Object.keys(ICON_MAP).map(iconName => {
                    const IconComp = ICON_MAP[iconName];
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormData({...formData, icon_name: iconName})}
                        className={`aspect-square rounded-xl flex items-center justify-center transition-all ${formData.icon_name === iconName ? 'bg-[var(--color-stabilo)] text-black shadow-md scale-105' : 'bg-surface-light text-slate-400 hover:bg-white/10 hover:text-white'}`}
                      >
                        <IconComp className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] disabled:opacity-70 mt-4"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        message="Yakin ingin menghapus kategori ini?"
        isLoading={isDeleting}
      />
    </div>
  );
}
