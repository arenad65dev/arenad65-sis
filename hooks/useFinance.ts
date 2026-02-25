
import { useQuery } from '@tanstack/react-query';
import { financeService } from '../services/financeService';

export const useFinanceData = (filter: string = 'all') => {
  const transactionsQuery = useQuery({
    queryKey: ['transactions', filter],
    queryFn: () => financeService.getTransactions(filter),
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
