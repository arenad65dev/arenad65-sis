
import { MOCK_TRANSACTIONS, MOCK_PRODUCTS, MOCK_COURTS, MOCK_USERS } from '../constants';

// Simulação de delay de rede para testar estados de loading e cache
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const FinanceService = {
  getTransactions: async (filter?: string) => {
    await delay(600);
    if (!filter) return MOCK_TRANSACTIONS;
    return MOCK_TRANSACTIONS.filter(t => t.category === filter || filter === 'all');
  },
  getStats: async () => {
    await delay(400);
    return {
      revenue: 42500,
      growth: 12.5,
      occupancy: 78,
      activeClients: 1240
    };
  }
};

export const InventoryService = {
  getProducts: async () => {
    await delay(500);
    return MOCK_PRODUCTS;
  },
  updateStock: async (id: string, newStock: number) => {
    await delay(300);
    console.log(`Stock updated for ${id}: ${newStock}`);
    return true;
  }
};
