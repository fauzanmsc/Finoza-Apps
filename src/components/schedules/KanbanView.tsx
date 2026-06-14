import { CheckCircle2, Clock, MoreVertical, Plus } from 'lucide-react';
import clsx from 'clsx';

const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

interface Schedule {
  id: string;
  title: string;
  amount: number;
  due_date: string;
  status: 'Pending' | 'Completed';
  note?: string;
}

interface KanbanViewProps {
  schedules: Schedule[];
  onAddClick: () => void;
  onScheduleClick: (schedule: Schedule) => void;
  onToggleStatus: (schedule: Schedule) => void;
}

export default function KanbanView({ schedules, onAddClick, onScheduleClick, onToggleStatus }: KanbanViewProps) {
  const pendingSchedules = schedules.filter(s => s.status === 'Pending').sort((a,b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  const completedSchedules = schedules.filter(s => s.status === 'Completed').sort((a,b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());

  const renderCard = (sch: Schedule) => (
    <div 
      key={sch.id}
      onClick={() => onScheduleClick(sch)}
      className="bg-white/80 dark:bg-[#121620]/80 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl p-5 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-black/10 dark:hover:border-white/20 transition-all duration-300 shadow-sm"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm text-[var(--color-text-foreground)] line-clamp-2">{sch.title}</h3>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleStatus(sch); }}
          className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          {sch.status === 'Pending' ? (
            <CheckCircle2 className="w-5 h-5 text-slate-300 hover:text-green-500 transition-colors" />
          ) : (
            <Clock className="w-5 h-5 text-green-500 hover:text-amber-500 transition-colors" />
          )}
        </button>
      </div>
      <p className="text-lg font-extrabold text-[var(--color-stabilo)] mb-3">{formatRp(sch.amount)}</p>
      
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-black/5 dark:border-white/5">
        <span className={clsx(
          "text-[10px] font-bold px-2 py-1 rounded-md",
          new Date(sch.due_date) < new Date() && sch.status === 'Pending' 
            ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" 
            : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400"
        )}>
          Due: {sch.due_date}
        </span>
        {sch.note && (
          <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{sch.note}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full animate-[fadeIn_0.5s_ease-out]">
      {/* Pending Column */}
      <div className="flex-1 flex flex-col bg-black/5 dark:bg-white/5 rounded-3xl p-5 sm:p-6 min-h-[500px] border border-black/5 dark:border-white/5 shadow-inner">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_var(--color-amber-500)]" />
            <h2 className="text-lg font-bold">To-Do / Pending</h2>
            <span className="bg-white dark:bg-[#121620] text-xs font-bold px-2 py-0.5 rounded-full">{pendingSchedules.length}</span>
          </div>
          <button 
            onClick={onAddClick}
            className="p-1.5 rounded-xl bg-white dark:bg-[#121620] text-[var(--color-text-foreground)] hover:text-[var(--color-stabilo)] transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-10">
          {pendingSchedules.map(renderCard)}
          {pendingSchedules.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl">
              Belum ada jadwal pending
            </div>
          )}
        </div>
      </div>

      {/* Completed Column */}
      <div className="flex-1 flex flex-col bg-black/5 dark:bg-white/5 rounded-3xl p-5 sm:p-6 min-h-[500px] border border-black/5 dark:border-white/5 shadow-inner">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_var(--color-green-500)]" />
            <h2 className="text-lg font-bold">Completed</h2>
            <span className="bg-white dark:bg-[#121620] text-xs font-bold px-2 py-0.5 rounded-full">{completedSchedules.length}</span>
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-10">
          {completedSchedules.map(renderCard)}
        </div>
      </div>
    </div>
  );
}
