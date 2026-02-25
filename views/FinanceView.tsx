import React, { useMemo, useState } from 'react';
import { useFinanceData } from '../hooks/useFinance';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, YAxis } from 'recharts';

interface Toast {
  id: number;
  message: string;
}

type FinanceTab = 'all' | 'Instalações' | 'Bar / PDV';

const COLORS = ['#13ec5b', '#137fec', '#f59e0b', '#ef4444', '#8b5cf6'];

const FinanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('all');
  const { transactions, stats, isLoading } = useFinanceData(activeTab);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const filteredTransactions = useMemo(() => {
    if (activeTab === 'Bar / PDV') {
      return transactions.filter((tx: any) => tx.type === 'income');
    }
    if (activeTab === 'Instalações') {
      return transactions.filter((tx: any) => tx.type === 'expense');
    }
    return transactions;
  }, [activeTab, transactions]);

  const computedStats = useMemo(() => {
    const revenue = filteredTransactions
      .filter((tx: any) => tx.type === 'income')
      .reduce((acc: number, tx: any) => acc + Number(tx.amount || 0), 0);

    const expenses = filteredTransactions
      .filter((tx: any) => tx.type === 'expense')
      .reduce((acc: number, tx: any) => acc + Number(tx.amount || 0), 0);

    return {
      revenue,
      expenses,
      net: revenue - expenses,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const chartDataArea = useMemo(() => {
    const byDay: Record<string, number> = {};

    filteredTransactions.forEach((tx: any) => {
      const d = new Date(tx.date);
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      const signal = tx.type === 'income' ? 1 : -1;
      byDay[key] = (byDay[key] || 0) + signal * Number(tx.amount || 0);
    });

    return Object.entries(byDay)
      .map(([name, val]) => ({ name, val: Number(val.toFixed(2)) }))
      .slice(-14);
  }, [filteredTransactions]);

  const categoryData = useMemo(() => {
    const grouped: Record<string, number> = {};

    filteredTransactions.forEach((tx: any) => {
      const category = tx.category || 'Sem categoria';
      grouped[category] = (grouped[category] || 0) + Number(tx.amount || 0);
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredTransactions]);

  const paymentData = useMemo(() => {
    const grouped: Record<string, number> = {};

    filteredTransactions.forEach((tx: any) => {
      const method = tx.paymentMethod || 'N/A';
      grouped[method] = (grouped[method] || 0) + Number(tx.amount || 0);
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredTransactions]);

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      addToast('Sem transações para exportar.');
      return;
    }

    const header = 'id,data,tipo,descricao,categoria,pagamento,operador,valor';
    const rows = filteredTransactions.map((tx: any) => [
      tx.id,
      new Date(tx.date).toISOString(),
      tx.type,
      `"${(tx.title || '').replace(/"/g, '""')}"`,
      `"${(tx.category || '').replace(/"/g, '""')}"`,
      tx.paymentMethod || '',
      `"${(tx.cashier || '').replace(/"/g, '""')}"`,
      Number(tx.amount || 0).toFixed(2),
    ].join(','));

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financeiro-${activeTab.toLowerCase().replace(/\s|\//g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Extrato exportado em CSV com sucesso!');
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className="space-y-8 animate-pulse p-4">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fadeIn pb-12">
      <div className="fixed top-20 right-8 z-[250] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="px-6 py-4 bg-slate-900 text-white dark:bg-primary dark:text-slate-900 rounded-2xl shadow-2xl flex items-center gap-3 animate-fadeIn border border-white/10 pointer-events-auto">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{t.message}</span>
          </div>
        ))}
      </div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Fluxo Financeiro</h1>
          <p className="text-slate-500">Visão baseada nas transações reais registradas no sistema.</p>
        </div>
        <div className="flex gap-2 p-1 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {['all', 'Instalações', 'Bar / PDV'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveTab(f as FinanceTab)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === f ? 'bg-primary text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              {f === 'all' ? 'Visão Geral' : f}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Receita" value={`R$ ${computedStats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} trend="Entradas" color="primary" />
        <StatCard label="Despesas" value={`R$ ${computedStats.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} trend="Saídas" color="red" />
        <StatCard label="Saldo" value={`R$ ${computedStats.net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} trend="Resultado" color={computedStats.net >= 0 ? 'blue' : 'red'} />
        <StatCard label="Transações" value={`${computedStats.transactionCount}`} trend="Registros" color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-black mb-8 flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tight">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Saldo por Dia
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer>
              <AreaChart data={chartDataArea}>
                <defs>
                  <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#13ec5b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#13ec5b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0000000a" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="val" stroke="#13ec5b" strokeWidth={3} fillOpacity={1} fill="url(#areaColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-lg font-black mb-8 text-slate-900 dark:text-white uppercase tracking-tight">Atividades Recentes</h3>
          <div className="space-y-4 flex-1">
            {filteredTransactions.slice(0, 6).map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/5 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${tx.type === 'income' ? 'bg-primary/10 text-primary-dark dark:text-primary' : 'bg-red-500/10 text-red-500'}`}>
                    <span className="material-symbols-outlined text-[20px]">{tx.type === 'income' ? 'trending_up' : 'trending_down'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{tx.title}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(tx.date).toLocaleString('pt-BR')} • {tx.paymentMethod || 'N/A'}</p>
                  </div>
                </div>
                <p className={`text-xs font-black shrink-0 ${tx.type === 'income' ? 'text-primary-dark dark:text-primary' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'} R$ {(Number(tx.amount) || 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="mt-8 w-full py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-black mb-8 text-slate-900 dark:text-white uppercase tracking-tight">Por Categoria</h3>
          <div className="h-[320px]">
            <ResponsiveContainer>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0000000a" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#137fec" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-black mb-8 text-slate-900 dark:text-white uppercase tracking-tight">Métodos de Pagamento</h3>
          <div className="h-[320px] flex items-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie data={paymentData} innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                  {paymentData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-[40%] space-y-3 pr-4">
              {paymentData.map((entry: any, i: number) => (
                <div key={entry.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-[10px] font-black uppercase text-slate-500">{entry.name}</span>
                  </div>
                  <span className="text-[11px] font-black text-slate-900 dark:text-white">R$ {Number(entry.value).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, trend, color }: any) => {
  const colorMap: any = {
    primary: 'text-primary-dark dark:text-primary bg-primary/10 border-primary/20',
    blue: 'text-primary-blue bg-blue-500/10 border-blue-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
    slate: 'text-slate-500 bg-slate-500/10 border-slate-500/20'
  };

  return (
    <div className="p-8 bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/20 transition-all min-h-[160px] flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">{label}</span>
        <span className={`text-[9px] font-black px-2 py-1 rounded-lg border ${colorMap[color] || colorMap.primary}`}>{trend}</span>
      </div>
      <p className="text-4xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tighter whitespace-nowrap">{value}</p>
    </div>
  );
};

export default FinanceView;
