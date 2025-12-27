# Quick Reference - Backend API

## 🚀 Server Info
- **Base URL:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/health`

## 🔐 Authentication

### Login
```bash
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

Returns: `{ success: true, token: "jwt-token", user: {...} }`

### Use Token in Requests
```bash
Authorization: Bearer <your-jwt-token>
```

## 📦 Products API

```bash
GET  /api/products              # List all products
GET  /api/products/:id          # Get single product
POST /api/products              # Create (Admin)
PUT  /api/products/:id          # Update (Admin)
DELETE /api/products/:id        # Soft delete (Admin)
```

## 🧾 Bills API

```bash
POST /api/bills                 # Create bill
{
  "items": [
    { "productId": "...", "quantity": 2 }
  ],
  "paymentMode": "CASH"
}

GET /api/bills                  # List bills
GET /api/bills/:id              # Get bill by ID
GET /api/bills/number/:number   # Get by bill number
PUT /api/bills/:id/void         # Void bill (Admin)
```

## 👥 Users API (Admin Only)

```bash
GET  /api/users                 # List users
POST /api/users                 # Create user
PUT  /api/users/:id             # Update user
DELETE /api/users/:id           # Deactivate user
```

## 📊 Reports API (Admin Only)

```bash
GET /api/reports/daily                      # Daily sales
GET /api/reports/date-range?startDate=...   # Range report
GET /api/reports/staff                      # Staff performance
GET /api/reports/top-products               # Best sellers
```

## ⚙️ Settings API

```bash
GET /api/settings               # Get settings
PUT /api/settings               # Update (Admin)
```

## 🔑 Default Credentials

**Admin:**
- Username: `admin`
- Password: `admin123`

**Staff:**
- Username: `staff1`
- Password: `staff123`

## 📋 Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🚨 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## 📝 Quick Test

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Save the token from response, then:

# 2. Get Products
curl http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Create Bill
curl -X POST http://localhost:5000/api/bills \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "PRODUCT_ID", "quantity": 2}],
    "paymentMode": "CASH"
  }'
```

## 🛠️ Management Commands

```bash
cd backend
npm run dev         # Start development server
npm run seed        # Reset & seed database
npm start           # Production server
```

---

**Full Documentation:** See `backend/README.md`
