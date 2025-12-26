# 🎯 Quick Reference Card

## Login Credentials

### Admin (Full Access)
```
Username: admin
Password: admin123
```

### Staff (Billing Only)
```
Username: staff1
Password: staff123
```

## Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Opens at: http://localhost:3000

# Build for production
npm run build

# Preview production build
npm run preview
```

## File Structure Quick Reference

```
src/
├── context/AuthContext.jsx       # Role & auth management
├── components/
│   ├── Layout.jsx                # Main layout wrapper
│   ├── Sidebar.jsx               # Role-based navigation
│   └── ProtectedRoute.jsx        # Route guards
├── pages/
│   ├── Login.jsx                 # Login screen
│   ├── Home.jsx                  # Dashboard
│   ├── BillingScreen.jsx         # Create new bill
│   ├── PaymentScreen.jsx         # Payment & print
│   ├── BillHistory.jsx           # View bills (role-filtered)
│   ├── ProductManagement.jsx     # ADMIN: Manage products
│   ├── Reports.jsx               # ADMIN: Analytics
│   ├── Settings.jsx              # ADMIN: Configuration
│   └── Unauthorized.jsx          # Access denied
└── App.jsx                       # Main app with routing
```

## Role Access Quick Reference

| Screen | URL | Admin | Staff |
|--------|-----|-------|-------|
| Login | `/login` | ✅ | ✅ |
| Home | `/` | ✅ | ✅ |
| Billing | `/billing` | ✅ | ✅ |
| Payment | `/payment` | ✅ | ✅ |
| Bill History | `/bill-history` | ✅ (all) | ✅ (own) |
| Products | `/products` | ✅ | ❌ |
| Reports | `/reports` | ✅ | ❌ |
| Settings | `/settings` | ✅ | ❌ |
| Staff Mgmt | `/staff` | ✅ | ❌ |

## Key Features Quick Access

### For Testing Staff Role:
1. Login as `staff1`
2. Try accessing `/products` → Should see Unauthorized
3. Create a bill → Should work
4. View history → Should only see own bills

### For Testing Admin Role:
1. Login as `admin`
2. Access all pages → Should work
3. View bill history → Should see all bills
4. Manage products → Should work
5. View reports → Should work
6. Change settings → Should work

## Important Files to Read

1. **README.md** - Full project overview
2. **SETUP.md** - Installation & testing guide
3. **ARCHITECTURE.md** - System design & diagrams
4. **API_INTEGRATION.md** - Backend integration specs
5. **PROJECT_SUMMARY.md** - What was built

## Key Code Locations

### Authentication:
- `src/context/AuthContext.jsx` - Lines 1-100
  - `login()` - Mock login (replace with API)
  - `logout()` - Clear session
  - `hasRole()` - Check user role

### Route Protection:
- `src/components/ProtectedRoute.jsx` - Lines 1-50
  - `ProtectedRoute` - Check auth
  - `AdminRoute` - Admin only
  - `StaffRoute` - Staff only

### Role-Based Menu:
- `src/components/Sidebar.jsx` - Lines 20-80
  - `staffMenuItems` - Staff menu
  - `adminMenuItems` - Admin menu

## Mock Data Locations (Replace with API)

1. **Products**: `BillingScreen.jsx` line ~20
2. **Bills**: `BillHistory.jsx` line ~20
3. **Reports**: `Reports.jsx` line ~10
4. **Settings**: `Settings.jsx` line ~10
5. **Users**: `AuthContext.jsx` line ~60

## Common Customizations

### Change Port:
```js
// vite.config.js
server: {
  port: 3000, // Change this
}
```

### Add New Admin Page:
1. Create page in `src/pages/NewPage.jsx`
2. Add route in `src/App.jsx` wrapped with `<AdminRoute>`
3. Add menu item in `src/components/Sidebar.jsx` (adminMenuItems)

### Add New Staff Page:
1. Create page in `src/pages/NewPage.jsx`
2. Add route in `src/App.jsx` wrapped with `<ProtectedRoute>`
3. Add menu item in `src/components/Sidebar.jsx` (staffMenuItems)

## Troubleshooting

### "Cannot find module..."
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```bash
lsof -ti:3000 | xargs kill -9
# Or change port in vite.config.js
```

### Build errors
```bash
npm run build
# Check console for errors
```

### Role not working
- Check localStorage: `localStorage.getItem('user')`
- Clear: `localStorage.clear()` then re-login

## Production Checklist

- [ ] Replace all mock data with API calls
- [ ] Add real authentication endpoint
- [ ] Setup environment variables
- [ ] Configure CORS
- [ ] Enable HTTPS
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Test both roles thoroughly
- [ ] Setup backend API
- [ ] Deploy frontend
- [ ] Connect to database

## Support

Check these files for detailed information:
- Setup issues → SETUP.md
- Feature questions → README.md
- Architecture questions → ARCHITECTURE.md
- Backend integration → API_INTEGRATION.md

---

**Quick Start:** `npm install && npm run dev` then login as admin/admin123 or staff1/staff123

**Status:** ✅ Frontend Complete - Ready for Backend Integration
