import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

type Period = 'current_month' | 'last_month' | 'custom';
type CostCenter = 'all' | 'bar' | 'courts' | 'store';

const MOCK_DRE_DATA = [
    { label: 'Receita Bruta', value: 45250.00, type: 'credit' },
    { label: '(-) Impostos e Taxas (DAS/Cartão)', value: -3845.25, type: 'debit' },
    { label: '(=) Receita Líquida', value: 41404.75, type: 'subtotal' },
    { label: '(-) CMV (Custo Mercadoria)', value: -12500.00, type: 'debit' },
    { label: '(-) Manutenção / Operacional', value: -4200.00, type: 'debit' },
    { label: '(=) Lucro Bruto', value: 24704.75, type: 'subtotal' },
    { label: '(-) Despesas Fixas (Aluguel/Folha)', value: -15000.00, type: 'debit' },
    { label: '(=) Lucro Líquido (Bottom Line)', value: 9704.75, type: 'total' },
];

const MOCK_COMPARISON_DATA = [
    { name: 'Sem 1', current: 4000, previous: 3500 },
    { name: 'Sem 2', current: 3000, previous: 4200 },
    { name: 'Sem 3', current: 5500, previous: 4800 },
    { name: 'Sem 4', current: 6200, previous: 5100 },
];

const MOCK_PAYMENT_DATA = [
    { name: 'PIX', value: 65, color: '#10B981' }, // Tailwind emerald-500
    { name: 'Crédito', value: 25, color: '#3B82F6' }, // Tailwind blue-500
    { name: 'Débito', value: 5, color: '#F59E0B' }, // Tailwind amber-500
    { name: 'Dinheiro', value: 5, color: '#64748B' }, // Tailwind slate-500
];

const MOCK_COHORT_DATA = [
    { cohort: 'Out/2025', users: 120, month1: '100%', month2: '65%', month3: '45%' },
    { cohort: 'Nov/2025', users: 145, month1: '100%', month2: '70%', month3: '52%' },
    { cohort: 'Dez/2025', users: 180, month1: '100%', month2: '68%', month3: '-' },
];

const ReportsView: React.FC = () => {
    const [period, setPeriod] = useState<Period>('current_month');
    const [costCenter, setCostCenter] = useState<CostCenter>('all');

    return (
        <div className="h-full flex flex-col gap-6 animate-fadeIn pb-20">

            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                        Inteligência de Negócio
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Análise detalhada de performance e resultados.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {/* Period Selector */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            onClick={() => setPeriod('current_month')}
                            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${period === 'current_month' ? 'bg-white dark:bg-surface-dark shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'
                                }`}
                        >
                            Mês Atual
                        </button>
                        <button
                            onClick={() => setPeriod('last_month')}
                            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${period === 'last_month' ? 'bg-white dark:bg-surface-dark shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'
                                }`}
                        >
                            Mês Anterior
                        </button>
                        <button
                            onClick={() => setPeriod('custom')}
                            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${period === 'custom' ? 'bg-white dark:bg-surface-dark shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'
                                }`}
                        >
                            Personalizado
                        </button>
                    </div>

                    {period === 'custom' && (
                        <div className="flex gap-2 animate-fadeIn">
                            <input
                                type="date"
                                className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold uppercase rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <span className="text-slate-400 font-bold self-center">-</span>
                            <input
                                type="date"
                                className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold uppercase rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    )}

                    {/* Cost Center Selector */}
                    <select
                        value={costCenter}
                        onChange={(e) => setCostCenter(e.target.value as CostCenter)}
                        className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold uppercase rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">Todos os Centros</option>
                        <option value="bar">Bar & Cozinha</option>
                        <option value="courts">Locação de Quadras</option>
                        <option value="store">Loja / Pro-Shop</option>
                    </select>

                    {/* Export Button */}
                    <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-sm">download</span>
                        Exportar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* DRE Column */}
                <div className="lg:col-span-1 bg-white dark:bg-surface-dark rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">DRE Gerencial</h3>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Resultado do Período</p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                        {MOCK_DRE_DATA.map((item, idx) => (
                            <div
                                key={idx}
                                className={`flex justify-between items-center p-3 rounded-xl transition-colors ${item.type === 'total' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' :
                                    item.type === 'subtotal' ? 'bg-slate-50 dark:bg-slate-800 font-bold' :
                                        'border-b border-slate-100 dark:border-slate-800/50'
                                    }`}
                            >
                                <span className={`text-xs ${item.type === 'total' ? 'font-black' : item.type === 'subtotal' ? 'font-bold text-slate-700 dark:text-slate-300' : 'font-medium text-slate-500'}`}>
                                    {item.label}
                                </span>
                                <span className={`text-sm ${item.type === 'total' ? 'font-black' : item.type === 'debit' ? 'text-red-500' : 'font-bold text-slate-900 dark:text-white'}`}>
                                    {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Charts Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Comparative Chart */}
                    <div className="bg-white dark:bg-surface-dark rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <span className="material-symbols-outlined">trending_up</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Evolução de Receita</h3>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Comparativo Mês Atual vs Anterior</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="size-2 rounded-full bg-primary"></span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">2026</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="size-2 rounded-full bg-slate-200"></span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">2025</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={MOCK_COMPARISON_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }} tickFormatter={(val) => `R$ ${val / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Line type="monotone" dataKey="current" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="previous" stroke="#CBD5E1" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Payment Methods */}
                        <div className="bg-white dark:bg-surface-dark rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Meios de Pagamento</h3>
                            <div className="h-[200px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={MOCK_PAYMENT_DATA}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {MOCK_PAYMENT_DATA.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Cohort Analysis */}
                        <div className="bg-white dark:bg-surface-dark rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Cohort (Retenção)</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            <th className="text-left font-black text-slate-400 uppercase tracking-wider py-2">Safra</th>
                                            <th className="text-center font-black text-slate-400 uppercase tracking-wider py-2">Users</th>
                                            <th className="text-center font-black text-slate-400 uppercase tracking-wider py-2">Mês 1</th>
                                            <th className="text-center font-black text-slate-400 uppercase tracking-wider py-2">Mês 2</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {MOCK_COHORT_DATA.map((row, idx) => (
                                            <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                                                <td className="py-3 font-bold text-slate-900 dark:text-white">{row.cohort}</td>
                                                <td className="py-3 text-center text-slate-500">{row.users}</td>
                                                <td className="py-3 text-center bg-blue-50 dark:bg-blue-900/10 font-bold text-blue-600 dark:text-blue-400 rounded-lg">{row.month1}</td>
                                                <td className="py-3 text-center font-bold text-slate-600 dark:text-slate-400">{row.month2}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReportsView;
