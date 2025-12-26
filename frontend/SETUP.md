# Quick Setup Guide

## Installation & Running

1. **Install Dependencies**
   ```bash
   cd /home/sudhann/workspace/senthur-billing-software/frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The application will start at `http://localhost:3000`

3. **Login with Demo Credentials**
   
   **Admin Access:**
   - Username: `admin`
   - Password: `admin123`
   
   **Staff Access:**
   - Username: `staff1`
   - Password: `staff123`

## Role-Based Access Summary

### 🔴 ADMIN - Full Control
- Dashboard with sales statistics
- Complete billing operations
- View all bills from all staff members
- Product management (add/edit/delete/enable/disable)
- Reports & analytics (sales, payments, categories, staff)
- Settings & configuration
- Staff management (future feature)

### 🟢 STAFF - Billing Only
- Simplified home screen
- Create new bills
- View only their own bills
- Reprint their own bills
- No access to:
  - Product management
  - Reports
  - Settings
  - Other staff's bills

## Key Features

### ✅ Security & Access Control
- Role determined at login (no switching)
- UI elements hidden based on role
- Routes protected at logic level
- Direct URL access blocked for unauthorized routes

### ✅ Billing Features
- Product search (English & Tamil)
- Category filtering
- Real-time cart management
- Multiple payment modes (Cash/Card/UPI)
- QR code for UPI payments
- Thermal printer support
- Bilingual support

### ✅ Data Protection
- Bill data saved to prevent loss
- Print retry on failure
- Payment retry on failure
- Confirmation dialogs for critical actions
- No silent modifications to past bills

### ✅ Admin Controls
- Product CRUD operations
- Detailed reports and analytics
- System configuration
- All changes logged
- Settings apply only to new bills

## Testing the Role System

### Test Staff Role:
1. Login as `staff1`
2. Navigate to sidebar - should only see:
   - Home
   - New Bill
   - My Bills
3. Try accessing `/products` directly - should redirect to Unauthorized
4. Create a bill - should work
5. View bill history - should only see own bills

### Test Admin Role:
1. Login as `admin`
2. Navigate to sidebar - should see all options:
   - Dashboard
   - Billing
   - All Bills
   - Products
   - Reports
   - Staff Management
   - Settings
3. All pages should be accessible
4. Bill history shows all bills from all staff

## Production Notes

⚠️ **Important:** This is a frontend-only implementation with mock data.

For production deployment, you need to:

1. **Backend API Integration**
   - Replace mock authentication in `AuthContext.jsx`
   - Connect all data operations to real API
   - Implement proper session management

2. **Security**
   - Server-side role validation
   - JWT or session-based auth
   - HTTPS only in production
   - CSRF protection
   - XSS protection

3. **Database**
   - Store users, products, bills
   - Transaction support for billing
   - Audit logs for admin actions

4. **Additional Features**
   - Real printer integration
   - Backup/restore functionality
   - Email/SMS notifications
   - Inventory management
   - GST calculations

## File Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   ├── context/           # Auth & state management
│   ├── pages/             # All page components
│   ├── App.jsx            # Main app with routing
│   └── main.jsx           # Entry point
├── package.json
├── vite.config.js
├── index.html
└── README.md
```

## Troubleshooting

**Port already in use:**
```bash
# Change port in vite.config.js or kill the process using port 3000
```

**Dependencies not installing:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build errors:**
```bash
npm run build
# Check console for specific errors
```

## Next Steps

1. ✅ Frontend is complete and functional
2. 📋 Design and implement backend API
3. 📋 Setup database schema
4. 📋 Connect frontend to backend
5. 📋 Add real authentication
6. 📋 Deploy to production

---

**Enjoy your role-based billing system! 🎉**
