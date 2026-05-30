import { create } from 'zustand';

interface User {
  full_name: string;
  email: string;
  currency: string;
  profile_picture_url?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem('Moniq-Auth-Token'),
  user: JSON.parse(localStorage.getItem('Moniq-User') || 'null'),
  
  setAuth: (token, user) => {
    localStorage.setItem('Moniq-Auth-Token', token);
    localStorage.setItem('Moniq-User', JSON.stringify(user));
    set({ token, user });
  },
  
  logout: () => {
    localStorage.removeItem('Moniq-Auth-Token');
    localStorage.removeItem('Moniq-User');
    set({ token: null, user: null });
  },
}));
