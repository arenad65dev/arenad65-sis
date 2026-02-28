
import { useQuery } from '@tanstack/react-query';
import { financeService } from '../services/financeService';

export const useFinanceData = (filter: string = 'all', startDate?: string, endDate?: string) => {
  const transactionsQuery = useQuery({
    queryKey: ['transactions', filter, startDate, endDate],
    queryFn: () => financeService.getTransactions(filter, startDate, endDate),
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
  });

  const statsQuery = useQuery({
    queryKey: ['finance-stats'],
    queryFn: () => financeService.getStats(),
  });

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading || statsQuery.isLoading,
    stats: statsQuery.data,
    isError: transactionsQuery.isError
  };
};
