import { useState, useEffect } from 'react';
import { Download, Loader2, AlertCircle, FileText, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

  const exportToExcel = () => {
    if (!data?.daily_data) {
      setToastMsg('Tidak ada data untuk diekspor');
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }
    
    // Flatten transactions
    let allTxs: any[] = [];
    Object.keys(data.daily_data).forEach(day => {
      if (data.daily_data[day].transactions) {
        allTxs = [...allTxs, ...data.daily_data[day].transactions];
      }
    });
    
    if (allTxs.length === 0) {
      setToastMsg('Tidak ada transaksi di bulan ini');
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }

    const wsData = allTxs.map(tx => ({
      Tanggal: new Date(tx.tx_date).toLocaleDateString('id-ID'),
      Tipe: tx.tx_type,
      Kategori: tx.category_id || '-',
      Catatan: tx.note || '-',
      Nominal: Number(tx.amount) || 0
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Transaksi");
    XLSX.writeFile(wb, `Laporan_Finoza_${currentMonth}_${currentYear}.xlsx`);
  };

  const exportToPDF = async () => {
    setToastMsg('Memproses PDF...');
    const element = document.getElementById('report-capture-area');
    if (!element) return;
    
    try {
      // Hide buttons temporarily to not include them in PDF
      const actionBtns = document.getElementById('export-actions');
      if (actionBtns) actionBtns.style.display = 'none';

      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Laporan_Finoza_${currentMonth}_${currentYear}.pdf`);
      
      if (actionBtns) actionBtns.style.display = 'flex';
      setToastMsg('');
    } catch (error) {
      console.error(error);
      setToastMsg('Gagal mengekspor PDF');
      setTimeout(() => setToastMsg(''), 3000);
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
        <h2 className="text-xl md:text-2xl font-bold">Laporan Periode</h2>
        <div id="export-actions" className="flex items-center gap-2">
          <button onClick={exportToExcel} className="flex items-center gap-2 px-3 py-2 bg-green-600/10 text-green-600 dark:text-green-400 hover:bg-green-600/20 rounded-lg text-sm font-medium transition-colors">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button onClick={exportToPDF} className="flex items-center gap-2 px-3 py-2 bg-red-600/10 text-red-600 dark:text-red-400 hover:bg-red-600/20 rounded-lg text-sm font-medium transition-colors">
            <FileText className="w-4 h-4" /> PDF
          </button>
        </div>
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
