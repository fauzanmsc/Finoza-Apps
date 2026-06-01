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
      <div className="relative bg-white dark:bg-[#121620] border border-black/5 dark:border-white/10 rounded-3xl p-6 lg:p-8 flex flex-col justify-center shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-[400px] w-full animate-[popIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">
        
        <p className="text-[var(--color-text-foreground)] text-base lg:text-lg font-medium mb-8 text-center leading-relaxed">
          {message}
        </p>
        
        <div className="flex items-center justify-end gap-3 lg:gap-4 mt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 lg:px-8 py-2.5 lg:py-3 rounded-full bg-[#1e3b23] hover:bg-[#2a5231] text-white/90 text-sm lg:text-base font-semibold transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 lg:px-8 py-2.5 lg:py-3 rounded-full bg-[#A0D98F] hover:bg-[#b0f09e] text-[#0A1D0B] text-sm lg:text-base font-bold transition-colors shadow-[0_0_20px_rgba(160,217,143,0.3)] hover:shadow-[0_0_25px_rgba(160,217,143,0.5)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <div className="w-4 h-4 border-2 border-[#0A1D0B]/30 border-t-[#0A1D0B] rounded-full animate-spin" /> : null}
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
