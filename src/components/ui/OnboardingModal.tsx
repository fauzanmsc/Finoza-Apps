import { useState } from 'react';
import { WalletCards, Tags, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingProps {
  onClose: () => void;
}

export default function OnboardingModal({ onClose }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onClose();
  };

  const handleAction = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-md bg-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        {/* Progress Bar */}
        <div className="h-1.5 flex w-full bg-surface-light">
          <div className="h-full bg-[var(--color-stabilo)] transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          {step === 1 && (
            <div className="animate-in slide-in-from-right-8 duration-500 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-[var(--color-stabilo)]/10 flex items-center justify-center mb-6">
                <WalletCards className="w-10 h-10 text-[var(--color-stabilo)]" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Buat Rekening Pertama</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Finoza butuh wadah untuk melacak uang Anda. Mari buat rekening bank atau dompet digital pertama Anda.
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button onClick={() => handleAction('/accounts')} className="w-full bg-[var(--color-stabilo)] text-black font-bold py-3.5 rounded-xl hover:bg-[#b3e600] transition-colors shadow-lg shadow-[var(--color-stabilo)]/20">
                  Buat Rekening
                </button>
                <button onClick={handleNext} className="text-slate-400 text-sm hover:text-white transition-colors py-2">
                  Lewati dulu
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in slide-in-from-right-8 duration-500 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Tags className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Atur Kategori</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Kategori membantu Anda mengetahui kemana uang Anda pergi. Anda bisa menambahkan kategori khusus.
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button onClick={() => handleAction('/categories')} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20">
                  Atur Kategori
                </button>
                <button onClick={handleNext} className="text-slate-400 text-sm hover:text-white transition-colors py-2">
                  Lewati dulu
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in slide-in-from-right-8 duration-500 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-positive/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-positive" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Anda Siap!</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Semua persiapan dasar selesai. Mulai catat transaksi Anda setiap hari agar keuangan lebih sehat.
              </p>
              <button onClick={handleNext} className="w-full bg-positive text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-positive/20">
                Mulai Gunakan Finoza
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
