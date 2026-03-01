import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login only if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      throw new Error('Cannot connect to server. Please check your connection.');
    }

    // Return error with consistent format
    const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
    throw new Error(errorMessage);
  }
);

// =========================
// AUTH APIs
// =========================
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// =========================
// PRODUCT APIs
// =========================
export const productAPI = {
  // Get all products (staff sees active only, admin sees all)
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get product categories
  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  // Get single product by ID
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product (admin only)
  createProduct: async (data) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  // Update product (admin only)
  updateProduct: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Soft delete product (admin only)
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// =========================
// BILL APIs
// =========================
export const billAPI = {
  // Create and finalize a bill
  createBill: async (billData) => {
    const response = await api.post('/bills', billData);
    return response.data;
  },

  // Get all bills (filtered by role)
  getBills: async (params = {}) => {
    const response = await api.get('/bills', { params });
    return response.data;
  },

  // Get single bill by ID
  getBill: async (id) => {
    const response = await api.get(`/bills/${id}`);
    return response.data;
  },

  // Get bill by bill number (for reprints)
  getBillByNumber: async (billNumber) => {
    const response = await api.get(`/bills/number/${billNumber}`);
    return response.data;
  },

  // Void a bill (admin only)
  voidBill: async (id, reason) => {
    const response = await api.put(`/bills/${id}/void`, { reason });
    return response.data;
  },
};

// =========================
// USER APIs (Admin only)
// =========================
export const userAPI = {
  // Get all users
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get single user by ID
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (data) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Update user
  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Deactivate user (soft delete)
  deactivateUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// =========================
// REPORT APIs (Admin only)
// =========================
export const reportAPI = {
  // Get daily sales summary
  getDailySales: async (date) => {
    const response = await api.get('/reports/daily', { 
      params: date ? { date } : {} 
    });
    return response.data;
  },

  // Get date range sales report
  getDateRangeSales: async (startDate, endDate) => {
    const response = await api.get('/reports/date-range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Get staff-wise sales summary
  getStaffSales: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/reports/staff', { params });
    return response.data;
  },

  // Get top-selling products
  getTopProducts: async (params = {}) => {
    const response = await api.get('/reports/top-products', { params });
    return response.data;
  },
};

// =========================
// SETTINGS APIs
// =========================
export const settingsAPI = {
  // Get shop settings
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Update settings (admin only)
  updateSettings: async (data) => {
    const response = await api.put('/settings', data);
    return response.data;
  },
};

// =========================
// STAFF PAYMENT APIs (Admin only)
// =========================
export const staffPaymentAPI = {
  // Create work record
  createWorkRecord: async (data) => {
    const response = await api.post('/staff-payments', data);
    return response.data;
  },

  // Get all work records
  getWorkRecords: async (params = {}) => {
    const response = await api.get('/staff-payments', { params });
    return response.data;
  },

  // Get single work record
  getWorkRecord: async (id) => {
    const response = await api.get(`/staff-payments/${id}`);
    return response.data;
  },

  // Update work record
  updateWorkRecord: async (id, data) => {
    const response = await api.put(`/staff-payments/${id}`, data);
    return response.data;
  },

  // Add payment to record
  addPayment: async (id, amount) => {
    const response = await api.post(`/staff-payments/${id}/payment`, { amount });
    return response.data;
  },

  // Get staff summary
  getStaffSummary: async (staffId, params = {}) => {
    const response = await api.get(`/staff-payments/staff/${staffId}/summary`, { params });
    return response.data;
  },

  // Delete work record
  deleteWorkRecord: async (id) => {
    const response = await api.delete(`/staff-payments/${id}`);
    return response.data;
  },

  // Get payment statistics
  getPaymentStats: async (params = {}) => {
    const response = await api.get('/staff-payments/stats', { params });
    return response.data;
  },
};

// =========================
// STOCK APIs
// =========================
export const stockAPI = {
  // Get full stock list
  getStockList: async (params = {}) => {
    const response = await api.get('/stock', { params });
    return response.data;
  },

  // Get low-stock / out-of-stock alerts
  getAlerts: async () => {
    const response = await api.get('/stock/alerts');
    return response.data;
  },

  // Get stock ledger for a product
  getProductLedger: async (productId, params = {}) => {
    const response = await api.get(`/stock/${productId}/ledger`, { params });
    return response.data;
  },

  // Manual stock adjustment (admin)
  adjustStock: async (productId, quantity, note) => {
    const response = await api.post(`/stock/${productId}/adjust`, { quantity, note });
    return response.data;
  },
};

export default api;
