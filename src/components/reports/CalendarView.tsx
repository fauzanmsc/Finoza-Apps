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
    <div className="glass rounded-2xl p-4 md:p-6 mb-6 w-full shadow-xl relative z-10">
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
            return <div key={idx} className="h-16 md:h-20 rounded-xl bg-black/10 dark:bg-white/5 opacity-50" />;
          }

          const data = dailyData[day];
          let bgColor = "bg-black/10 dark:bg-white/5 border border-transparent";
          let textColor = "text-[var(--color-text-foreground)]";
          let label = "";
          let computedNet = 0;

          if (data && (data.income > 0 || data.expense > 0)) {
            computedNet = data.income - data.expense;
            if (computedNet > 0) {
              bgColor = "bg-positive/10 border border-positive/30 hover:bg-positive/20";
              textColor = "text-positive font-bold drop-shadow-[0_0_8px_rgba(30,228,148,0.4)]";
              label = "+" + formatRp(computedNet).replace('Rp', '').trim();
            } else if (computedNet < 0) {
              bgColor = "bg-negative/10 border border-negative/30 hover:bg-negative/20";
              textColor = "text-negative font-bold drop-shadow-[0_0_8px_rgba(255,77,77,0.4)]";
              label = formatRp(computedNet).replace('Rp', '').trim();
            } else {
              bgColor = "bg-surface-light border border-white/10 hover:bg-white/10";
              label = "Rp 0";
            }
          }

          // Modern Tooltip
          const tooltipContent = data && (data.income > 0 || data.expense > 0) ? (
            <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 mb-1 w-[180px] md:w-[200px] bg-[#1a1f2e]/95 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] scale-95 group-hover:scale-100 origin-bottom">
              <p className="text-[11px] md:text-xs text-white mb-2 font-extrabold flex items-center gap-1.5 border-b border-white/10 pb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-stabilo)] animate-pulse" />
                {day} {monthNames[month - 1]} {year}
              </p>
              <div className="space-y-1.5">
                {data.income > 0 && (
                  <div className="flex justify-between items-center text-[10px] md:text-[11px]">
                    <span className="text-slate-400 font-medium">Pemasukan</span>
                    <span className="text-positive font-bold">+{formatRp(data.income)}</span>
                  </div>
                )}
                {data.expense > 0 && (
                  <div className="flex justify-between items-center text-[10px] md:text-[11px]">
                    <span className="text-slate-400 font-medium">Pengeluaran</span>
                    <span className="text-negative font-bold">-{formatRp(data.expense)}</span>
                  </div>
                )}
              </div>
              <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center">
                <span className="text-[10px] md:text-[11px] font-bold text-white">Net</span>
                <span className={`text-[11px] md:text-xs font-black ${computedNet > 0 ? 'text-positive' : computedNet < 0 ? 'text-negative' : 'text-white'}`}>
                  {computedNet > 0 ? '+' : ''}{formatRp(computedNet)}
                </span>
              </div>
              
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#1a1f2e]/95" />
            </div>
          ) : null;

          return (
            <div key={idx} className={`relative group h-16 md:h-20 rounded-2xl flex flex-col items-center justify-center p-1 md:p-2 transition-all duration-300 hover:scale-[1.03] hover:z-50 cursor-pointer ${bgColor}`}>
              <span className={`text-sm md:text-base ${textColor}`}>{day}</span>
              {label && (
                <span className={`text-[9px] md:text-[10px] font-bold mt-1 truncate w-full text-center px-1 hidden md:block opacity-90 ${textColor}`}>
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
