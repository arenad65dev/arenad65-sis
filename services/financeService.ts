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

const paymentMethodMap: Record<string, string> = {
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
  CASH: 'Dinheiro',
  PIX: 'PIX',
  TRANSFER: 'Transferência',
  TAB: 'Fiado'
};

export const financeService = {
  getTransactions: async (filter: string, startDate?: string, endDate?: string) => {
    const params: any = { limit: 1000 };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get<BackendTransaction[]>('/finance/transactions', { params });

    return response.data.map((tx) => ({
      id: tx.id,
      title: tx.description || (tx.type === 'INCOME' ? 'Receita' : 'Despesa'),
      amount: Number(tx.amount || 0),
      type: tx.type === 'INCOME' ? 'income' : 'expense',
      date: tx.date,
      paymentMethod: tx.paymentMethod ? (paymentMethodMap[tx.paymentMethod] || tx.paymentMethod) : 'N/A',
      category: tx.category,
      cashier: tx.cashier,
      orderNumber: (tx as any).orderNumber,
      orderCategories: (tx as any).orderCategories,
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
