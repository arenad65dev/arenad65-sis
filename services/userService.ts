import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar?: string;
  department?: string;
  createdAt: string;
  updatedAt?: string;
}

export const userService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
    avatar?: string;
  }) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<{
    name: string;
    email: string;
    password: string;
    role: string;
    department: string;
    avatar: string;
    isActive: boolean;
  }>) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  reactivateUser: async (id: string) => {
    const response = await api.post(`/users/${id}/reactivate`);
    return response.data;
  }
};
