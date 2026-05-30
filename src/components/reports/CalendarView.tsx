import { ChevronLeft, ChevronRight } from 'lucide-react';

const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

interface CalendarViewProps {
  month: number;
  year: number;
  dailyData: Record<number, { income: number; expense: number; net: number; transactions: any[] }>;
  onNextMonth: () => void;
  onPrevMonth: () => void;
}

export default function CalendarView({ month, year, dailyData, onNextMonth, onPrevMonth }: CalendarViewProps) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  // Fill calendar grid
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className="glass rounded-2xl p-4 md:p-6 mb-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onPrevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h3 className="text-lg md:text-xl font-bold">{monthNames[month - 1]} {year}</h3>
        <button onClick={onNextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {weekDays.map((day, idx) => (
          <div key={idx} className="text-center text-[10px] md:text-xs font-medium text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={idx} className="aspect-square rounded-xl bg-black/10 dark:bg-white/5 opacity-50" />;
          }

          const data = dailyData[day];
          let bgColor = "bg-black/10 dark:bg-white/5";
          let textColor = "text-[var(--color-text-foreground)]";
          let label = "";

          if (data && (data.income > 0 || data.expense > 0)) {
            if (data.net > 0) {
              bgColor = "bg-positive/20 border border-positive/30";
              textColor = "text-positive";
              label = "+" + formatRp(data.net).replace('Rp', '').trim();
            } else if (data.net < 0) {
              bgColor = "bg-negative/20 border border-negative/30";
              textColor = "text-negative";
              label = formatRp(data.net).replace('Rp', '').trim();
            } else {
              bgColor = "bg-surface-light border border-white/10";
              label = "Rp 0";
            }
          }

          // Tooltip content if there's data
          const tooltipContent = data ? (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-surface-dark border border-white/10 p-3 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <p className="text-xs text-white mb-1 font-bold">{day} {monthNames[month - 1]} {year}</p>
              {data.income > 0 && <p className="text-[10px] text-positive">Pemasukan: {formatRp(data.income)}</p>}
              {data.expense > 0 && <p className="text-[10px] text-negative">Pengeluaran: {formatRp(data.expense)}</p>}
              <p className="text-[10px] font-bold mt-1 border-t border-white/10 pt-1">Net: {formatRp(data.net)}</p>
            </div>
          ) : null;

          return (
            <div key={idx} className={`relative group aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all hover:scale-105 cursor-pointer ${bgColor}`}>
              <span className={`text-xs md:text-sm font-medium ${textColor}`}>{day}</span>
              {label && (
                <span className="text-[8px] md:text-[9px] font-bold mt-1 truncate w-full text-center px-1 hidden md:block">
                  {label}
                </span>
              )}
              {tooltipContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
