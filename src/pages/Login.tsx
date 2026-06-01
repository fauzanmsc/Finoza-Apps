import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { useTheme } from '../store/useTheme';
import { fetchApi } from '../services/api';
import { Lock, Mail, Loader2, ArrowRight, CheckCircle2, XCircle, Eye, EyeOff, Sun, Moon } from 'lucide-react';

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
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    const res = await fetchApi('LOGIN', { email, password });

    if (res.status === 'success') {
      setAuth(res.data.authToken, res.data.user);
      setSuccessMsg('Anda Berhasil Login!');
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

      {/* Success Toast - Modern Center Popup */}
      {successMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]" />
          <div className="relative bg-white dark:bg-[#121620] border border-black/5 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-sm w-full animate-[popIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">{successMsg}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center justify-center">
              Mengarahkan ke Dashboard
              <span className="inline-flex tracking-[2px] ml-0.5">
                <span className="animate-[fadeInOut_1.5s_infinite_0s]">.</span>
                <span className="animate-[fadeInOut_1.5s_infinite_0.3s]">.</span>
                <span className="animate-[fadeInOut_1.5s_infinite_0.6s]">.</span>
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Error Toast - Modern Center Popup */}
      {error && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]" />
          <div className="relative bg-white dark:bg-[#121620] border border-black/5 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-sm w-full animate-[popIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Login Gagal</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{error}</p>
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
          <h1 className="text-4xl sm:text-5xl md:text-[60px] font-extrabold tracking-tight leading-[1.1] antialiased">
            <span className="text-[var(--color-text-foreground)] animate-[text-glow_4s_ease-in-out_infinite]">Smart </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-stabilo)] via-[#aacc00] dark:via-[#e5ff66] to-[var(--color-stabilo)] bg-[length:200%_auto] animate-[text-glow-fill_3s_ease-in-out_infinite]">Tracker,</span>
            <br/>
            <span className="whitespace-nowrap text-[var(--color-text-foreground)] animate-[text-glow_4s_ease-in-out_infinite_1s]">Growth Better</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base md:text-lg max-w-md mx-auto md:mx-0 font-medium leading-relaxed antialiased">
            Platform cerdas untuk mengelola keuangan Anda secara komprehensif. Pantau arus kas, kontrol aset dan hutang, serta rencanakan anggaran bulanan dengan akurat.
          </p>
        </div>

        {/* Right Side: Glassmorphism Login Card */}
        <div className="w-full max-w-md relative z-10">
          <div className={`relative w-full transition-transform ${shake ? 'animate-[shakeX_0.5s_ease-in-out]' : ''}`}>
            {/* Outer Glow (Blurred) */}
            <div className="absolute inset-[-2px] z-0 blur-[15px] opacity-70 rounded-3xl overflow-hidden flex items-center justify-center">
              <div className="absolute w-[800px] h-[800px] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(212,255,0,0)_0%,rgba(212,255,0,0)_50%,rgba(212,255,0,1)_100%)]" />
            </div>

            {/* Crisp Border */}
            <div className="absolute inset-[-1.5px] z-0 rounded-[calc(1.5rem+1.5px)] overflow-hidden flex items-center justify-center bg-black/5 dark:bg-white/5">
              <div className="absolute w-[800px] h-[800px] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(212,255,0,0)_0%,rgba(212,255,0,0)_80%,rgba(212,255,0,1)_100%)]" />
            </div>

            <div className="bg-white dark:bg-[#121620] rounded-3xl p-8 relative z-10 w-full h-full shadow-[0_8px_32px_0_var(--color-glass-shadow)]">
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--color-text-foreground)] mb-2">Selamat Datang di Finoza</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Masuk ke akun Finoza Anda untuk melanjutkan.</p>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-[var(--color-text-muted)] hover:text-slate-900 dark:hover:text-[var(--color-text-foreground)] flex-shrink-0"
                  title="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-[var(--color-stabilo)] transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="fauzan@finoza.id"
                      className="w-full bg-slate-50 dark:bg-[#1c2230] border border-slate-200 dark:border-none rounded-xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--color-stabilo)] focus:border-[var(--color-stabilo)] dark:focus:border-transparent transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                    <a href="#" className="text-[11px] font-bold text-[var(--color-stabilo)] hover:opacity-80 transition-opacity">Lupa Password?</a>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-[var(--color-stabilo)] transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder="••••"
                      className="w-full bg-slate-50 dark:bg-[#1c2230] border border-slate-200 dark:border-none rounded-xl py-3.5 pl-12 pr-12 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--color-stabilo)] focus:border-[var(--color-stabilo)] dark:focus:border-transparent transition-all text-sm tracking-widest"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-[var(--color-stabilo)] transition-colors"
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
                className="w-full bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] text-sm"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : successMsg ? (
                  <><CheckCircle2 className="w-5 h-5" /> Berhasil!</>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 w-full text-center z-10">
        <p className="text-slate-500 text-xs font-medium">
          Copyright &copy; {new Date().getFullYear()} - Develop by <a href="https://www.behance.net/ozancreative" target="_blank" rel="noopener noreferrer" className="text-[var(--color-stabilo)] hover:opacity-80 transition-opacity">Ozan Creative</a>
        </p>
      </div>

      {/* Inline keyframe styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.2; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-1px); }
        }
        @keyframes shakeX {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 4px var(--color-glass-border); }
          50% { text-shadow: 0 0 12px var(--color-glass-border); }
        }
        @keyframes text-glow-fill {
          0%, 100% { background-position: 0% 50%; filter: drop-shadow(0 0 8px rgba(212,255,0,0.3)); }
          50% { background-position: 100% 50%; filter: drop-shadow(0 0 16px rgba(212,255,0,0.8)); }
        }
        @keyframes border-glow {
          0%, 100% { border-color: rgba(212, 255, 0, 0.3); box-shadow: 0 0 10px rgba(212, 255, 0, 0.1) inset, 0 0 10px rgba(212, 255, 0, 0.1); }
          50% { border-color: rgba(212, 255, 0, 0.8); box-shadow: 0 0 20px rgba(212, 255, 0, 0.3) inset, 0 0 20px rgba(212, 255, 0, 0.3); }
        }
      `}</style>
    </div>
  );
}

