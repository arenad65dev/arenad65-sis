import api from './api';

interface BackendTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  date: string;
  paymentMethod: string | null;
  category: string | null;
  cashier: string | null;
}

interface BackendSummary {
  revenue: number;
  expenses: number;
  net: number;
  transactionCount: number;
  paymentMethods: Record<string, number>;
}

export const financeService = {
  getTransactions: async (_filter: string) => {
    const response = await api.get<BackendTransaction[]>('/finance/transactions', {
      params: { limit: 200 },
    });

    return response.data.map((tx) => ({
      id: tx.id,
      title: tx.description || (tx.type === 'INCOME' ? 'Receita' : 'Despesa'),
      amount: Number(tx.amount || 0),
      type: tx.type === 'INCOME' ? 'income' : 'expense',
      date: tx.date,
      paymentMethod: tx.paymentMethod,
      category: tx.category,
      cashier: tx.cashier,
      orderNumber: (tx as any).orderNumber,
    }));
  },

  getStats: async () => {
    const response = await api.get<BackendSummary>('/finance/summary');
    const summary = response.data;

    return {
      revenue: Number(summary.revenue || 0),
      expenses: Number(summary.expenses || 0),
      net: Number(summary.net || 0),
      transactionCount: Number(summary.transactionCount || 0),
      paymentMethods: summary.paymentMethods || {},
    };
  },
};
