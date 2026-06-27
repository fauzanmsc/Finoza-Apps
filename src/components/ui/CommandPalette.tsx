import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, ArrowLeftRight, WalletCards, FileText, PieChart, Users, Calendar, Target, BarChart3, Settings, LogOut, Tags } from 'lucide-react';
import { createPortal } from 'react-dom';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onAddTransaction: () => void;
}

export default function CommandPalette({ isOpen, onClose, onLogout, onAddTransaction }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', type: 'page', path: '/dashboard' },
    { id: 'transactions', icon: ArrowLeftRight, label: 'Daftar Transaksi', type: 'page', path: '/transactions' },
    { id: 'add-transaction', icon: ArrowLeftRight, label: 'Catat Transaksi Baru', type: 'action', action: onAddTransaction },
    { id: 'accounts', icon: WalletCards, label: 'Aset & Rekening', type: 'page', path: '/accounts' },
    { id: 'journal', icon: FileText, label: 'Jurnal Keuangan', type: 'page', path: '/journal' },
    { id: 'budget', icon: PieChart, label: 'Anggaran Bulanan', type: 'page', path: '/budget' },
    { id: 'debts', icon: Users, label: 'Hutang Piutang', type: 'page', path: '/debts' },
    { id: 'schedules', icon: Calendar, label: 'Jadwal & To-Do', type: 'page', path: '/schedules' },
    { id: 'goals', icon: Target, label: 'Tujuan Finansial', type: 'page', path: '/goals' },
    { id: 'reports', icon: BarChart3, label: 'Laporan Bulanan', type: 'page', path: '/reports' },
    { id: 'categories', icon: Tags, label: 'Kategori', type: 'page', path: '/categories' },
    { id: 'settings', icon: Settings, label: 'Pengaturan', type: 'page', path: '/settings' },
    { id: 'logout', icon: LogOut, label: 'Keluar', type: 'action', action: onLogout, danger: true },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          const cmd = filteredCommands[selectedIndex];
          if (cmd.type === 'page' && cmd.path) {
            navigate(cmd.path);
            onClose();
          } else if (cmd.type === 'action' && cmd.action) {
            cmd.action();
            onClose();
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-4 border-b border-black/5 dark:border-white/5">
          <Search className="w-6 h-6 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ketik perintah atau cari halaman..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-none outline-none text-xl text-[var(--color-text-foreground)] placeholder:text-slate-500"
          />
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md">
            <span>ESC</span> untuk tutup
          </div>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Tidak ada hasil yang ditemukan untuk "{search}"
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    if (cmd.type === 'page' && cmd.path) navigate(cmd.path);
                    else if (cmd.type === 'action' && cmd.action) cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors ${selectedIndex === idx ? (cmd.danger ? 'bg-red-500/10 text-red-500' : 'bg-black/5 dark:bg-white/10 text-[var(--color-text-foreground)]') : 'text-[var(--color-text-muted)] hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <cmd.icon className={`w-5 h-5 ${selectedIndex === idx && cmd.danger ? 'text-red-500' : ''}`} />
                    <span className="font-medium text-base">{cmd.label}</span>
                  </div>
                  <div className="text-xs text-slate-500 capitalize">{cmd.type}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
