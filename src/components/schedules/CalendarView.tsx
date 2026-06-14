import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import clsx from 'clsx';

interface Schedule {
  id: string;
  title: string;
  amount: number;
  due_date: string;
  status: 'Pending' | 'Completed';
  note?: string;
}

interface CalendarViewProps {
  schedules: Schedule[];
  onAddClick: (date: string) => void;
  onScheduleClick: (schedule: Schedule) => void;
}

export default function CalendarView({ schedules, onAddClick, onScheduleClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Group schedules by date string YYYY-MM-DD
  const schedulesByDate = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    schedules.forEach(s => {
      if (s.due_date) {
        const dateKey = s.due_date.substring(0, 10);
        if (!map.has(dateKey)) map.set(dateKey, []);
        map.get(dateKey)!.push(s);
      }
    });
    return map;
  }, [schedules]);

  const renderCells = () => {
    const cells = [];
    
    // Empty cells for padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="min-h-[100px] sm:min-h-[120px] bg-black/5 dark:bg-white/5 opacity-20 rounded-2xl" />);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isToday = dateStr === new Date().toISOString().substring(0, 10);
      const daySchedules = schedulesByDate.get(dateStr) || [];

      cells.push(
        <div 
          key={i} 
          onClick={() => onAddClick(dateStr)}
          className={clsx(
            "min-h-[100px] sm:min-h-[120px] bg-white/40 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl p-2 sm:p-3 relative group hover:-translate-y-1 hover:shadow-xl hover:border-[var(--color-stabilo)]/50 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden",
            isToday && "ring-2 ring-[var(--color-stabilo)] shadow-[0_0_20px_rgba(204,255,0,0.15)] bg-gradient-to-br from-[var(--color-stabilo)]/10 to-transparent"
          )}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={clsx(
              "text-xs sm:text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full z-10",
              isToday ? "bg-[var(--color-stabilo)] text-black shadow-md" : "text-slate-500"
            )}>
              {i}
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--color-stabilo)] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-1">
            {daySchedules.map(sch => (
              <div 
                key={sch.id} 
                onClick={(e) => { e.stopPropagation(); onScheduleClick(sch); }}
                className={clsx(
                  "text-[10px] sm:text-xs px-2 py-1.5 rounded-lg font-bold truncate transition-transform hover:scale-[1.02] border",
                  sch.status === 'Completed' 
                    ? "bg-green-50 text-green-700 border-green-200/50 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400" 
                    : "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400"
                )}
              >
                {sch.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="glass rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col h-full animate-[fadeIn_0.5s_ease-out] shadow-2xl border border-white/20 dark:border-white/5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-foreground)]">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-bold rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            Today
          </button>
          <button onClick={nextMonth} className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-4 flex-1">
        {renderCells()}
      </div>
    </div>
  );
}
