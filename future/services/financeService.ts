// Mock implementation until backend is ready
export const financeService = {
    getTransactions: async (filter: string) => {
        // Mock data
        return [
            { id: '1', description: 'Venda Balcão', amount: 50.00, type: 'INCOME', date: new Date().toISOString() },
            { id: '2', description: 'Compra de Refrigerante', amount: 200.00, type: 'EXPENSE', date: new Date().toISOString() },
        ];
    },

    getStats: async () => {
        return {
            monthlyIncome: 15000,
            monthlyExpense: 8000,
            balance: 7000
        };
    }
};
