import axios from 'axios';

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
    // Adicionar /api se for uma URL completa e não tiver o caminho
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  // Em produção usa proxy nginx (/api), em desenvolvimento localhost
  return window.location.hostname === 'localhost' 
    ? 'http://localhost:3333/api' 
    : '/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
});

api.interceptors.request.use((config) => {
  // Backward compatibility: older builds stored JWT as "token"
  const token = localStorage.getItem('arena_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, clear local storage and redirect to login
      localStorage.removeItem('arena_token');
      localStorage.removeItem('token');
      localStorage.removeItem('arena_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
