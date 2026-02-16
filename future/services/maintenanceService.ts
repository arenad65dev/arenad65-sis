
import api from './api';

export const maintenanceService = {
    getAll: async () => {
        const response = await api.get('/maintenance');
        return response.data;
    },

    create: async (data: { title: string; date: string; priority: string; status?: string }) => {
        const response = await api.post('/maintenance', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.put(`/maintenance/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/maintenance/${id}`);
        return response.data;
    }
};
