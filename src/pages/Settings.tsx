import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Moon, Database, Loader2, Check, LogOut, AlertTriangle, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';
import { useTheme } from '../store/useTheme';
import ProfileModal from '../components/profile/ProfileModal';
import { usePWA } from '../hooks/usePWA';

export default function Settings() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isDevAreaOpen, setIsDevAreaOpen] = useState(false);

  const token = useAuth(state => state.token);
  const user = useAuth(state => state.user);
  const logout = useAuth(state => state.logout);
  const navigate = useNavigate();
  const { isInstallable, installPWA } = usePWA();

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
    <div className="p-4 lg:p-8 w-full max-w-4xl mx-auto space-y-5 lg:space-y-8 antialiased tracking-tight">
      <h2 className="text-xl lg:text-2xl font-bold">Pengaturan</h2>

      <div className="space-y-4 lg:space-y-6">
        {/* Profile Section */}
        <div className="glass p-4 lg:p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-surface-light flex items-center justify-center overflow-hidden border-2 border-white/5">
              {user?.profile_picture_url && !imgError && user.profile_picture_url !== 'null' ? (
                <img
                  src={user.profile_picture_url}
                  alt="Profile"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-black/10 dark:bg-white/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-base lg:text-lg">{user?.full_name || 'Pengguna'}</h3>
              <p className="text-slate-400 text-xs lg:text-sm">{user?.email || 'email@example.com'}</p>
            </div>
          </div>
          <button onClick={() => setIsProfileModalOpen(true)} className="px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm bg-surface hover:bg-white/5 border border-white/10 rounded-xl transition-colors font-medium">
            Edit Profil
          </button>
        </div>

        {/* Settings Options */}
        <div className="glass rounded-2xl overflow-hidden divide-y divide-black/5 dark:divide-white/5">
          <div className="p-4 lg:p-6 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-surface-light flex items-center justify-center text-[var(--color-stabilo)]">
                <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <div>
                <h4 className="font-medium text-sm lg:text-base text-[var(--color-text-foreground)]">Notifikasi</h4>
                <p className="text-xs lg:text-sm text-[var(--color-text-muted)]">Atur preferensi notifikasi harian Anda</p>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-6 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-surface-light flex items-center justify-center text-positive">
                <Shield className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <div>
                <h4 className="font-medium text-sm lg:text-base text-[var(--color-text-foreground)]">Keamanan & Privasi</h4>
                <p className="text-xs lg:text-sm text-[var(--color-text-muted)]">Ubah kata sandi dan aktifkan biometrik</p>
              </div>
            </div>
          </div>

          <div
            onClick={useTheme.getState().toggleTheme}
            className="p-4 lg:p-6 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-surface-light flex items-center justify-center text-indigo-400">
                <Moon className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <div>
                <h4 className="font-medium text-sm lg:text-base text-[var(--color-text-foreground)]">Tampilan Tema</h4>
                <p className="text-xs lg:text-sm text-[var(--color-text-muted)]">Klik untuk mengubah mode (Terang / Gelap)</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${useTheme().theme === 'dark' ? 'bg-[var(--color-stabilo)]' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-black transition-transform ${useTheme().theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </div>
        </div>

        {/* PWA Install Area */}
        {isInstallable && (
          <div className="glass p-4 lg:p-6 rounded-2xl flex items-center justify-between border border-[var(--color-stabilo)]/20">
            <div>
              <h3 className="font-bold text-sm lg:text-base text-[var(--color-text-foreground)] mb-1 flex items-center gap-2">
                <Download className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--color-stabilo)]" /> Install Aplikasi
              </h3>
              <p className="text-xs lg:text-sm text-[var(--color-text-muted)]">
                Install Finoza App ke perangkat Anda untuk pengalaman yang lebih baik.
              </p>
            </div>
            <button
              onClick={installPWA}
              className="px-4 py-2 lg:px-6 lg:py-3 text-xs lg:text-sm bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-slate-900 rounded-xl transition-colors font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.3)]"
            >
              <Download className="w-4 h-4" />
              Install PWA
            </button>
          </div>
        )}

        {/* Developer Actions */}
        <div className="glass rounded-2xl border border-negative/20 overflow-hidden">
          <button 
            onClick={() => setIsDevAreaOpen(!isDevAreaOpen)}
            className="w-full p-4 lg:p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 lg:w-5 lg:h-5 text-negative" />
              <h3 className="font-bold text-sm lg:text-base text-negative">Developer Area</h3>
            </div>
            {isDevAreaOpen ? <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5 text-negative" /> : <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 text-negative" />}
          </button>

          {isDevAreaOpen && (
            <div className="p-4 lg:p-6 pt-0 animate-in slide-in-from-top-2 opacity-100">
              <p className="text-xs lg:text-sm text-slate-400 mb-4 lg:mb-6">Fungsi di bawah ini akan memanipulasi Google Spreadsheet Anda. Gunakan dengan hati-hati.</p>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleGenerateData}
                  disabled={isGenerating}
                  className="px-4 py-2 lg:px-6 lg:py-3 text-xs lg:text-sm bg-surface hover:bg-white/10 border border-white/10 rounded-xl transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> :
                    success ? <Check className="w-5 h-5 text-positive" /> : <Database className="w-5 h-5" />}
                  {isGenerating ? 'Menghasilkan...' : success ? 'Data Berhasil Dibuat!' : 'Generate Dummy Data'}
                </button>
                <p className="text-xs text-slate-500 max-w-xs">Tombol ini akan menghapus semua data yang ada di Sheet dan mengisinya dengan data acak.</p>
              </div>
            </div>
          )}
        </div>
        {/* Logout Section */}
        <div className="glass rounded-2xl overflow-hidden mt-6 border border-negative/10">
          <div
            onClick={() => setIsLogoutDialogOpen(true)}
            className="p-4 lg:p-6 flex items-center gap-3 lg:gap-4 hover:bg-white/5 transition-colors cursor-pointer text-negative"
          >
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-negative/10 flex items-center justify-center">
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm lg:text-base">Keluar Akun</h4>
              <p className="text-xs lg:text-sm opacity-70">Sesi Anda akan berakhir</p>
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
            <h3 className="text-xl font-bold text-[var(--color-text-foreground)] mb-2">Keluar dari Aplikasi?</h3>
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
