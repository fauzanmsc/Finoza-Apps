import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { AlignLeft, X, Sun, Moon } from 'lucide-react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useTheme } from '../../store/useTheme';

export default function AppLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { theme, toggleTheme, isSidebarCompact } = useTheme();
  const location = useLocation();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-[var(--color-text-foreground)] transition-all duration-300">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className={`hidden lg:block flex-shrink-0 border-r border-black/5 dark:border-white/5 bg-surface z-10 transition-all duration-300 ${isSidebarCompact ? 'w-20' : 'w-64'}`}>
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
        <div className={`absolute left-0 top-0 h-full w-72 bg-surface shadow-2xl transition-transform duration-300 ease-in-out z-10 ${isMobileSidebarOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'}`}>
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
            {theme === 'dark' ? <Moon className="w-5 h-5 text-[var(--color-stabilo)]" fill="currentColor" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full max-w-[1400px] mx-auto pb-20 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav - Hidden on desktop */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full z-50">
        <div className="absolute bottom-full left-0 w-full h-12 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
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
      `}</style>
    </div>
  );
}

