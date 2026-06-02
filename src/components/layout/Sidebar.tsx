import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  WalletCards,
  FileText,
  PieChart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Tags,
  User
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../store/useAuth';
import { useTheme } from '../../store/useTheme';
import { useState, useEffect } from 'react';
import ProfileModal from '../profile/ProfileModal';
import TransactionModal from '../transactions/TransactionModal';

interface SidebarProps {
  onNavigate?: () => void; // for closing mobile drawer on nav click
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isSidebarCompact, toggleSidebarCompact } = useTheme();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [imgCacheBuster, setImgCacheBuster] = useState('');

  useEffect(() => {
    setImgCacheBuster(`?t=${Date.now()}`);
  }, [user?.profile_picture_url]);

  const [transactionModalType, setTransactionModalType] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const handleLogoutConfirm = () => {
    setIsLogoutDialogOpen(false);
    logout();
    navigate('/login');
  };

  const navItems: any[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ArrowLeftRight, label: 'Transaksi', path: '/transactions' },
    { icon: WalletCards, label: 'Aset & Rekening', path: '/accounts' },
    { icon: FileText, label: 'Jurnal Keuangan', path: '/journal' },
    { icon: PieChart, label: 'Anggaran Bulanan', path: '/budget' },
    { icon: Users, label: 'Hutang Piutang', path: '/debts' },
    { icon: BarChart3, label: 'Laporan Bulanan', path: '/reports' },
    { icon: Tags, label: 'Kategori', path: '/categories' },
    { icon: Settings, label: 'Pengaturan', path: '/settings' },
  ];

  return (
    <>
      <aside className={`h-full flex flex-col py-6 bg-transparent transition-all duration-300 ${isSidebarCompact ? 'px-2' : 'px-6'}`}>
        {/* Header / Logo */}
        <div className={`flex items-center mb-10 transition-all ${isSidebarCompact ? 'flex-col gap-4 px-0' : 'justify-between px-2'}`}>
          <img
            src={isSidebarCompact ? "/favicon.png" : (theme === 'dark' ? "/logo-finoza-light.png" : "/logo-finoza-dark.png")}
            alt="Finoza Apps"
            className={`object-contain transition-all duration-300 ${isSidebarCompact ? 'h-8 w-8' : 'h-8'}`}
          />
          <button
            onClick={toggleSidebarCompact}
            className="hidden lg:flex p-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-[var(--color-text-foreground)] items-center justify-center flex-shrink-0"
            title={isSidebarCompact ? "Expand Sidebar" : "Compact Sidebar"}
          >
            {isSidebarCompact ? <PanelLeftOpen className="w-4 h-4 text-slate-400" /> : <PanelLeftClose className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item, idx) => {
            if (item.isDropdown) {
              return (
                <div key={idx} className="space-y-1">
                  <button
                    onClick={item.toggle}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                      item.isOpen ? "text-[var(--color-text-foreground)] bg-black/5 dark:bg-white/5" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)] hover:bg-black/5 dark:hover:bg-white/5",
                      isSidebarCompact ? "justify-center" : ""
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isSidebarCompact && <span>{item.label}</span>}
                    </div>
                    {!isSidebarCompact && (
                      item.isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {/* Dropdown Items */}
                  {item.isOpen && !isSidebarCompact && item.subItems && (
                    <div className="pl-11 pr-3 space-y-1 mt-1 animate-[fadeIn_0.2s_ease-out]">
                      {item.subItems.map((sub: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setTransactionModalType(sub.action)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  if (onNavigate) onNavigate();
                }}
                className={cn(
                  "w-full flex items-center justify-start gap-3 py-3.5 rounded-2xl transition-all duration-300 text-[15px] border-none outline-none cursor-pointer",
                  isSidebarCompact ? "justify-center px-0" : "px-4",
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-[var(--color-stabilo)] to-[#f4ffcc] text-[#0B101E] font-bold shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                    : "text-[var(--color-text-muted)] font-medium hover:text-[var(--color-text-foreground)] hover:bg-black/5 dark:hover:bg-white/5"
                )}
                title={isSidebarCompact ? item.label : undefined}
              >
                <item.icon className="w-[22px] h-[22px] flex-shrink-0 transition-all duration-300" />
                {!isSidebarCompact && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="mt-auto pt-4 space-y-2">

          <div className="px-2">
            <button
              onClick={toggleTheme}
              className={cn(
                "w-full flex items-center p-3.5 rounded-2xl border border-white/5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm font-medium text-[var(--color-text-foreground)]",
                isSidebarCompact ? "justify-center" : "justify-between"
              )}
              title={isSidebarCompact ? "Toggle Theme" : undefined}
            >
              <span className={cn("flex items-center", isSidebarCompact ? "" : "gap-3")}>
                {theme === 'dark' ? <Moon className="w-5 h-5 text-slate-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                {!isSidebarCompact && (theme === 'dark' ? 'Dark Mode' : 'Light Mode')}
              </span>
              {!isSidebarCompact && (
                <div className={`w-10 h-5 rounded-full p-0.5 transition-all shadow-inner ${theme === 'dark' ? 'bg-[var(--color-stabilo)] shadow-[0_0_10px_var(--color-glow-stabilo)]' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 rounded-full transition-transform ${theme === 'dark' ? 'bg-[#0B101E] translate-x-5' : 'bg-white translate-x-0'}`} />
                </div>
              )}
            </button>
          </div>

          <div
            className={cn(
              "flex items-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-xl transition-colors relative group",
              isSidebarCompact ? "justify-center" : "gap-3 px-2"
            )}
            onClick={() => setIsProfileModalOpen(true)}
          >
            {user?.profile_picture_url && !imgError && user.profile_picture_url !== 'null' ? (
              <img
                src={user.profile_picture_url}
                alt="Profile"
                onError={() => setImgError(true)}
                className="w-10 h-10 rounded-full object-cover bg-slate-800 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-slate-500" />
              </div>
            )}
            {!isSidebarCompact && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text-foreground)] truncate">{user?.full_name || 'User'}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] truncate">{user?.email}</p>
              </div>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); setIsLogoutDialogOpen(true); }}
              className={cn(
                "p-2 hover:bg-negative/20 hover:text-negative rounded-lg transition-colors",
                isSidebarCompact ? "absolute left-full ml-2 opacity-0 group-hover:opacity-100 bg-surface border border-white/10 shadow-xl" : "text-slate-500"
              )}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

      {/* Transaction Modal triggered from Sidebar Submenu */}
      <TransactionModal
        isOpen={transactionModalType !== null}
        onClose={() => setTransactionModalType(null)}
        onRefresh={() => window.location.reload()}
        initialData={transactionModalType ? { tx_type: transactionModalType } : null}
      />

      {/* Logout Confirmation Dialog */}
      {isLogoutDialogOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]" onClick={() => setIsLogoutDialogOpen(false)} />
          <div className="relative bg-white dark:bg-[#121620] border border-black/5 dark:border-white/10 rounded-3xl p-8 shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-sm w-full text-center animate-[popIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Keluar dari Aplikasi?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">Sesi akan berakhir dan kamu harus login kembali untuk mengakses dashboard.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutDialogOpen(false)}
                className="flex-1 py-3 px-4 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/90 font-semibold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 py-3 px-4 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition-colors shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes popIn {
              from { opacity: 0; transform: scale(0.9) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>,
        document.body
      )}
    </>
  );
}
