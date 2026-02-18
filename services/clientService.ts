import axios from 'axios';
import { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.arenad65.cloud';
const API_URL = `${API_BASE_URL}/api/clients`;

export interface Client extends User {
    cpf?: string;
    phone?: string;
}

export const clientService = {
    // Configurar token JWT
    getToken: () => localStorage.getItem('token'),

    getConfig: () => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    },

    list: async (search?: string): Promise<Client[]> => {
        const config = clientService.getConfig();
        const params = search ? { search } : {};
        const response = await axios.get(API_URL, { ...config, params });
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

    create: async (data: { name: string; cpf?: string; phone?: string; email?: string }): Promise<Client> => {
        const config = clientService.getConfig();
        const response = await axios.post(API_URL, data, config);
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
