import api from './api';

export interface Table {
    id: string;
    tableNumber: string;
    status: 'OPEN' | 'PAID' | 'CANCELLED';
    totalAmount: number;
    items: TableItem[];
    user?: {
        id: string;
        name: string;
        email: string;
    };
    client?: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
        cpf?: string;
        points?: number;
    };
    clientId?: string;
    notes?: string;
    createdAt: string;
    closedAt?: string;
}

export interface TableItem {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: {
        id: string;
        name: string;
        price: number;
        imageUrl?: string;
    };
}

export const tableService = {
    // Listar mesas abertas
    getOpenTables: async () => {
        const response = await api.get('/tables');
        return response.data;
    },

    // Buscar mesa específica
    getTable: async (tableNumber: string) => {
        const response = await api.get(`/tables/${tableNumber}`);
        return response.data;
    },

    // Abrir mesa
    openTable: async (data: { tableNumber: string, clientId?: string }) => {
        const response = await api.post('/tables/open', data);
        return response.data;
    },

    // Adicionar itens à mesa
    addItemsToTable: async (tableNumber: string, items: { productId: string, quantity: number }[]) => {
        const response = await api.post(`/tables/${tableNumber}/items`, { items });
        return response.data;
    },

    // Sincronizar itens da mesa (inclui remoções)
    syncItemsToTable: async (
        tableNumber: string,
        items: { productId: string, quantity: number }[],
        clientId?: string,
        ownerName?: string
    ) => {
        const response = await api.put(`/tables/${tableNumber}/items`, { items, clientId, ownerName });
        return response.data;
    },

    // Fechar mesa
    closeTable: async (tableNumber: string, paymentData: { paymentMethod: string, paidAmount?: number }) => {
        const response = await api.post(`/tables/${tableNumber}/close`, paymentData);
        return response.data;
    },

    // Transferir mesa
    transferTable: async (fromTableNumber: string, toTableNumber: string) => {
        const response = await api.post(`/tables/${fromTableNumber}/transfer`, { toTableNumber });
        return response.data;
    },

    // Cancelar mesa
    cancelTable: async (tableNumber: string, reason?: string) => {
        const response = await api.delete(`/tables/${tableNumber}`, { data: { reason } });
        return response.data;
    }
};
