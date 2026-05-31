import { NavLink, useNavigate } from 'react-router-dom';
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
import { useState } from 'react';
import ProfileModal from '../profile/ProfileModal';
import TransactionModal from '../transactions/TransactionModal';

interface SidebarProps {
  onNavigate?: () => void; // for closing mobile drawer on nav click
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isSidebarCompact, toggleSidebarCompact } = useTheme();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const [transactionModalType, setTransactionModalType] = useState<string | null>(null);
  const navigate = useNavigate();
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
    { icon: FileText, label: 'Jurnal', path: '/journal' },
    { icon: PieChart, label: 'Anggaran Bulanan', path: '/budget' },
    { icon: Users, label: 'Hutang Piutang', path: '/debts' },
    { icon: BarChart3, label: 'Laporan Bulanan', path: '/reports' },
    { icon: Tags, label: 'Kategori', path: '/categories' },
    { icon: Settings, label: 'Pengaturan', path: '/settings' },
  ];

  return (
    <>
      <aside className={`h-full flex flex-col py-6 bg-surface transition-all duration-300 ${isSidebarCompact ? 'px-2' : 'px-4'}`}>
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
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                  isSidebarCompact ? "justify-center px-0" : "px-3",
                  isActive
                    ? "bg-[var(--color-stabilo)]/10 text-[var(--color-stabilo)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-foreground)] hover:bg-black/5 dark:hover:bg-white/5"
                )}
                title={isSidebarCompact ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCompact && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="mt-auto pt-4 space-y-2">

          <div className="px-2">
            <button
              onClick={toggleTheme}
              className={cn(
                "w-full flex items-center p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm font-medium text-[var(--color-text-foreground)]",
                isSidebarCompact ? "justify-center" : "justify-between"
              )}
              title={isSidebarCompact ? "Toggle Theme" : undefined}
            >
              <span className={cn("flex items-center", isSidebarCompact ? "" : "gap-3")}>
                {theme === 'dark' ? <Moon className="w-4 h-4 text-slate-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                {!isSidebarCompact && (theme === 'dark' ? 'Dark Mode' : 'Light Mode')}
              </span>
              {!isSidebarCompact && (
                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-[var(--color-stabilo)]' : 'bg-slate-300'}`}>
                  <div className={`w-3 h-3 rounded-full bg-black transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
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
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsLogoutDialogOpen(false)} />
          <div className="relative bg-surface border border-white/10 rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center animate-[zoomIn_0.2s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-negative/10 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-negative" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-foreground)] mb-2">Keluar dari Finoza Apps?</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-8">Sesi Anda akan berakhir dan Anda harus login kembali untuk mengakses dashboard.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutDialogOpen(false)}
                className="flex-1 py-3 px-4 rounded-2xl border border-white/10 text-[var(--color-text-foreground)] font-medium hover:bg-white/5 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 py-3 px-4 rounded-2xl bg-negative text-white font-medium hover:bg-red-600 transition-colors shadow-lg shadow-negative/30"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
          <style>{`
            @keyframes zoomIn {
              from { opacity: 0; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
