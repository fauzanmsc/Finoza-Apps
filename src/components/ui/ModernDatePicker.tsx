import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModernDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  className?: string;
  placeholder?: string;
  align?: 'left' | 'right';
}

export default function ModernDatePicker({ value, onChange, className, placeholder = "Pilih Tanggal", align = 'left' }: ModernDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    return value ? new Date(value) : new Date();
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  
  const handleDateClick = (day: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    onChange(`${currentYear}-${monthStr}-${dayStr}`);
    setIsOpen(false);
  };

  const selectedDateObj = value ? new Date(value) : null;
  const isSelected = (day: number) => {
    if (!selectedDateObj) return false;
    return selectedDateObj.getDate() === day && selectedDateObj.getMonth() === currentMonth && selectedDateObj.getFullYear() === currentYear;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  };

  const displayFormat = value ? (() => { try { const parts = value.split('T')[0].split('-'); return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : placeholder; } catch { return placeholder; } })() : placeholder;

  return (
    <div className={cn("relative w-full h-full", className)} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full flex items-center bg-transparent focus:outline-none text-left pl-7 sm:pl-9 pr-2"
      >
        <CalendarIcon className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-text-muted)] pointer-events-none" />
        <span className="text-[11px] sm:text-sm text-[var(--color-text-foreground)] font-medium">
          {displayFormat}
        </span>
      </button>

      {isOpen && (
        <div className={cn(
          "absolute top-full mt-1 w-[200px] bg-white dark:bg-[#1a1f2e] border border-black/5 dark:border-white/10 p-2 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-[100] animate-[popIn_0.2s_ease-out]",
          align === 'right' ? "right-0" : "left-0"
        )}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={handlePrevMonth} className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <span className="text-xs font-bold text-[var(--color-text-foreground)]">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button onClick={handleNextMonth} className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-[10px] font-semibold text-slate-400 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const today = isToday(day);
              
              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "h-7 flex items-center justify-center text-[10px] sm:text-[11px] rounded-lg font-medium transition-all duration-200",
                    selected
                      ? "bg-[var(--color-stabilo)] text-black shadow-lg shadow-[var(--color-stabilo)]/20 scale-105"
                      : today
                      ? "bg-black/5 dark:bg-white/10 text-[var(--color-text-foreground)] hover:bg-black/10 dark:hover:bg-white/20"
                      : "text-[var(--color-text-foreground)] hover:bg-black/5 dark:hover:bg-white/5 hover:scale-110"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
          
          {/* Arrow */}
          <div className={cn(
            "absolute -top-2 border-[6px] border-transparent border-b-white dark:border-b-[#1a1f2e]",
            align === 'right' ? "right-8" : "left-8"
          )} />
        </div>
      )}
    </div>
  );
}
