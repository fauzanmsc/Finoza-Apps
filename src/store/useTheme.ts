import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  isSidebarCompact: boolean;
  toggleTheme: () => void;
  toggleSidebarCompact: () => void;
  initTheme: () => void;
}

export const useTheme = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('Moniq-Theme') as 'light' | 'dark') || 'dark',
  isSidebarCompact: localStorage.getItem('Moniq-Sidebar-Compact') === 'true',
  
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('Moniq-Theme', newTheme);
    
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    
    return { theme: newTheme };
  }),

  toggleSidebarCompact: () => set((state: any) => {
    const newCompact = !state.isSidebarCompact;
    localStorage.setItem('Moniq-Sidebar-Compact', String(newCompact));
    return { isSidebarCompact: newCompact };
  }),
  
  initTheme: () => set((_state) => {
    const currentTheme = localStorage.getItem('Moniq-Theme') || 'dark';
    if (currentTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    return { theme: currentTheme as 'light' | 'dark' };
  }),
}));
