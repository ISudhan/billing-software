# Role System Update - STAFF → CASHIER

## Overview
This document details the complete overhaul of the role-based access control system in Senthur Billing Software, changing from ADMIN/STAFF roles to ADMIN/CASHIER roles, along with the implementation of a comprehensive staff payment management system.

## Role Changes Summary

### Previous System
- **ADMIN**: Full access to all features
- **STAFF**: Limited to billing operations only

### New System
- **ADMIN**: Full access + staff payment management
- **CASHIER**: Billing + Product Management (add/edit only, no delete)

## Backend Changes

### 1. User Model (`backend/models/User.js`)
```javascript
// Changed role enum
role: {
  type: String,
  enum: ['ADMIN', 'CASHIER'],  // Previously: ['ADMIN', 'STAFF']
  default: 'CASHIER'
}
```

### 2. Seed Script (`backend/scripts/seed.js`)
**Updated Test Credentials:**
- Username: `cashier1` (previously: staff1)
- Password: `cashier123` (previously: staff123)
- Role: `CASHIER`

**To reseed database:**
```bash
cd backend
npm run seed
```

### 3. Product Routes (`backend/routes/productRoutes.js`)
**Updated Permissions:**
- POST/PUT operations: Allow both `ADMIN` and `CASHIER`
- DELETE operations: `ADMIN` only
- GET operations: All authenticated users

```javascript
// Cashiers can add/edit products
router.post('/', protect, restrictTo('ADMIN', 'CASHIER'), createProduct);
router.put('/:id', protect, restrictTo('ADMIN', 'CASHIER'), updateProduct);

// Only admins can delete
router.delete('/:id', protect, restrictTo('ADMIN'), deleteProduct);
```

### 4. New Staff Payment System

#### StaffPaymentRecord Model (`backend/models/StaffPaymentRecord.js`)
**Features:**
- Work session tracking (date, start/end times)
- Automatic hour calculation (handles overnight shifts)
- Hourly rate and payment tracking
- Multiple payment states: UNPAID, PARTIAL, PAID, ADVANCE
- Advance payment support
- Automatic balance calculations

**Fields:**
```javascript
{
  staff: ObjectId,           // Reference to cashier user
  workDate: Date,
  startTime: String,         // Format: "HH:mm"
  endTime: String,           // Format: "HH:mm"
  hoursWorked: Number,       // Auto-calculated
  hourlyRate: Number,
  totalPayable: Number,      // Auto-calculated
  paidAmount: Number,
  remainingBalance: Number,  // Auto-calculated
  advanceBalance: Number,    // Auto-calculated
  paymentStatus: String,     // UNPAID/PARTIAL/PAID/ADVANCE
  notes: String,
  createdBy: ObjectId
}
```

**Automatic Calculations:**
- Hours worked from time strings
- Handles overnight shifts (e.g., 22:00 to 02:00 = 4 hours)
- Total payable = hours × hourly rate
- Remaining balance = total payable - paid amount
- Payment status based on payment ratio
- Advance tracking for overpayments

#### Staff Payment Controller (`backend/controllers/staffPaymentController.js`)
**9 Endpoints Implemented:**

1. **Create Work Record** - `POST /api/staff-payments`
   - Validates staff is cashier role
   - Creates new work session record
   - Logs audit trail

2. **Get All Work Records** - `GET /api/staff-payments`
   - Filter by staff, date range, payment status
   - Pagination support
   - Populates staff and creator details

3. **Get Single Record** - `GET /api/staff-payments/:id`
   - Detailed record with populated references

4. **Update Work Record** - `PUT /api/staff-payments/:id`
   - Update work details
   - Recalculates totals automatically

5. **Add Payment** - `POST /api/staff-payments/:id/payment`
   - Incremental payment tracking
   - Updates payment status
   - Logs payment audit

6. **Get Staff Summary** - `GET /api/staff-payments/staff/:staffId/summary`
   - Aggregated data for date range
   - Total hours, payable, paid, remaining, advance
   - Performance metrics

7. **Delete Work Record** - `DELETE /api/staff-payments/:id`
   - Soft delete with audit log

8. **Get Payment Statistics** - `GET /api/staff-payments/stats`
   - Global statistics
   - Filter by date range, payment status

#### Staff Payment Routes (`backend/routes/staffPaymentRoutes.js`)
**All routes protected with:**
- `protect` - Authentication required
- `restrictTo('ADMIN')` - Admin-only access

```javascript
POST   /api/staff-payments              // Create work record
GET    /api/staff-payments              // Get all records
GET    /api/staff-payments/stats        // Get statistics
GET    /api/staff-payments/staff/:staffId/summary  // Get staff summary
GET    /api/staff-payments/:id          // Get single record
PUT    /api/staff-payments/:id          // Update record
DELETE /api/staff-payments/:id          // Delete record
POST   /api/staff-payments/:id/payment  // Add payment
```

## Frontend Changes

### 1. AuthContext (`frontend/src/context/AuthContext.jsx`)
```javascript
// Changed role constants
export const ROLES = {
  ADMIN: 'ADMIN',
  CASHIER: 'CASHIER',  // Previously: STAFF: 'STAFF'
};

// Renamed function
const isCashier = () => hasRole(ROLES.CASHIER);  // Previously: isStaff()
```

### 2. Protected Routes (`frontend/src/components/ProtectedRoute.jsx`)
```javascript
// Updated route components
export const CashierRoute = ({ children }) => {
  return <ProtectedRoute allowedRoles={[ROLES.CASHIER]}>{children}</ProtectedRoute>;
};

export const BillingRoute = ({ children }) => {
  // Both Admin and Cashier can access
  return <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CASHIER]}>{children}</ProtectedRoute>;
};
```

### 3. App Routes (`frontend/src/App.jsx`)
**Updated Product Management Route:**
- Changed from `AdminRoute` to `BillingRoute`
- Now accessible by both Admin and Cashier
- Delete functionality restricted in component layer

### 4. Sidebar Navigation (`frontend/src/components/Sidebar.jsx`)
**Cashier Menu Items:**
- Home
- New Bill
- My Bills
- **Product Management** (NEW for cashiers)

**Admin Menu Items:**
- All cashier items +
- Reports
- Settings
- Staff Management (with payment tracking)

### 5. Product Management (`frontend/src/pages/ProductManagement.jsx`)
**Role-Based UI:**
```javascript
// Import auth context
import { useAuth, ROLES } from '../context/AuthContext';

// Hide delete button for cashiers
{user?.role === ROLES.ADMIN && (
  <button onClick={() => handleDelete(product)} style={styles.deleteBtn}>
    <Trash2 size={16} />
    {getText('Delete', language)}
  </button>
)}
```

### 6. Login Page (`frontend/src/pages/Login.jsx`)
**Updated Credentials Display:**
```javascript
<strong>{getText('Cashier', language)}:</strong> cashier1 / cashier123
```

### 7. API Service (`frontend/src/services/api.js`)
**New Staff Payment API:**
```javascript
export const staffPaymentAPI = {
  createWorkRecord: async (data) => {...},
  getWorkRecords: async (params = {}) => {...},
  getWorkRecord: async (id) => {...},
  updateWorkRecord: async (id, data) => {...},
  addPayment: async (id, amount) => {...},
  getStaffSummary: async (staffId, params = {}) => {...},
  deleteWorkRecord: async (id) => {...},
  getPaymentStats: async (params = {}) => {...}
};
```

### 8. Translations (`frontend/src/utils/translations.js`)
**Added Cashier Translation:**
```javascript
'Cashier': 'காசாளர்'
```

## Access Control Matrix

| Feature | Admin | Cashier |
|---------|-------|---------|
| Dashboard | ✅ | ✅ (Limited) |
| Billing/POS | ✅ | ✅ |
| Bill History | ✅ | ✅ (Own bills) |
| Product Management | ✅ (Full) | ✅ (Add/Edit only) |
| Product Add | ✅ | ✅ |
| Product Edit | ✅ | ✅ |
| Product Delete | ✅ | ❌ |
| Product Enable/Disable | ✅ | ✅ |
| Staff Management | ✅ | ❌ |
| Staff Payment Tracking | ✅ | ❌ |
| Reports | ✅ | ❌ |
| Settings | ✅ | ❌ |

## Testing Instructions

### 1. Reseed Database
```bash
cd backend
npm run seed
```

### 2. Start Servers
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Test Admin Account
**Credentials:**
- Username: `admin`
- Password: `admin123`

**Test Cases:**
- ✅ Access all pages
- ✅ Create/edit/delete products
- ✅ Access staff management
- ✅ View reports and settings

### 4. Test Cashier Account
**Credentials:**
- Username: `cashier1`
- Password: `cashier123`

**Test Cases:**
- ✅ Access billing screen
- ✅ Access product management
- ✅ Add new products
- ✅ Edit existing products
- ✅ Enable/disable products
- ❌ Delete button should NOT appear
- ❌ Cannot access staff management page
- ❌ Cannot access reports page
- ❌ Cannot access settings page

### 5. Test Staff Payment System (Admin Only)
1. Login as admin
2. Navigate to Staff Management
3. Create work record for cashier1:
   - Work Date: Today
   - Start Time: 09:00
   - End Time: 17:00
   - Hourly Rate: ₹100
4. Verify automatic calculations:
   - Hours: 8
   - Total Payable: ₹800
5. Add payment: ₹500
6. Check status: PARTIAL
7. Add payment: ₹300
8. Check status: PAID

## API Endpoints Reference

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Users (Admin Only)
```
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

### Products (Cashier + Admin)
```
GET    /api/products          [All authenticated]
GET    /api/products/:id      [All authenticated]
POST   /api/products          [Admin, Cashier]
PUT    /api/products/:id      [Admin, Cashier]
DELETE /api/products/:id      [Admin only]
```

### Bills (All Authenticated)
```
GET    /api/bills
GET    /api/bills/:id
POST   /api/bills
PUT    /api/bills/:id/payment
GET    /api/bills/stats
```

### Staff Payments (Admin Only) - NEW
```
POST   /api/staff-payments              // Create work record
GET    /api/staff-payments              // Get all records
GET    /api/staff-payments/stats        // Get statistics
GET    /api/staff-payments/staff/:staffId/summary
GET    /api/staff-payments/:id
PUT    /api/staff-payments/:id
DELETE /api/staff-payments/:id
POST   /api/staff-payments/:id/payment  // Add payment
```

### Reports (Admin Only)
```
GET /api/reports/sales
GET /api/reports/products
GET /api/reports/staff
```

### Settings (Admin Only)
```
GET /api/settings
PUT /api/settings
```

## Database Schema Updates

### Users Collection
```javascript
{
  username: String,
  password: String,  // bcrypt hashed
  name: String,
  role: 'ADMIN' | 'CASHIER',  // Changed from STAFF
  enabled: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### StaffPaymentRecords Collection (NEW)
```javascript
{
  staff: ObjectId,              // ref: 'User'
  workDate: Date,
  startTime: String,            // "HH:mm"
  endTime: String,              // "HH:mm"
  hoursWorked: Number,
  hourlyRate: Number,
  totalPayable: Number,
  paidAmount: Number,
  remainingBalance: Number,
  advanceBalance: Number,
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'ADVANCE',
  notes: String,
  createdBy: ObjectId,          // ref: 'User'
  createdAt: Date,
  updatedAt: Date
}
```

## Migration Guide

### For Existing Databases

1. **Backup your database:**
```bash
mongodump --db senthur-billing --out backup/
```

2. **Update existing staff users:**
```javascript
db.users.updateMany(
  { role: 'STAFF' },
  { $set: { role: 'CASHIER' } }
)
```

3. **Verify update:**
```javascript
db.users.find({ role: 'CASHIER' }).count()
```

4. **Or simply reseed:**
```bash
cd backend
npm run seed
```

## Environment Variables

Ensure `.env` file in backend directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/senthur-billing
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

## Security Notes

1. **Password Hashing**: All passwords bcrypt hashed with 12 salt rounds
2. **JWT Authentication**: 7-day expiration, secure tokens
3. **Role Verification**: Server-side role checks on all protected routes
4. **Audit Logging**: All staff payment operations logged
5. **Input Validation**: express-validator on all endpoints
6. **Rate Limiting**: Applied to sensitive routes
7. **CORS**: Configured for frontend origin only

## Future Enhancements

### Planned Features:
1. **Staff Payment UI** in StaffManagement.jsx
   - Work record form with date/time pickers
   - Payment history table
   - Summary cards with totals
   - Quick payment entry
   - Export to PDF/Excel

2. **Advanced Reporting**
   - Staff performance analytics
   - Payment trends
   - Overtime calculations
   - Leave tracking

3. **Mobile Responsive UI**
   - Better mobile experience for POS
   - Touch-friendly product selection
   - Mobile payment interface

4. **Notifications**
   - Payment due alerts
   - Low stock notifications
   - End of shift summaries

## Troubleshooting

### Issue: Can't login with cashier1
**Solution:** Reseed the database
```bash
cd backend && npm run seed
```

### Issue: Delete button still showing for cashiers
**Solution:** Clear browser cache and refresh

### Issue: Port 5000 already in use
**Solution:**
```bash
lsof -ti:5000 | xargs kill -9
```

### Issue: MongoDB connection error
**Solution:** Ensure MongoDB is running
```bash
sudo systemctl start mongod
```

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in terminal
3. Check browser console for frontend errors
4. Verify MongoDB is running
5. Confirm environment variables are set

## Changelog

### Version 2.0.0 - Role System Update
**Date:** [Current Date]

**Breaking Changes:**
- Changed STAFF role to CASHIER
- Updated all role references in frontend and backend
- Modified access control permissions

**New Features:**
- Staff payment management system
- Automatic hour and payment calculations
- Advance payment support
- Payment status tracking
- Cashiers can now manage products (add/edit)

**Improvements:**
- Better separation of concerns between roles
- Enhanced audit logging
- More granular permission controls
- Improved user experience for cashiers

**Migration Required:** Yes - See Migration Guide above

---

**System Status:** ✅ Fully Operational
**Backend:** Running on http://localhost:5000
**Frontend:** Running on http://localhost:3001
**Database:** MongoDB connected
