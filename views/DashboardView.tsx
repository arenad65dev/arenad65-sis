import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, Tooltip, AreaChart, Area, CartesianGrid } from 'recharts';
import { Module } from '../types';
import { useDashboardData } from '../hooks/useDashboard';

interface DashboardViewProps {
  onNavigate?: (module: Module) => void;
}

interface KPIItem {
  label: string;
  value: string;
  trend: string;
  color: string;
  icon: string;
  id: string;
  target?: Module;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { kpis, analytics } = useDashboardData();

  const kpiData: KPIItem[] = [
    { label: 'Receita Total', value: `R$ ${(Number(kpis.monthlyIncome) || 0).toFixed(2)}`, trend: 'Mensal', color: 'primary', icon: 'payments', id: 'revenue' },
    { label: 'Lucro Líquido', value: `R$ ${(Number(kpis.netProfit) || 0).toFixed(2)}`, trend: 'Mensal', color: 'blue', icon: 'trending_up', id: 'margin' },
    { label: 'Despesas', value: `R$ ${(Number(kpis.monthlyExpense) || 0).toFixed(2)}`, trend: 'Mensal', color: 'red', icon: 'warning', id: 'expense' },
    { label: 'Total Produtos', value: (Number(kpis.totalProducts) || 0).toString(), trend: 'Ativos', color: 'green', icon: 'inventory_2', id: 'products', target: Module.INVENTORY },
    { label: 'Valor Estoque', value: `R$ ${(Number(kpis.totalStockValue) || 0).toFixed(2)}`, trend: 'Preço Venda', color: 'purple', icon: 'warehouse', id: 'stock-value' },
    { label: 'Giro Mensal', value: `${(Number(kpis.avgTurnover) || 0).toFixed(1)}x`, trend: 'Médio Real', color: 'orange', icon: 'sync', id: 'turnover' },
  ];

  const maintenanceSchedule = [
    { item: 'Nivelamento Areia (Q1)', date: 'Em 2 dias', priority: 'high', icon: 'handyman' },
    { item: 'Revisão Refletores (Q3)', date: '15 Out', priority: 'medium', icon: 'lightbulb' },
    { item: 'Troca de Redes (SOCIETY)', date: '22 Out', priority: 'low', icon: 'sports_soccer' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-12">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpiData.map((kpi, idx) => (
          <div
            key={idx}
            onClick={() => kpi.target && onNavigate?.(kpi.target)}
            className={`p-8 bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-2xl relative overflow-hidden group transition-all h-44 flex flex-col justify-between ${kpi.target ? 'cursor-pointer hover:border-primary/50 ring-0 hover:ring-1 ring-primary/20' : ''}`}
          >
            {/* Ícone de Fundo Decorativo */}
            <div className="absolute -top-2 -right-2 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-8xl text-slate-900 dark:text-white">{kpi.icon}</span>
            </div>

            <div className="relative z-10">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">{kpi.label}</span>
            </div>

            <div className="relative z-10 flex flex-wrap items-baseline gap-3">
              <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                {kpi.value}
              </h3>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg border flex items-center gap-1 whitespace-nowrap ${kpi.color === 'red'
                ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
                : 'bg-primary/10 text-primary-dark dark:text-primary border-primary/20'
                }`}>
                {kpi.trend}
                {kpi.target && <span className="material-symbols-outlined text-[12px]">arrow_forward</span>}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-8 p-8 bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-2xl h-[450px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Fluxo Financeiro Consolidado</h4>
                <div className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[8px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-white/5">
                  Últimos 7 Dias
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-primary">history</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Atualizado em tempo real</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Receita</span>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#13ec5b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#13ec5b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000008" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`R$ ${(Number(value) || 0).toFixed(2)}`, 'Receita']}
                />
                <Area type="monotone" dataKey="income" stroke="#13ec5b" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-4 p-8 bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-2xl flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <h4 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Curva ABC</h4>
            <span className="text-[9px] font-black text-primary uppercase bg-primary/10 px-2 py-1 rounded">Últimos 30 Dias</span>
          </div>
          <div className="space-y-4 flex-1">
            {analytics.topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
                <span className="material-symbols-outlined text-4xl mb-2">trending_flat</span>
                <p className="text-xs uppercase font-bold">Sem dados de vendas</p>
              </div>
            ) : analytics.topProducts.map((product: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-primary/20 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-primary/40 italic">#{idx + 1}</span>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[120px]">{product.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{product.sales} vendidos</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black ${product.growth.startsWith('+') ? 'text-primary-dark dark:text-primary' : 'text-slate-400'}`}>
                  {product.growth}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Schedule */}
        <div className="p-8 bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Agenda de Manutenção</h4>
            <span className="material-symbols-outlined text-slate-400">engineering</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-4">
              {analytics.maintenance.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs uppercase font-bold">Nenhuma manutenção programada</div>
              ) : analytics.maintenance.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-primary/20 transition-all group">
                  <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${item.priority === 'HIGH' ? 'bg-red-50 text-red-500 dark:bg-red-900/20' :
                    item.priority === 'MEDIUM' ? 'bg-orange-50 text-orange-500 dark:bg-orange-900/20' :
                      'bg-blue-50 text-blue-500 dark:bg-blue-900/20'
                    }`}>
                    <span className="material-symbols-outlined">{
                      item.title.toLowerCase().includes('areia') ? 'handyman' :
                        item.title.toLowerCase().includes('refletores') ? 'lightbulb' :
                          'sports_soccer'
                    }</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${item.priority === 'HIGH' ? 'text-red-600 bg-red-100' : 'text-slate-400 bg-slate-100'
                    }`}>
                    {item.priority === 'HIGH' ? 'Urgente' : 'Programado'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operational / Categories */}
        <div className="p-8 bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-2xl flex flex-col">
          <h4 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-8">Margem de Contribuição</h4>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={(analytics.margin || []).map((m: any) => ({ name: m.name, value: m.percentage }))}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {(analytics.margin || []).map((entry: any, index: number) => {
                      const colors = ["#13ec5b", "#137fec", "#ec13bc", "#e2b610", "#8e13ec", "#ec5b13", "#13d9ec", "#8eec13"];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip formatter={(val: number, name: string) => [`${val}%`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {(analytics.margin || []).map((item: any, index: number) => {
              const bcolors = ["bg-[#13ec5b]", "bg-[#137fec]", "bg-[#ec13bc]", "bg-[#e2b610]", "bg-[#8e13ec]", "bg-[#ec5b13]", "bg-[#13d9ec]", "bg-[#8eec13]"];
              return (
                <div key={item.name} className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex-1 min-w-[120px]">
                  <div className={`size-2 rounded-full ${bcolors[index % bcolors.length]} mb-1`}></div>
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center truncate w-full">{item.name}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{item.percentage.toFixed(1)}%</span>
                  <span className="text-[10px] text-slate-400">R$ {Number(item.value).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
