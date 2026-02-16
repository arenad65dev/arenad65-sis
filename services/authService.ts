import api from './api';
import { User } from '../types';

export const authService = {
    login: async (email: string, password: string) => {
        const response = await api.post<{ token: string, user: User }>('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('arena_token', response.data.token);
            localStorage.setItem('arena_user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('arena_token');
        localStorage.removeItem('arena_user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('arena_user');
        return userStr ? JSON.parse(userStr) as User : null;
    },

    updateProfile: async (data: Partial<User> & { currentPassword?: string, newPassword?: string }) => {
        const response = await api.post<{ user: User }>('/auth/profile', data);
        if (response.data.user) {
            localStorage.setItem('arena_user', JSON.stringify(response.data.user));
        }
        return response.data.user;
    }
};
