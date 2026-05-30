import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Moon, Database, Loader2, Check, LogOut, AlertTriangle } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';
import { useTheme } from '../store/useTheme';
import ProfileModal from '../components/profile/ProfileModal';

export default function Settings() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  
  const token = useAuth(state => state.token);
  const user = useAuth(state => state.user);
  const logout = useAuth(state => state.logout);
  const navigate = useNavigate();

  const handleLogoutConfirm = () => {
    setIsLogoutDialogOpen(false);
    logout();
    navigate('/login');
  };

  const handleGenerateData = async () => {
    setIsGenerating(true);
    setSuccess(false);
    
    const res = await fetchApi('GENERATE_DUMMY_DATA', {}, token!);
    
    setIsGenerating(false);
    if (res.status === 'success') {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert("Gagal generate data: " + res.message);
    }
  };

  return (
    <div className="p-4 lg:p-8 w-full max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold">Pengaturan</h2>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="glass p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center overflow-hidden border-2 border-white/5">
              {user?.profile_picture_url ? (
                <img 
                  src={user.profile_picture_url} 
                  alt="Profile" 
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`; }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} alt="Avatar" className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg">{user?.full_name || 'Pengguna'}</h3>
              <p className="text-slate-400">{user?.email || 'email@example.com'}</p>
            </div>
          </div>
          <button onClick={() => setIsProfileModalOpen(true)} className="px-4 py-2 bg-surface hover:bg-white/5 border border-white/10 rounded-xl transition-colors font-medium">
            Edit Profil
          </button>
        </div>

        {/* Settings Options */}
        <div className="glass rounded-2xl overflow-hidden divide-y divide-black/5 dark:divide-white/5">
          <div className="p-6 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-[var(--color-stabilo)]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-[var(--color-text-foreground)]">Notifikasi</h4>
                <p className="text-sm text-[var(--color-text-muted)]">Atur preferensi notifikasi harian Anda</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-positive">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-[var(--color-text-foreground)]">Keamanan & Privasi</h4>
                <p className="text-sm text-[var(--color-text-muted)]">Ubah kata sandi dan aktifkan biometrik</p>
              </div>
            </div>
          </div>

          <div 
            onClick={useTheme.getState().toggleTheme}
            className="p-6 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-indigo-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-[var(--color-text-foreground)]">Tampilan Tema</h4>
                <p className="text-sm text-[var(--color-text-muted)]">Klik untuk mengubah mode (Terang / Gelap)</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${useTheme().theme === 'dark' ? 'bg-[var(--color-stabilo)]' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-black transition-transform ${useTheme().theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </div>
        </div>

        {/* Developer Actions */}
        <div className="glass p-6 rounded-2xl border border-negative/20">
          <h3 className="font-bold text-negative mb-2 flex items-center gap-2">
            <Database className="w-5 h-5" /> Developer Area
          </h3>
          <p className="text-sm text-slate-400 mb-6">Fungsi di bawah ini akan memanipulasi Google Spreadsheet Anda. Gunakan dengan hati-hati.</p>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleGenerateData}
              disabled={isGenerating}
              className="px-6 py-3 bg-surface hover:bg-white/10 border border-white/10 rounded-xl transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : 
               success ? <Check className="w-5 h-5 text-positive" /> : <Database className="w-5 h-5" />}
              {isGenerating ? 'Menghasilkan...' : success ? 'Data Berhasil Dibuat!' : 'Generate Dummy Data'}
            </button>
            <p className="text-xs text-slate-500 max-w-xs">Tombol ini akan menghapus semua data yang ada di Sheet dan mengisinya dengan data acak.</p>
          </div>
        </div>
        {/* Logout Section */}
        <div className="glass rounded-2xl overflow-hidden mt-6 border border-negative/10">
          <div 
            onClick={() => setIsLogoutDialogOpen(true)}
            className="p-6 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer text-negative"
          >
            <div className="w-10 h-10 rounded-xl bg-negative/10 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold">Keluar Akun</h4>
              <p className="text-sm opacity-70">Sesi Anda akan berakhir</p>
            </div>
          </div>
        </div>

      </div>

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

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
    </div>
  );
}
