# Backend API Integration Guide

This document outlines the API endpoints needed to connect the frontend to a backend server.

## 🔧 API Base Configuration

Update `vite.config.js` proxy or create an API client:

```javascript
// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
```

## 📝 Required API Endpoints

### 1. Authentication

#### POST `/api/auth/login`
**Purpose:** Authenticate user and return role

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "number",
    "username": "string",
    "name": "string",
    "role": "ADMIN" | "STAFF",
    "token": "string"
  }
}
```

**Integration Point:** `src/context/AuthContext.jsx` - `login()` function

---

#### POST `/api/auth/logout`
**Purpose:** Invalidate session/token

**Request:**
```json
{
  "userId": "number"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Integration Point:** `src/context/AuthContext.jsx` - `logout()` function

---

### 2. Products

#### GET `/api/products`
**Purpose:** Get all enabled products for billing

**Query Params:**
- `enabled`: boolean (optional, default: true)
- `category`: string (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "name": "string",
      "nameTamil": "string",
      "price": "number",
      "category": "string",
      "enabled": "boolean",
      "imageUrl": "string" (optional)
    }
  ]
}
```

**Integration Point:** `src/pages/BillingScreen.jsx` - `useEffect()` loadProducts

---

#### GET `/api/products/all` (ADMIN ONLY)
**Purpose:** Get all products including disabled ones

**Response:**
```json
{
  "success": true,
  "data": [/* array of products */]
}
```

**Integration Point:** `src/pages/ProductManagement.jsx` - `loadProducts()`

---

#### POST `/api/products` (ADMIN ONLY)
**Purpose:** Create new product

**Request:**
```json
{
  "name": "string",
  "nameTamil": "string",
  "price": "number",
  "category": "string",
  "enabled": "boolean"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "number",
    /* ... product details */
  }
}
```

**Integration Point:** `src/pages/ProductManagement.jsx` - `handleSaveNew()`

---

#### PUT `/api/products/:id` (ADMIN ONLY)
**Purpose:** Update product details

**Request:**
```json
{
  "name": "string",
  "nameTamil": "string",
  "price": "number",
  "category": "string",
  "enabled": "boolean"
}
```

**Response:**
```json
{
  "success": true,
  "data": {/* updated product */}
}
```

**Integration Point:** `src/pages/ProductManagement.jsx` - `handleSave()`

---

#### DELETE `/api/products/:id` (ADMIN ONLY)
**Purpose:** Delete product (soft delete recommended)

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Integration Point:** `src/pages/ProductManagement.jsx` - `handleDelete()`

---

### 3. Bills

#### POST `/api/bills`
**Purpose:** Create new bill

**Request:**
```json
{
  "items": [
    {
      "productId": "number",
      "name": "string",
      "nameTamil": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "total": "number",
  "paymentMode": "CASH" | "CARD" | "UPI",
  "discount": "number" (optional),
  "extraCharges": "number" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "number",
    "billNumber": "string",
    "items": [/* array */],
    "total": "number",
    "paymentMode": "string",
    "createdBy": "number",
    "createdByName": "string",
    "createdAt": "ISO8601 datetime",
    "status": "PAID"
  }
}
```

**Integration Point:** `src/pages/PaymentScreen.jsx` - `handlePaymentConfirm()`

---

#### GET `/api/bills`
**Purpose:** Get bills (filtered by role)

**Query Params:**
- `date`: string (optional, format: YYYY-MM-DD)
- `dateFrom`: string (optional)
- `dateTo`: string (optional)
- `staffId`: number (optional, ADMIN only)
- `status`: string (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "billNumber": "string",
      "items": [/* array */],
      "total": "number",
      "paymentMode": "string",
      "createdBy": "number",
      "createdByName": "string",
      "createdAt": "ISO8601 datetime",
      "status": "string"
    }
  ]
}
```

**Notes:**
- For STAFF role: Backend should automatically filter to only bills created by the requesting user
- For ADMIN role: Returns all bills

**Integration Point:** `src/pages/BillHistory.jsx` - `loadBills()`

---

#### GET `/api/bills/:id`
**Purpose:** Get single bill details

**Response:**
```json
{
  "success": true,
  "data": {/* full bill details */}
}
```

**Integration Point:** `src/pages/BillHistory.jsx` - Bill detail modal

---

#### PUT `/api/bills/:id/cancel` (ADMIN ONLY)
**Purpose:** Cancel a bill with reason

**Request:**
```json
{
  "reason": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {/* updated bill with status CANCELLED */}
}
```

**Integration Point:** Future feature in Bill History

---

### 4. Reports (ADMIN ONLY)

#### GET `/api/reports/summary`
**Purpose:** Get sales summary

**Query Params:**
- `dateFrom`: string (required)
- `dateTo`: string (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSales": "number",
    "totalBills": "number",
    "averageBillValue": "number",
    "totalItems": "number"
  }
}
```

**Integration Point:** `src/pages/Reports.jsx` - Summary cards

---

#### GET `/api/reports/payment-breakdown`
**Purpose:** Get payment method breakdown

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "mode": "CASH" | "CARD" | "UPI",
      "count": "number",
      "amount": "number"
    }
  ]
}
```

**Integration Point:** `src/pages/Reports.jsx` - Payment breakdown table

---

#### GET `/api/reports/top-products`
**Purpose:** Get top selling products

**Query Params:**
- `limit`: number (optional, default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "productId": "number",
      "name": "string",
      "nameTamil": "string",
      "quantity": "number",
      "revenue": "number"
    }
  ]
}
```

**Integration Point:** `src/pages/Reports.jsx` - Top products table

---

#### GET `/api/reports/category-wise`
**Purpose:** Get category-wise sales

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category": "string",
      "sales": "number",
      "percentage": "number"
    }
  ]
}
```

**Integration Point:** `src/pages/Reports.jsx` - Category breakdown

---

#### GET `/api/reports/staff-wise` (ADMIN ONLY)
**Purpose:** Get staff-wise billing summary

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "staffId": "number",
      "name": "string",
      "bills": "number",
      "revenue": "number"
    }
  ]
}
```

**Integration Point:** `src/pages/Reports.jsx` - Staff summary table

---

### 5. Settings (ADMIN ONLY)

#### GET `/api/settings`
**Purpose:** Get current settings

**Response:**
```json
{
  "success": true,
  "data": {
    "shopName": "string",
    "shopAddress1": "string",
    "shopAddress2": "string",
    "phone": "string",
    "email": "string",
    "gstNumber": "string",
    "enableDiscounts": "boolean",
    "maxDiscountPercent": "number",
    "enableExtraCharges": "boolean",
    "enableRoundOff": "boolean",
    "defaultPaymentMode": "string",
    "languagePriority": "string",
    "printerWidth": "string",
    "showProductImages": "boolean",
    "autoBackup": "boolean"
  }
}
```

**Integration Point:** `src/pages/Settings.jsx` - `useState()` initial load

---

#### PUT `/api/settings`
**Purpose:** Update settings

**Request:**
```json
{
  /* same structure as GET response */
}
```

**Response:**
```json
{
  "success": true,
  "data": {/* updated settings */}
}
```

**Integration Point:** `src/pages/Settings.jsx` - `handleSave()`

---

### 6. Staff Management (ADMIN ONLY - Future)

#### GET `/api/staff`
**Purpose:** Get all staff members

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "username": "string",
      "name": "string",
      "role": "STAFF",
      "enabled": "boolean",
      "createdAt": "ISO8601 datetime"
    }
  ]
}
```

---

#### POST `/api/staff`
**Purpose:** Create new staff member

**Request:**
```json
{
  "username": "string",
  "name": "string",
  "password": "string"
}
```

---

### 7. Audit Logs (ADMIN ONLY - Future)

#### GET `/api/logs`
**Purpose:** Get audit logs

**Query Params:**
- `userId`: number (optional)
- `action`: string (optional)
- `dateFrom`: string (optional)
- `dateTo`: string (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "userId": "number",
      "username": "string",
      "action": "string",
      "details": "string",
      "timestamp": "ISO8601 datetime"
    }
  ]
}
```

---

## 🔒 Security Requirements

### Authentication
- Use JWT tokens or session-based auth
- Token should include user ID and role
- Tokens should expire (recommend 8-12 hours)
- Implement refresh token mechanism

### Authorization
- **CRITICAL:** Always validate role on backend
- Never trust frontend role checks alone
- Implement middleware for role checking
- Log all admin actions

### Example Middleware (Express.js):
```javascript
// authMiddleware.js
const authMiddleware = (req, res, next) => {
  // Verify token and attach user to request
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Usage:
app.get('/api/products/all', authMiddleware, adminOnly, getProducts);
app.post('/api/products', authMiddleware, adminOnly, createProduct);
```

---

## 📊 Database Schema Suggestions

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'STAFF')),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_tamil VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bills Table
```sql
CREATE TABLE bills (
  id SERIAL PRIMARY KEY,
  bill_number VARCHAR(50) UNIQUE NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  payment_mode VARCHAR(20) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  extra_charges DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'PAID',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancel_reason TEXT
);
```

### Bill Items Table
```sql
CREATE TABLE bill_items (
  id SERIAL PRIMARY KEY,
  bill_id INTEGER REFERENCES bills(id),
  product_id INTEGER REFERENCES products(id),
  product_name VARCHAR(100) NOT NULL,
  product_name_tamil VARCHAR(100),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL
);
```

### Settings Table
```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_by INTEGER REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Integration Steps

1. **Setup Backend Project**
   - Choose framework (Express.js, Django, etc.)
   - Setup database connection
   - Create models/schemas

2. **Implement Authentication**
   - Create login endpoint
   - Implement JWT or session auth
   - Add auth middleware

3. **Implement Authorization**
   - Create role-checking middleware
   - Apply to protected routes
   - Test with both roles

4. **Create API Endpoints**
   - Follow the endpoint specifications above
   - Add validation and error handling
   - Implement business logic

5. **Update Frontend**
   - Replace mock functions with API calls
   - Add loading states
   - Handle errors properly
   - Test all features

6. **Testing**
   - Test all endpoints with both roles
   - Test error scenarios
   - Test edge cases
   - Load testing

7. **Deploy**
   - Setup production environment
   - Configure CORS properly
   - Enable HTTPS
   - Setup monitoring

---

## 📝 Example Integration in Frontend

```javascript
// src/context/AuthContext.jsx - Updated login function
const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', {
      username,
      password,
    });
    
    const userData = response.data.data;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Login failed'
    };
  }
};
```

```javascript
// src/pages/BillingScreen.jsx - Updated loadProducts
useEffect(() => {
  const loadProducts = async () => {
    try {
      const response = await api.get('/products', {
        params: { enabled: true }
      });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Failed to load products:', error);
      alert('Failed to load products');
    }
  };
  
  loadProducts();
}, []);
```

---

## ⚠️ Important Notes

1. **Never trust frontend validation** - Always validate on backend
2. **Always check user role on backend** - Frontend checks are for UX only
3. **Log admin actions** - Important for audit trail
4. **Use transactions** - For bill creation and inventory updates
5. **Handle errors gracefully** - Return meaningful error messages
6. **Rate limiting** - Prevent abuse
7. **Data backup** - Regular automated backups
8. **API versioning** - Use `/api/v1/` for future compatibility

---

This completes the API integration guide. Follow these specifications to connect your frontend to a backend server.
