import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, Loader2 } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAuth } from '../store/useAuth';

export default function Reports() {
  const [data, setData] = useState<{ cashflow: any[], topCategories: any[] }>({ cashflow: [], topCategories: [] });
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuth(state => state.token);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    const res = await fetchApi('GET_REPORTS', {}, token!);
    if (res.status === 'success') {
      setData(res.data);
    }
    setIsLoading(false);
  };

  const handleExportCSV = () => {
    const headers = "Kategori,Jumlah,Persentase\n";
    const csvContent = "data:text/csv;charset=utf-8," + headers + data.topCategories.map(e => `${e.cat},${e.amount.replace(/Rp\s/,'').replace(/\./g,'')},${e.pct}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "laporan_pengeluaran.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-stabilo)]" /></div>;
  }

  return (
    <div className="p-4 lg:p-8 w-full max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Laporan Analitik</h2>
        <button onClick={handleExportCSV} className="bg-surface hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors hover:border-[var(--color-stabilo)] hover:text-[var(--color-stabilo)]">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/5">
        <h3 className="font-bold mb-6 text-lg">Cashflow Bulan Ini</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.cashflow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${val}k`} />
              <Tooltip 
                cursor={{ fill: '#ffffff05' }}
                contentStyle={{ backgroundColor: '#1a2236', border: '1px solid #ffffff10', borderRadius: '12px' }} 
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="income" name="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="expense" name="Pengeluaran" fill="#ccff00" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/5 border-t-[var(--color-stabilo)] border-t-[4px]">
          <h3 className="font-bold mb-4">Top Kategori Pengeluaran</h3>
          <div className="space-y-4">
            {data.topCategories.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-slate-300">{item.cat}</span>
                <div className="text-right">
                  <p className="font-medium text-[var(--color-stabilo)]">{item.amount}</p>
                  <p className="text-xs text-slate-500">{item.pct}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
