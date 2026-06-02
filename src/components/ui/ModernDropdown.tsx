import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ModernDropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
}

export default function ModernDropdown({ value, options, onChange, className = '', buttonClassName = '' }: ModernDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`relative ${className}`}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-full flex items-center justify-between bg-white/50 dark:bg-black/20 backdrop-blur-md border border-black/10 dark:border-white/10 text-xs lg:text-sm rounded-xl px-3 h-10 hover:border-black/30 dark:hover:border-white/30 transition-all font-medium text-slate-700 dark:text-white ${buttonClassName}`}
      >
        <span className="truncate">{options.find((o) => o.value === value)?.label || 'Pilih...'}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''} flex-shrink-0 ml-2`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[50]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1f2e] border border-black/10 dark:border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-100 py-1">
            {options.map((opt) => (
              <button 
                key={opt.value} 
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }} 
                className={`w-full text-left truncate px-3 py-2 text-xs lg:text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${value === opt.value ? 'text-[var(--color-stabilo)] dark:text-[var(--color-stabilo)] font-bold' : 'text-slate-600 dark:text-slate-300'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
