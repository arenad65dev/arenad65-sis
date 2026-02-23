import api from './api';
import { User } from '../types';

const API_URL = '/clients';

export interface Client extends User {
    cpf?: string;
    phone?: string;
}

export const clientService = {
    list: async (search?: string): Promise<Client[]> => {
        const params = search ? { search } : {};
        const response = await api.get(API_URL, { params });
        // Mapear Client para User (interface usada no POS)
        return response.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            email: c.email || '',
            role: 'CLIENT', // Mock role for frontend compatibility
            department: 'External',
            status: 'active',
            level: 'Prata', // Mock level
            points: c.points || 0,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`,
            cpf: c.cpf,
            phone: c.phone
        }));
    },

    create: async (data: { name: string; phone: string; cpf?: string; email?: string }): Promise<Client> => {
        const response = await api.post(API_URL, data);
        const c = response.data;
        return {
            id: c.id,
            name: c.name,
            role: 'CLIENT',
            department: 'External',
            status: 'active',
            email: c.email || '',
            level: 'Prata',
            points: c.points || 0,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`,
            cpf: c.cpf,
            phone: c.phone
        };
    }
};
