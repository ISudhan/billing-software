# Senthur Billing Software - Frontend

A comprehensive role-based billing system with strict access control for Admin and Staff roles.

## 🎯 Features

### Role-Based Access Control

#### Admin Role - Full System Access
- ✅ Complete billing operations
- ✅ Product management (add, edit, enable/disable, delete)
- ✅ View all bills from all staff
- ✅ Reports & analytics
- ✅ Settings & configuration
- ✅ Staff management (future)
- ✅ Cancel bills with reason logging
- ✅ Mark bills as paid/unpaid

#### Staff Role - Billing Operations Only
- ✅ Create new bills
- ✅ Select products and quantities
- ✅ Apply discounts (if enabled)
- ✅ Choose payment mode (Cash/Card/UPI)
- ✅ Generate QR for UPI payments
- ✅ Print bills
- ✅ View only their own bills
- ✅ Reprint their own bills
- ❌ Cannot edit product prices
- ❌ Cannot access product management
- ❌ Cannot see reports
- ❌ Cannot change settings
- ❌ Cannot see other staff's bills

### Security Features
- 🔒 Role-based authentication
- 🔒 Protected routes at logic level
- 🔒 UI elements hidden based on role
- 🔒 Direct URL access blocked for unauthorized roles
- 🔒 No role switching during session
- 🔒 Action logging for admin operations

### Billing Features
- 📱 Product selection with categories
- 🔍 Product search (English & Tamil)
- 🛒 Real-time cart management
- 💰 Multiple payment modes (Cash, Card, UPI)
- 📱 QR code generation for UPI
- 🖨️ Thermal printer support (58mm/80mm)
- 🇮🇳 Bilingual support (English & Tamil)
- 💾 Bill data protection (no data loss)
- ♻️ Print retry mechanism
- 📄 Bill reprinting

### Admin Features
- 📦 Product Management
  - Add new products
  - Edit product details (English & Tamil names)
  - Edit prices
  - Enable/disable products
  - Delete products
  - Category management
- 📊 Reports & Analytics
  - Daily/date-range sales summary
  - Payment method breakdown
  - Item-wise sales (Tamil names)
  - Category-wise sales
  - Staff-wise billing summary
- ⚙️ Settings & Configuration
  - Shop information
  - Enable/disable features (discounts, extra charges, round-off)
  - Default payment mode
  - Language priority
  - Printer width configuration
  - Auto backup settings

### Data Protection
- 💾 Session storage for bill data
- 🔄 Auto-recovery on print failure
- ✅ Confirmation dialogs for critical actions
- 🚫 No silent data modifications
- 📝 Change logging for admin actions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

### Demo Credentials

**Admin:**
- Username: `admin`
- Password: `admin123`

**Staff:**
- Username: `staff1`
- Password: `staff123`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.jsx           # Main layout with sidebar
│   │   ├── Sidebar.jsx          # Role-based navigation
│   │   └── ProtectedRoute.jsx   # Route guards
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication & role management
│   ├── pages/
│   │   ├── Login.jsx            # Login page
│   │   ├── Home.jsx             # Dashboard/Home
│   │   ├── BillingScreen.jsx   # Main billing interface
│   │   ├── PaymentScreen.jsx   # Payment & printing
│   │   ├── BillHistory.jsx     # Bill history (role-filtered)
│   │   ├── ProductManagement.jsx # Admin: Product CRUD
│   │   ├── Reports.jsx          # Admin: Analytics
│   │   ├── Settings.jsx         # Admin: Configuration
│   │   └── Unauthorized.jsx     # Access denied page
│   ├── App.jsx                  # Main app with routing
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── package.json
├── vite.config.js
└── README.md
```

## 🔐 Role-Based Features Matrix

| Feature | Admin | Staff |
|---------|-------|-------|
| Login | ✅ | ✅ |
| Create Bills | ✅ | ✅ |
| View Own Bills | ✅ | ✅ |
| View All Bills | ✅ | ❌ |
| Reprint Bills | ✅ | ✅ (own only) |
| Cancel Bills | ✅ | ❌ |
| Product Management | ✅ | ❌ |
| Reports & Analytics | ✅ | ❌ |
| Settings | ✅ | ❌ |
| Staff Management | ✅ | ❌ |

## 🛠️ Technology Stack

- **Framework:** React 18
- **Routing:** React Router v6
- **Build Tool:** Vite
- **Icons:** Lucide React
- **QR Code:** qrcode.react
- **State Management:** React Context API
- **Styling:** Inline styles (no external CSS framework)

## 📱 Responsive Design

- Desktop-first design
- Optimized for 1024px+ screens
- Thermal printer support (58mm/80mm)
- Print-specific styles

## 🔄 Data Flow

1. **Login:** User authenticates → Role assigned → Stored in context & localStorage
2. **Billing:** Product selection → Cart → Payment → Bill creation → Print
3. **History:** Filter by role → Display bills → View/Print
4. **Admin:** CRUD operations → Confirmation → Logging → Update

## 🚨 Error Handling

- Print failure: Retry option without data loss
- Payment failure: Retry without bill reset
- Form validation: Client-side checks
- Confirmation dialogs: For destructive actions
- Session persistence: Bill data saved in sessionStorage

## 🔒 Security Considerations

1. **Route Protection:** Both UI and logic level
2. **Role Validation:** Server-side validation required in production
3. **Action Logging:** All admin actions logged
4. **No Role Switching:** Session-based role enforcement
5. **Data Isolation:** Staff can only see their own bills

## 🎨 UI/UX Features

- Clean, intuitive interface
- Role-appropriate menus
- Bilingual product names
- Real-time cart updates
- Visual feedback for actions
- Keyboard-friendly inputs
- Print-optimized layouts

## 📝 Production Checklist

- [ ] Replace mock authentication with real API
- [ ] Implement backend API integration
- [ ] Add proper error boundaries
- [ ] Implement data persistence
- [ ] Add form validation library
- [ ] Setup environment variables
- [ ] Configure CORS and security headers
- [ ] Add loading states for API calls
- [ ] Implement proper logging system
- [ ] Add backup and restore functionality
- [ ] Setup automated tests
- [ ] Configure production build optimization

## 🤝 Contributing

This is a custom billing solution. For modifications:
1. Test thoroughly with both roles
2. Ensure role-based access is maintained
3. Validate all user inputs
4. Add confirmation for destructive actions
5. Log admin actions appropriately

## 📄 License

Proprietary - All rights reserved

## 🐛 Known Issues / Future Enhancements

- [ ] Staff management interface
- [ ] Advanced reporting with charts
- [ ] Export reports to PDF/Excel
- [ ] Barcode scanner integration
- [ ] Inventory management
- [ ] Customer management
- [ ] Email/SMS bill sending
- [ ] Multi-currency support
- [ ] Tax calculations (GST)
- [ ] Discount management interface

## 📞 Support

For issues or questions, please contact the development team.

---

**Note:** This is a production-ready frontend that requires a backend API for full functionality. All data operations currently use mock data and need to be connected to a real backend with proper authentication, authorization, and data persistence.
