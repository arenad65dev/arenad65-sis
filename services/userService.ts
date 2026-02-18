import api from './api';

export interface Permission {
  id: string;
  userId: string;
  module: string;
  action: string;
  granted: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  permissions?: Permission[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  details?: string;
  createdAt: string;
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
  },

  getUserPermissions: async (userId: string) => {
    const response = await api.get(`/users/${userId}/permissions`);
    return response.data;
  },

  updatePermission: async (userId: string, data: { module: string; action: string; granted: boolean }) => {
    const response = await api.put(`/users/${userId}/permissions`, data);
    return response.data;
  },

  bulkUpdatePermissions: async (userId: string, permissions: { module: string; action: string; granted: boolean }[]) => {
    const response = await api.put(`/users/${userId}/permissions/bulk`, permissions);
    return response.data;
  },

  getUserLogs: async (userId: string, limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get(`/users/${userId}/logs${params}`);
    return response.data;
  },

  getMyPermissions: async () => {
    const response = await api.get('/users/me/permissions');
    return response.data;
  },

  requestPasswordReset: async (email: string) => {
    const response = await api.post('/users/reset-password', { email });
    return response.data;
  },

  confirmPasswordReset: async (token: string, email: string, newPassword: string) => {
    const response = await api.post('/users/reset-password/confirm', { token, email, newPassword });
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/users/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
