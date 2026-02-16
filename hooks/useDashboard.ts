import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export const useDashboardData = () => {
    const kpiQuery = useQuery({
        queryKey: ['dashboard-kpis'],
        queryFn: () => dashboardService.getKPIs(),
        refetchInterval: 1000 * 60 * 5 // 5 minutes
    });

    const transactionsQuery = useQuery({
        queryKey: ['dashboard-transactions'],
        queryFn: () => dashboardService.getTransactions(),
        refetchInterval: 1000 * 60 * 5
    });

    const analyticsQuery = useQuery({
        queryKey: ['dashboard-analytics'],
        queryFn: () => dashboardService.getAnalytics(),
        refetchInterval: 1000 * 60 * 5
    });

    return {
        kpis: kpiQuery.data || {},
        transactions: transactionsQuery.data || [],
        analytics: analyticsQuery.data || {
            chartData: [],
            topProducts: [],
            margin: {
                bar: { value: 0, percentage: 0 },
                facilities: { value: 0, percentage: 0 }
            },
            maintenance: []
        },
        isLoading: kpiQuery.isLoading || transactionsQuery.isLoading || analyticsQuery.isLoading,
        isError: kpiQuery.isError || transactionsQuery.isError || analyticsQuery.isError
    };
};
