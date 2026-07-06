import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor – attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('meditrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor – handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('meditrack_token');
      localStorage.removeItem('meditrack_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// ==================== MEDICINES ====================
export const medicineAPI = {
  getAll: (params) => api.get('/medicines', { params }),
  getById: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
  getLowStock: () => api.get('/medicines/low-stock'),
  getExpired: () => api.get('/medicines/expired'),
  getExpiringSoon: () => api.get('/medicines/expiring-soon'),
  getCategories: () => api.get('/medicines/categories'),
  search: (q, category, page, size) => api.get('/medicines/search', { params: { q, category, page, size } }),
};

// ==================== SUPPLIERS ====================
export const supplierAPI = {
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// ==================== SALES ====================
export const saleAPI = {
  getAll: (params) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
  getByCustomer: (customerId, params) => api.get(`/sales/customer/${customerId}`, { params }),
};

// ==================== PRESCRIPTIONS ====================
export const prescriptionAPI = {
  getAll: (params) => api.get('/prescriptions', { params }),
  getByCustomer: (customerId, params) => api.get(`/prescriptions/customer/${customerId}`, { params }),
  upload: (customerId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('customerId', customerId);
    return api.post('/prescriptions/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  updateStatus: (id, data) => api.put(`/prescriptions/${id}/status`, data),
};

// ==================== DASHBOARD ====================
export const dashboardAPI = {
  getAdmin: () => api.get('/dashboard/admin'),
  getPharmacist: () => api.get('/dashboard/pharmacist'),
};

// ==================== USERS ====================
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  toggleStatus: (id) => api.put(`/users/${id}/toggle-status`),
  delete: (id) => api.delete(`/users/${id}`),
};

// ==================== REPORTS ====================
export const reportAPI = {
  salesPdf: (start, end) => api.get('/reports/sales/pdf', { params: { start, end }, responseType: 'blob' }),
  inventoryExcel: () => api.get('/reports/inventory/excel', { responseType: 'blob' }),
  invoicePdf: (saleId) => api.get(`/reports/invoice/${saleId}/pdf`, { responseType: 'blob' }),
};

export default api;
