import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlignLeft, X, Sun, Moon, AlertTriangle } from 'lucide-react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useTheme } from '../../store/useTheme';
import { useAuth } from '../../store/useAuth';
import CommandPalette from '../ui/CommandPalette';
import TransactionModal from '../transactions/TransactionModal';

export default function AppLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { theme, toggleTheme, isSidebarCompact, toggleSidebarCompact } = useTheme();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Global Modals State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Command (Mac) or Control (Windows) is pressed
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'l':
            e.preventDefault();
            toggleTheme();
            break;
          case 'x':
            e.preventDefault();
            setIsLogoutOpen(true);
            break;
          case 'e':
            e.preventDefault();
            toggleSidebarCompact();
            break;
          case 'k':
            e.preventDefault();
            setIsSearchOpen(true);
            break;
          case 'n':
            e.preventDefault();
            setIsTransactionOpen(true);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme, toggleSidebarCompact]);

  const handleLogoutConfirm = () => {
    setIsLogoutOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full bg-transparent overflow-hidden text-[var(--color-text-foreground)] transition-all duration-300">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className={`hidden lg:block flex-shrink-0 bg-[var(--color-glass-bg)] z-10 transition-all duration-300 rounded-r-[2rem] border-r border-black/5 dark:border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)] ${isSidebarCompact ? 'w-20' : 'w-[280px]'}`}>
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 z-[100] pointer-events-none transition-all duration-300 ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
      >
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} 
          onClick={() => setIsMobileSidebarOpen(false)} 
        />
        <div 
          className={`absolute left-0 top-0 h-full w-72 shadow-2xl rounded-r-[2rem] border-r border-black/5 dark:border-white/5 transition-transform duration-300 ease-in-out z-10 ${isMobileSidebarOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'}`}
          style={{ background: 'var(--color-glass-bg)' }}
        >
          {/* Close button */}
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-text-muted)]" />
          </button>
          <Sidebar onNavigate={() => setIsMobileSidebarOpen(false)} />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile top bar with hamburger */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-black/5 dark:border-white/5 flex-shrink-0">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <AlignLeft className="w-6 h-6 text-[var(--color-text-foreground)]" strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2">
            <img 
              src={theme === 'dark' ? "/logo-finoza-light.png" : "/logo-finoza-dark.png"} 
              alt="Finoza Apps" 
              className="h-7 object-contain" 
            />
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full max-w-[1400px] mx-auto px-[10px] lg:px-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="min-h-full pb-22 lg:pb-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav - Hidden on desktop */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full z-50">
        <div className="absolute left-0 w-full bg-gradient-to-t from-background to-transparent pointer-events-none" style={{ bottom: '40px', height: '100px' }}></div>
        <BottomNav />
      </div>

      {/* Inline keyframe styles for mobile sidebar */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Global Command Palette */}
      <CommandPalette 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onLogout={() => setIsLogoutOpen(true)}
        onAddTransaction={() => setIsTransactionOpen(true)}
      />

      {/* Global Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionOpen}
        onClose={() => setIsTransactionOpen(false)}
        onRefresh={() => window.location.reload()}
      />

      {/* Global Logout Confirmation Dialog */}
      {isLogoutOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]" onClick={() => setIsLogoutOpen(false)} />
          <div className="relative bg-white dark:bg-[#121620] border border-black/5 dark:border-white/10 rounded-3xl p-8 shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-sm w-full text-center animate-[popIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Keluar dari Aplikasi?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">Sesi akan berakhir dan kamu harus login kembali untuk mengakses dashboard.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutOpen(false)}
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
        </div>,
        document.body
      )}
    </div>
  );
}

