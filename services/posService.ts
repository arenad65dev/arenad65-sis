import api from './api';

export const posService = {
    getCategories: async () => {
        const response = await api.get('/pos/categories');
        return response.data;
    },

    getProducts: async (search?: string, categoryId?: string) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (categoryId && categoryId !== 'Todos') params.append('categoryId', categoryId);

        const response = await api.get('/pos/products', { params });
        return response.data.map((p: any) => ({
            ...p,
            price: Number(p.price)
        }));
    },

    getProduct: async (id: string) => {
        const response = await api.get(`/pos/products/${id}`);
        return response.data;
    },

    updateProduct: async (id: string, data: any) => {
        const response = await api.put(`/pos/products/${id}`, data);
        return response.data;
    },

    getOrders: async (filters?: { status?: string, startDate?: string, endDate?: string, limit?: number }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.limit) params.append('limit', String(filters.limit));

        const response = await api.get('/pos/orders', { params });
        return response.data;
    },

    getOrder: async (id: string) => {
        const response = await api.get(`/pos/orders/${id}`);
        return response.data;
    },

    createOrder: async (data: { userId?: string, items: { productId: string, quantity: number }[] }) => {
        const response = await api.post('/pos/orders', data);
        return response.data;
    },

    payOrder: async (orderId: string, paymentMethod: string) => {
        const response = await api.post(`/pos/orders/${orderId}/pay`, { paymentMethod });
        return response.data;
    },

    getSalesReport: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await api.get('/pos/sales-report', { params });
        return response.data;
    }
};
