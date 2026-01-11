
import React, { useState } from 'react';
import { useFinanceData } from '../hooks/useFinance';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, YAxis } from 'recharts';

interface Toast {
  id: number;
  message: string;
}

const FinanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'Instalações' | 'Bar / PDV'>('all');
  const { transactions, stats, isLoading } = useFinanceData(activeTab);
  const [isExporting, setIsExporting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      addToast("Extrato Financeiro exportado com sucesso! (PDF)");
    }, 2000);
  };

  const COLORS = ['#13ec5b', '#137fec', '#9333ea', '#f59e0b'];

  const chartDataArea = [
    { name: '01/06', val: 4000 }, { name: '05/06', val: 3200 }, { name: '10/06', val: 5100 },
    { name: '15/06', val: 4800 }, { name: '20/06', val: 6200 }, { name: '25/06', val: 5900 }, { name: '30/06', val: 7500 },
  ];

  const chartDataROI = [
    { name: 'Quadra 1', receita: 4500, custo: 800 },
    { name: 'Quadra 2', receita: 3800, custo: 650 },
    { name: 'Society A', receita: 8200, custo: 1200 },
    { name: 'Society B', receita: 7900, custo: 1100 },
  ];

  const chartDataCategories = [
    { name: 'Bebidas', value: 55 },
    { name: 'Comidas', value: 30 },
    { name: 'Equip.', value: 15 },
  ];

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

  const renderKPIs = () => {
    if (activeTab === 'Instalações') {
      return (
        <>
          <StatCard label="Receita por Quadra (Méd)" value="R$ 6.100" trend="Top: Society A" color="blue" />
          <StatCard label="Custo Manut. Total" value="R$ 3.750" trend="5.2% da receita" color="red" />
          <StatCard label="Tempo de Inatividade" value="12h" trend="-4h vs mês ant." color="slate" />
        </>
      );
    }
    if (activeTab === 'Bar / PDV') {
      return (
        <>
          <StatCard label="Ticket Médio" value="R$ 48,50" trend="+R$ 3,20" color="primary" />
          <StatCard label="Pico de Vendas" value="19h - 21h" trend="Quintas e Sextas" color="blue" />
          <StatCard label="Perda / Desperdício" value="R$ 420,00" trend="1.2% do giro" color="red" />
        </>
      );
    }
    return (
      <>
        <StatCard label="Receita Mensal" value={stats ? `R$ ${stats.revenue.toLocaleString('pt-BR')}` : 'R$ 0,00'} trend="+12%" color="primary" />
        <StatCard label="Ocupação Média" value={stats ? `${stats.occupancy}%` : '0%'} trend="+5%" color="blue" />
        <StatCard label="Clientes Ativos" value={stats?.activeClients?.toString() || '0'} trend="+8%" color="primary" />
      </>
    );
  };

  const renderChart = () => {
    if (activeTab === 'Instalações') {
      return (
        <div className="h-[350px] w-full">
          <ResponsiveContainer>
            <BarChart data={chartDataROI}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0000000a" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="receita" fill="#13ec5b" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar dataKey="custo" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    if (activeTab === 'Bar / PDV') {
      return (
        <div className="h-[350px] w-full flex items-center">
          <ResponsiveContainer width="60%" height="100%">
            <PieChart>
              <Pie data={chartDataCategories} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                {chartDataCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="w-[40%] space-y-4 pr-8">
            {chartDataCategories.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-[10px] font-black uppercase text-slate-500">{c.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="h-[350px] w-full">
        <ResponsiveContainer>
          <AreaChart data={chartDataArea}>
            <defs>
              <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#13ec5b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#13ec5b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#0000000a" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
            <Area type="monotone" dataKey="val" stroke="#13ec5b" strokeWidth={3} fillOpacity={1} fill="url(#areaColor)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 animate-fadeIn pb-12">
      {/* Toasts */}
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
          <p className="text-slate-500">
            {activeTab === 'all' ? 'Visão consolidada da Arena.' : activeTab === 'Instalações' ? 'Análise de ROI e Custos Fixos.' : 'Performance de Vendas e Giro.'}
          </p>
        </div>
        <div className="flex gap-2 p-1 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {['all', 'Instalações', 'Bar / PDV'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveTab(f as any)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === f ? 'bg-primary text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f === 'all' ? 'Visão Geral' : f}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderKPIs()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-black mb-8 flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tight">
            <span className="material-symbols-outlined text-primary">{activeTab === 'Bar / PDV' ? 'pie_chart' : 'analytics'}</span>
            {activeTab === 'all' ? 'Receita Semanal' : activeTab === 'Instalações' ? 'ROI por Unidade (Receita vs Custo)' : 'Mix de Vendas por Categoria'}
          </h3>
          {renderChart()}
        </div>

        <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-lg font-black mb-8 text-slate-900 dark:text-white uppercase tracking-tight">
            {activeTab === 'Instalações' ? 'Lançamentos de Infra' : activeTab === 'Bar / PDV' ? 'Vendas em Tempo Real' : 'Atividades Recentes'}
          </h3>
          <div className="space-y-4 flex-1">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/5 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${tx.type === 'income' ? 'bg-primary/10 text-primary-dark dark:text-primary' : 'bg-red-500/10 text-red-500'}`}>
                    <span className="material-symbols-outlined text-[20px]">
                      {activeTab === 'Bar / PDV' ? 'payments' : (tx.type === 'income' ? 'trending_up' : 'construction')}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{tx.title}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{tx.date} {activeTab === 'Bar / PDV' && '• Pix'}</p>
                  </div>
                </div>
                <p className={`text-xs font-black shrink-0 ${tx.type === 'income' ? 'text-primary-dark dark:text-primary' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="mt-8 w-full py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all flex items-center justify-center gap-3"
          >
            {isExporting ? (
              <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">file_download</span>
            )}
            {isExporting ? 'Gerando...' : 'Ver Extrato Completo'}
          </button>
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
