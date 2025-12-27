# API Integration Guide - Frontend to Backend

This guide explains how to integrate the React frontend with the Express backend.

## 🔌 Backend Setup Complete

The backend is now fully functional with:
- ✅ JWT Authentication
- ✅ User Management (Admin/Staff)
- ✅ Product Management
- ✅ Billing System
- ✅ Reports & Analytics
- ✅ Audit Logging
- ✅ Rate Limiting & Security

## 🚀 Quick Start

### 1. Start Backend Server

```bash
cd backend

# First time only - Seed the database
npm run seed

# Start the server
npm run dev
```

Server runs on: `http://localhost:5000`

### 2. Default Credentials

**Admin:**
- Username: `admin`
- Password: `admin123`

**Staff:**
- Username: `staff1`
- Password: `staff123`

## 📡 Frontend Integration

### Create API Service File

Create `frontend/src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  getCurrentUser: () => api.get('/auth/me'),
};

// User APIs
export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deactivateUser: (id) => api.delete(`/users/${id}`),
};

// Product APIs
export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getCategories: () => api.get('/products/categories'),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Bill APIs
export const billAPI = {
  createBill: (data) => api.post('/bills', data),
  getBills: (params) => api.get('/bills', { params }),
  getBill: (id) => api.get(`/bills/${id}`),
  getBillByNumber: (billNumber) => api.get(`/bills/number/${billNumber}`),
  voidBill: (id, reason) => api.put(`/bills/${id}/void`, { reason }),
};

// Report APIs
export const reportAPI = {
  getDailySales: (date) => api.get('/reports/daily', { params: { date } }),
  getDateRangeSales: (startDate, endDate) =>
    api.get('/reports/date-range', { params: { startDate, endDate } }),
  getStaffSales: (startDate, endDate) =>
    api.get('/reports/staff', { params: { startDate, endDate } }),
  getTopProducts: (params) => api.get('/reports/top-products', { params }),
};

// Settings APIs
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
};

export default api;
```

### Update AuthContext to Use Real API

Update `frontend/src/context/AuthContext.jsx`:

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => user?.role === ROLES.ADMIN;

  const value = {
    user,
    login,
    logout,
    isAdmin: isAdmin(),
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Update BillingScreen to Use Real Products

Update `frontend/src/pages/BillingScreen.jsx`:

```javascript
// Add at top
import { productAPI, billAPI } from '../services/api';

// Replace useEffect
useEffect(() => {
  loadProducts();
}, []);

const loadProducts = async () => {
  try {
    const response = await productAPI.getProducts({ isActive: true });
    setProducts(response.data.products);
  } catch (error) {
    console.error('Failed to load products:', error);
    alert('Failed to load products');
  }
};

// Update handleProceedToPayment
const handleProceedToPayment = async () => {
  if (cart.length === 0) {
    alert(getText('Please add items to cart', language));
    return;
  }
  
  navigate('/payment', {
    state: {
      cart,
      total: calculateTotal(),
    },
  });
};
```

### Update PaymentScreen to Create Real Bills

Update `frontend/src/pages/PaymentScreen.jsx`:

```javascript
// Add at top
import { billAPI } from '../services/api';

// Update handlePaymentConfirm
const handlePaymentConfirm = async () => {
  try {
    setLoading(true);

    // Prepare bill data
    const billData = {
      items: cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      paymentMode,
    };

    // Create bill via API
    const response = await billAPI.createBill(billData);
    const bill = response.data.bill;

    setBillNumber(bill.billNumber);
    setBillSaved(true);
    sessionStorage.removeItem('currentBill');

    // Auto print
    setTimeout(() => handlePrint(), 500);
  } catch (error) {
    console.error('Failed to save bill:', error);
    alert(error.response?.data?.error || 'Failed to save bill. Try again.');
  } finally {
    setLoading(false);
  }
};
```

### Update ProductManagement to Use Real API

```javascript
import { productAPI } from '../services/api';

// Load products
const loadProducts = async () => {
  try {
    const response = await productAPI.getProducts();
    setProducts(response.data.products);
  } catch (error) {
    console.error('Failed to load products:', error);
  }
};

// Create product
const handleCreateProduct = async (productData) => {
  try {
    await productAPI.createProduct(productData);
    loadProducts(); // Reload list
    alert('Product created successfully');
  } catch (error) {
    alert(error.response?.data?.error || 'Failed to create product');
  }
};

// Update product
const handleUpdateProduct = async (id, productData) => {
  try {
    await productAPI.updateProduct(id, productData);
    loadProducts();
    alert('Product updated successfully');
  } catch (error) {
    alert(error.response?.data?.error || 'Failed to update product');
  }
};

// Delete product
const handleDeleteProduct = async (id) => {
  if (confirm('Delete this product?')) {
    try {
      await productAPI.deleteProduct(id);
      loadProducts();
      alert('Product deleted successfully');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete product');
    }
  }
};
```

## 🔐 Authentication Flow

1. User logs in → Backend returns JWT token
2. Store token in localStorage
3. Include token in all subsequent requests
4. If token expires (401) → Redirect to login

## 📊 Bill Creation Flow

1. Staff adds items to cart
2. Proceeds to payment
3. Selects payment mode
4. Frontend sends bill data to backend
5. Backend:
   - Validates products
   - Calculates totals
   - Generates unique bill number
   - Saves to database
6. Frontend receives bill number
7. Display success and print bill

## 🚨 Error Handling

```javascript
try {
  const response = await api.someEndpoint();
  // Handle success
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error(error.response.data.error);
    alert(error.response.data.error);
  } else if (error.request) {
    // No response from server
    console.error('No response from server');
    alert('Server is not responding');
  } else {
    // Other errors
    console.error(error.message);
    alert('An error occurred');
  }
}
```

## 🧪 Testing the Integration

1. **Start Backend:** `npm run dev` in backend folder
2. **Start Frontend:** `npm run dev` in frontend folder
3. **Login:** Use admin/admin123 or staff1/staff123
4. **Create Bill:** Add products, proceed to payment
5. **View Bills:** Check bill history
6. **Check Database:** Bills should be in MongoDB

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🔍 Debugging Tips

1. **Check Backend Logs:** Terminal running `npm run dev`
2. **Check Network Tab:** Browser DevTools → Network
3. **Check Console:** Browser DevTools → Console
4. **MongoDB:** Use MongoDB Compass to view data
5. **Test API:** Use Postman or curl to test endpoints

## 🎯 Next Steps

1. ✅ Backend is ready
2. 📝 Update frontend to use API service
3. 🧪 Test all features
4. 🚀 Deploy to production

---

**Backend is production-ready and waiting for frontend integration!**
