import { useState, useEffect } from 'react';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';
import CalendarView from '../components/reports/CalendarView';
import ReportOverview from '../components/reports/ReportOverview';

export default function Reports() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const token = useAuth(state => state.token);

  useEffect(() => {
    loadReports();
  }, [currentMonth, currentYear]);

  const loadReports = async () => {
    setIsLoading(true);
    const res = await fetchApi('GET_REPORTS', { month: currentMonth, year: currentYear }, token!);
    if (res.status === 'success') {
      setData(res.data);
    }
    setIsLoading(false);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  return (
    <div id="report-capture-area" className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6 md:space-y-8 antialiased">
      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-[popIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">
          <div className="bg-white dark:bg-[#121620] border border-black/5 dark:border-white/10 rounded-2xl px-5 py-3 shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm font-medium text-slate-700 dark:text-white">{toastMsg}</p>
          </div>
          <style>{`
            @keyframes popIn {
              from { opacity: 0; transform: translate(-50%, -10px) scale(0.95); }
              to { opacity: 1; transform: translate(-50%, 0) scale(1); }
            }
          `}</style>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Laporan Periode</h2>
      </div>

      {isLoading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-stabilo)]" />
        </div>
      ) : (
        <>
          <ReportOverview 
            totalIncome={data?.total_income || 0} 
            totalExpense={data?.total_expense || 0} 
            netIncome={(data?.total_income || 0) - (data?.total_expense || 0)} 
          />

          <CalendarView 
            month={currentMonth} 
            year={currentYear} 
            dailyData={data?.daily_data || {}}
            onNextMonth={handleNextMonth}
            onPrevMonth={handlePrevMonth}
          />
        </>
      )}
    </div>
  );
}
