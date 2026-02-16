import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('arena_token');
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
      localStorage.removeItem('arena_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
