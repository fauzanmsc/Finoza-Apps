import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Oke',
  cancelText = 'Batal',
  variant = 'warning',
  isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]" 
        onClick={isLoading ? undefined : onClose} 
      />
      
      {/* Modal Box */}
      <div className="relative bg-[#1a1f2e] dark:bg-[#121620] border border-black/5 dark:border-white/10 rounded-[2rem] p-8 lg:p-10 flex flex-col justify-center items-center text-center shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-[420px] w-full animate-[popIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">
        
        {/* Icon */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${
          variant === 'danger' ? 'bg-negative/10 text-negative border border-negative/20' : 
          variant === 'success' ? 'bg-positive/10 text-positive border border-positive/20' : 
          'bg-[var(--color-stabilo)]/10 text-[var(--color-stabilo)] border border-[var(--color-stabilo)]/20'
        }`}>
          {variant === 'success' ? <CheckCircle2 className="w-10 h-10 drop-shadow-md" /> : <AlertTriangle className="w-10 h-10 drop-shadow-md" />}
        </div>

        {title && <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2">{title}</h3>}
        
        <p className="text-slate-300 dark:text-slate-400 text-base md:text-[1.1rem] font-medium mb-8 leading-relaxed">
          {message}
        </p>
        
        <div className="flex items-center justify-center gap-3 w-full">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 md:py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 md:py-3.5 rounded-2xl font-bold transition-all shadow-lg text-black flex items-center justify-center gap-2 disabled:opacity-50 ${
              variant === 'danger' ? 'bg-negative hover:bg-[#ff6666] shadow-[0_0_15px_rgba(255,77,77,0.3)]' : 
              'bg-[var(--color-stabilo)] hover:bg-[#b3e600] shadow-[0_0_15px_rgba(204,255,0,0.3)]'
            }`}
          >
            {isLoading && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
