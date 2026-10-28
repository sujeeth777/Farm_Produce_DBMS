import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-attach authorization token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('farmhub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handling interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'API request failed';
    return Promise.reject(new Error(message));
  }
);

// Produce CRUD API Calls
export const fetchProduce = (params) => api.get('/produce', { params });
export const fetchProduceById = (id) => api.get(`/produce/${id}`);
export const createProduce = (data) => api.post('/produce', data);
export const updateProduce = (id, data) => api.put(`/produce/${id}`, data);
export const deleteProduce = (id) => api.delete(`/produce/${id}`);
export const fetchCategories = () => api.get('/categories');

// Sales API Calls
export const recordSale = (data) => api.post('/sales', data);
export const fetchSales = (params) => api.get('/sales', { params });
export const fetchDashboardSummary = () => api.get('/sales/dashboard-summary');

// Auth API Calls
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);
export const fetchCurrentUser = () => api.get('/auth/me');

// System Health
export const checkHealth = () => api.get('/health');

export default api;
