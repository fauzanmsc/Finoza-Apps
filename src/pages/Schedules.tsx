import { useState, useEffect } from 'react';
import { Calendar, LayoutGrid, Plus } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../store/useAuth';
import { fetchApi } from '../services/api';
import CalendarView from '../components/schedules/CalendarView';
import KanbanView from '../components/schedules/KanbanView';
import ScheduleModal from '../components/schedules/ScheduleModal';

interface Schedule {
  id: string;
  title: string;
  amount: number;
  due_date: string;
  status: 'Pending' | 'Completed';
  note?: string;
}

export default function Schedules() {
  const [viewMode, setViewMode] = useState<'calendar' | 'kanban'>('calendar');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { authToken } = useAuth();

  const loadSchedules = async () => {
    setIsLoading(true);
    const res = await fetchApi('GET_SCHEDULES', {}, authToken);
    if (res.status === 'success') {
      setSchedules(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadSchedules();
  }, [authToken]);

  const handleOpenModalForNew = (date?: string) => {
    setSelectedSchedule(null);
    setSelectedDate(date || null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setSelectedDate(schedule.due_date);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: Partial<Schedule>) => {
    setIsSubmitting(true);
    const action = selectedSchedule ? 'UPDATE_SCHEDULE' : 'CREATE_SCHEDULE';
    const payload = selectedSchedule ? { ...data, id: selectedSchedule.id } : data;

    const res = await fetchApi(action, payload, authToken);
    if (res.status === 'success') {
      await loadSchedules();
      setIsModalOpen(false);
    } else {
      alert(`Gagal menyimpan jadwal: ${res.message || 'Server error'}`);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;
    setIsSubmitting(true);
    const res = await fetchApi('DELETE_SCHEDULE', { id }, authToken);
    if (res.status === 'success') {
      await loadSchedules();
      setIsModalOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleToggleStatus = async (schedule: Schedule) => {
    const newStatus = schedule.status === 'Pending' ? 'Completed' : 'Pending';
    // Optimistic update
    setSchedules(prev => prev.map(s => s.id === schedule.id ? { ...s, status: newStatus } : s));
    
    const res = await fetchApi('UPDATE_SCHEDULE', { id: schedule.id, status: newStatus }, authToken);
    if (res.status !== 'success') {
      // Revert if error
      await loadSchedules();
    }
  };

  return (
    <>
      <div className="w-full max-w-[1400px] mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out] px-2 sm:px-4 lg:px-8">
        
        {/* Page Header & View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-text-foreground)] to-slate-400 tracking-tight">Jadwal & To-Do</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Kelola rencana pembayaran dan tagihan Anda.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-black/5 dark:bg-white/5 p-1 rounded-2xl flex items-center shadow-inner border border-black/5 dark:border-white/5">
              <button 
                onClick={() => setViewMode('calendar')}
                className={clsx(
                  "px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all",
                  viewMode === 'calendar' ? "bg-white dark:bg-[#1c2230] text-[var(--color-text-foreground)] shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <Calendar className="w-4 h-4" /> <span className="hidden sm:inline">Calendar</span>
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={clsx(
                  "px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all",
                  viewMode === 'kanban' ? "bg-white dark:bg-[#1c2230] text-[var(--color-text-foreground)] shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <LayoutGrid className="w-4 h-4" /> <span className="hidden sm:inline">Board</span>
              </button>
            </div>
            
            <button 
              onClick={() => handleOpenModalForNew()}
              className="bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black px-6 py-3 rounded-2xl font-extrabold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:shadow-[0_0_25px_rgba(204,255,0,0.3)] hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Jadwal Baru</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-[var(--color-stabilo)] rounded-full animate-spin shadow-lg"></div>
          </div>
        ) : (
          <div className="min-h-[600px] pb-12">
            {viewMode === 'calendar' ? (
              <CalendarView 
                schedules={schedules} 
                onAddClick={handleOpenModalForNew} 
                onScheduleClick={handleOpenModalForEdit} 
              />
            ) : (
              <KanbanView 
                schedules={schedules} 
                onAddClick={() => handleOpenModalForNew()} 
                onScheduleClick={handleOpenModalForEdit} 
                onToggleStatus={handleToggleStatus}
              />
            )}
          </div>
        )}
      </div>

      <ScheduleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        initialData={selectedSchedule}
        selectedDate={selectedDate}
        isLoading={isSubmitting}
      />
    </>
  );
}
