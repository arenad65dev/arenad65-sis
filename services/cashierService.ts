import api from './api';

export interface CashierSession {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  openedAt: string;
  closedAt?: string;
  initialBalance: number;
  finalBalance?: number;
  totalSales: number;
  totalSkimmings: number;
  status: 'OPEN' | 'CLOSED';
  skimmings?: Skimming[];
  transactions?: Transaction[];
}

export interface Skimming {
  id: string;
  sessionId: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description?: string;
  date: string;
  paymentMethod?: string;
  category?: {
    id: string;
    name: string;
  };
}

export const cashierService = {
  // Open cashier session
  async openCashier(initialBalance: number): Promise<{ message: string; session: CashierSession }> {
    const response = await api.post('/cashier/open', { initialBalance });
    return response.data;
  },

  // Close cashier session
  async closeCashier(sessionId: string, finalBalance: number): Promise<{ message: string; session: CashierSession }> {
    const response = await api.post(`/cashier/${sessionId}/close`, { finalBalance });
    return response.data;
  },

  // Record skimming
  async recordSkimming(amount: number, reason: string): Promise<{ 
    message: string; 
    skimming: Skimming; 
    session: CashierSession 
  }> {
    const response = await api.post('/cashier/skimming', { amount, reason });
    return response.data;
  },

  // Get current session
  async getCurrentSession(): Promise<CashierSession | null> {
    const response = await api.get('/cashier/current');
    return response.data;
  },

  // Get user sessions
  async getUserSessions(options?: {
    limit?: number;
    offset?: number;
  }): Promise<CashierSession[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await api.get(`/cashier/sessions?${params.toString()}`);
    return response.data;
  },

  // Get session summary
  async getSessionSummary(sessionId: string): Promise<CashierSession> {
    const response = await api.get(`/cashier/sessions/${sessionId}`);
    return response.data;
  }
};