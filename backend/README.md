# Senthur Billing - Backend API

Production-ready backend for high-speed cafe billing system built with Node.js, Express, and MongoDB.

## 🚀 Features

- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Admin and Staff roles with different permissions
- **High Performance** - Optimized MongoDB queries with proper indexing
- **Bill Management** - Immutable bills with collision-proof numbering
- **Product Management** - Bilingual support (English + Tamil)
- **Comprehensive Reports** - Daily sales, staff performance, top products
- **Audit Logging** - Track all admin actions
- **Rate Limiting** - Protection against brute force attacks
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Centralized error handling with proper error messages

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🛠️ Installation

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your settings:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Strong secret key for JWT tokens
   - Other settings as needed

3. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```
   
   This will create:
   - Admin user (username: `admin`, password: `admin123`)
   - Staff user (username: `staff1`, password: `staff123`)
   - Sample products

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

Server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── config/
│   ├── config.js           # Environment configuration
│   └── database.js         # MongoDB connection
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── userController.js   # User management
│   ├── productController.js # Product management
│   ├── billController.js   # Billing logic
│   ├── reportController.js # Reports and analytics
│   └── settingsController.js # Shop settings
├── middleware/
│   ├── auth.js             # JWT verification & role checks
│   ├── errorHandler.js     # Global error handling
│   └── validator.js        # Request validation rules
├── models/
│   ├── User.js             # User schema
│   ├── Product.js          # Product schema
│   ├── Bill.js             # Bill schema
│   ├── AuditLog.js         # Audit log schema
│   └── Settings.js         # Settings schema
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   ├── userRoutes.js       # User endpoints
│   ├── productRoutes.js    # Product endpoints
│   ├── billRoutes.js       # Bill endpoints
│   ├── reportRoutes.js     # Report endpoints
│   └── settingsRoutes.js   # Settings endpoints
├── scripts/
│   └── seed.js             # Database seeding script
├── utils/
│   ├── AppError.js         # Custom error class
│   ├── jwt.js              # JWT utilities
│   └── auditLogger.js      # Audit logging utility
├── .env                    # Environment variables
├── .env.example            # Example environment variables
├── server.js               # Application entry point
└── package.json            # Dependencies and scripts
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/categories` - Get all categories
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Soft delete product (Admin only)

### Bills
- `GET /api/bills` - Get all bills (filtered by role)
- `GET /api/bills/:id` - Get bill by ID
- `GET /api/bills/number/:billNumber` - Get bill by bill number
- `POST /api/bills` - Create and finalize bill
- `PUT /api/bills/:id/void` - Void bill (Admin only)

### Reports (Admin only)
- `GET /api/reports/daily` - Daily sales summary
- `GET /api/reports/date-range` - Date range sales report
- `GET /api/reports/staff` - Staff-wise sales summary
- `GET /api/reports/top-products` - Top-selling products

### Settings
- `GET /api/settings` - Get shop settings
- `PUT /api/settings` - Update settings (Admin only)

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login Example
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "admin",
    "name": "Administrator",
    "role": "ADMIN"
  }
}
```

## 🧪 Testing API

### Create a Bill
```bash
curl -X POST http://localhost:5000/api/bills \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"productId": "...", "quantity": 2},
      {"productId": "...", "quantity": 1}
    ],
    "paymentMode": "CASH"
  }'
```

### Get Daily Sales Report
```bash
curl -X GET "http://localhost:5000/api/reports/daily?date=2025-12-27" \
  -H "Authorization: Bearer <token>"
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevent brute force attacks
- **Input Validation** - Comprehensive validation on all inputs
- **CORS Configuration** - Configurable CORS settings
- **Helmet** - Security headers
- **Role-Based Access** - Strict permission enforcement

## 📊 Performance Optimizations

- **MongoDB Indexing** - Proper indexes on frequently queried fields
- **Lean Queries** - Use `.lean()` for read-only operations
- **Aggregation Pipeline** - Efficient reporting queries
- **Connection Pooling** - MongoDB connection optimization
- **Compression** - Response compression middleware
- **Atomic Operations** - Bill numbering with atomic counters

## 🔄 Connecting to Frontend

Update frontend API base URL to point to this backend:

```javascript
// In frontend config
const API_BASE_URL = 'http://localhost:5000/api';
```

CORS is already configured to accept requests from:
- `http://localhost:3000` (Create React App)
- `http://localhost:5173` (Vite)

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/senthur_billing` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | Token expiration time | `7d` |
| `ADMIN_USERNAME` | Default admin username | `admin` |
| `ADMIN_PASSWORD` | Default admin password | `admin123` |

## 🚨 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## 📈 Monitoring

Check server health:
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-27T10:30:00.000Z"
}
```

## 🛡️ Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production MongoDB URI
4. Enable HTTPS
5. Set up proper CORS origins
6. Configure firewall rules
7. Set up MongoDB backups
8. Use process manager (PM2)

## 📞 Support

For issues or questions, please check the documentation or contact the development team.

---

**Built with ❤️ for high-speed cafe billing**
