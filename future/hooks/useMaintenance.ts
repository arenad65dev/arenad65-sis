
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceService } from '../services/maintenanceService';

export const useMaintenance = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['maintenance'],
        queryFn: maintenanceService.getAll,
    });

    const createMutation = useMutation({
        mutationFn: maintenanceService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] }); // Refresh dashboard too
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => maintenanceService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
        }
    });

    return {
        tasks: query.data || [],
        isLoading: query.isLoading,
        createTask: createMutation.mutateAsync,
        updateTask: updateMutation.mutateAsync
    };
};
