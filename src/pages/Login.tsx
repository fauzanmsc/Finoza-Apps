import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { useTheme } from '../store/useTheme';
import { fetchApi } from '../services/api';
import { Lock, Mail, Loader2, ArrowRight, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuth((state) => state.setAuth);
  const { theme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    const res = await fetchApi('LOGIN', { email, password });

    if (res.status === 'success') {
      setAuth(res.data.authToken, res.data.user);
      setSuccessMsg(`Selamat datang, ${res.data.user.full_name || 'User'}! 🎉`);
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      setError(res.message || 'Email atau password salah.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">

      {/* Decorative Glow Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[var(--color-stabilo)] rounded-full blur-[150px] opacity-10 pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--color-stabilo)] rounded-full blur-[150px] opacity-5 pointer-events-none" />

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-[slideDown_0.4s_ease-out]">
          <div className="flex items-center gap-3 bg-positive/90 backdrop-blur-xl text-white px-6 py-4 rounded-2xl shadow-2xl shadow-positive/30 min-w-[320px]">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-[slideDown_0.4s_ease-out]">
          <div className="flex items-center gap-3 bg-negative/90 backdrop-blur-xl text-white px-6 py-4 rounded-2xl shadow-2xl shadow-negative/30 min-w-[320px]">
            <XCircle className="w-6 h-6 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1000px] z-10 flex flex-col md:flex-row items-center gap-12 lg:gap-24">

        {/* Left Side: Branding */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          <img
            src={theme === 'dark' ? "/logo-finoza-light.png" : "/logo-finoza-dark.png"}
            alt="Finoza Apps"
            className="h-16 md:h-20 object-contain mx-auto md:mx-0 mb-4"
          />
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text-foreground)] tracking-tight leading-[1.1]">
            Track <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-stabilo)] to-yellow-300">Smarter,</span> Grow Better
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-md mx-auto md:mx-0">
            Platform manajemen finansial pintar untuk mengontrol aset, hutang, dan anggaran bulanan Anda.
          </p>
        </div>

        {/* Right Side: Glassmorphism Login Card */}
        <div className="w-full max-w-md">
          <div className={`bg-surface/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-transform ${shake ? 'animate-[shakeX_0.5s_ease-in-out]' : ''}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-stabilo)] to-transparent opacity-50" />

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[var(--color-text-foreground)] mb-2">Selamat Datang Kembali</h2>
              <p className="text-slate-400 text-sm">Masuk ke akun Finoza Anda untuk melanjutkan.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-[var(--color-stabilo)] transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="fauzan@moniq.com"
                      className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-stabilo)] focus:bg-black/40 focus:ring-1 focus:ring-[var(--color-stabilo)] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
                    <a href="#" className="text-xs text-[var(--color-stabilo)] hover:underline">Lupa Password?</a>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-[var(--color-stabilo)] transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder="••••••••"
                      className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-stabilo)] focus:bg-black/40 focus:ring-1 focus:ring-[var(--color-stabilo)] transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[var(--color-stabilo)] transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !!successMsg}
                className="w-full bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : successMsg ? (
                  <><CheckCircle2 className="w-5 h-5" /> Berhasil!</>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Inline keyframe styles */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes shakeX {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

