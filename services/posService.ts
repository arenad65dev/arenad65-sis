import api from './api';

export const posService = {
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

    createOrder: async (data: { userId?: string, items: { productId: string, quantity: number }[] }) => {
        const response = await api.post('/pos/orders', data);
        return response.data;
    },

    payOrder: async (orderId: string, paymentMethod: string) => {
        const response = await api.post(`/pos/orders/${orderId}/pay`, { paymentMethod });
        return response.data;
    }
};
