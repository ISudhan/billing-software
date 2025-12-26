# System Architecture & Role-Based Access Control

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                      React + Vite                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Layer                      │
│                      (AuthContext)                           │
│  • Login validation                                          │
│  • Role detection (ADMIN / STAFF)                           │
│  • Session management                                        │
│  • Action logging                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐
        │   ADMIN ROLE     │  │   STAFF ROLE     │
        │  Full Access     │  │  Billing Only    │
        └──────────────────┘  └──────────────────┘
                    │                   │
        ┌───────────┴──────────┬────────┴─────────┬────────────┐
        │                      │                   │            │
        ▼                      ▼                   ▼            ▼
┌─────────────┐      ┌─────────────┐     ┌─────────────┐  ┌──────────┐
│   Billing   │      │  Products   │     │   Reports   │  │ Settings │
│  (Shared)   │      │  (Admin)    │     │   (Admin)   │  │ (Admin)  │
└─────────────┘      └─────────────┘     └─────────────┘  └──────────┘
```

## 🔐 Role-Based Access Control Flow

```
┌──────────┐
│  LOGIN   │
└────┬─────┘
     │
     ▼
┌─────────────────┐
│ Check Credentials│
└────┬────────────┘
     │
     ├─── Valid ────┐
     │              ▼
     │      ┌──────────────┐
     │      │ Assign Role  │
     │      └──────┬───────┘
     │             │
     │      ┌──────┴──────┐
     │      │             │
     │      ▼             ▼
     │  ┌────────┐   ┌────────┐
     │  │ ADMIN  │   │ STAFF  │
     │  └───┬────┘   └───┬────┘
     │      │            │
     │      ▼            ▼
     │  ┌─────────────────────────┐
     │  │  Store in Context &     │
     │  │  LocalStorage           │
     │  └──────────┬──────────────┘
     │             │
     │             ▼
     │  ┌──────────────────────────┐
     │  │  Render Role-Based UI    │
     │  │  • Sidebar               │
     │  │  • Available Routes      │
     │  │  • Features              │
     │  └──────────────────────────┘
     │
     └─── Invalid ──▶ Show Error
```

## 📋 Feature Access Matrix

```
┌─────────────────────────────┬───────────┬──────────┐
│         FEATURE             │   ADMIN   │  STAFF   │
├─────────────────────────────┼───────────┼──────────┤
│ Login                       │     ✅    │    ✅    │
│ Dashboard/Home              │     ✅    │    ✅    │
│ Create Bills                │     ✅    │    ✅    │
│ View Own Bills              │     ✅    │    ✅    │
│ View All Bills              │     ✅    │    ❌    │
│ Reprint Bills               │     ✅    │ ✅ (own) │
│ Cancel Bills                │     ✅    │    ❌    │
│ Product Management          │     ✅    │    ❌    │
│ Add Products                │     ✅    │    ❌    │
│ Edit Products               │     ✅    │    ❌    │
│ Delete Products             │     ✅    │    ❌    │
│ Reports & Analytics         │     ✅    │    ❌    │
│ Settings & Config           │     ✅    │    ❌    │
│ Staff Management            │     ✅    │    ❌    │
└─────────────────────────────┴───────────┴──────────┘
```

## 🔄 Billing Flow

```
┌───────────────┐
│  Start New    │
│     Bill      │
└───────┬───────┘
        │
        ▼
┌─────────────────────┐
│  Select Products    │
│  • Search           │
│  • Category filter  │
│  • Add to cart      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Manage Cart        │
│  • Update quantity  │
│  • Remove items     │
│  • View total       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Proceed to         │
│  Payment            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Select Payment     │
│  • Cash             │
│  • Card             │
│  • UPI (with QR)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Confirm Payment    │
│  • Save bill        │
│  • Store data       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Print Bill         │
│  • Auto print       │
│  • Retry on fail    │
│  • No data loss     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Success            │
│  • Show bill number │
│  • Option: New Bill │
└─────────────────────┘
```

## 🛡️ Security Layers

```
┌──────────────────────────────────────────────┐
│           Layer 1: Route Protection          │
│  • ProtectedRoute component                  │
│  • Checks authentication                     │
│  • Validates role                            │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│           Layer 2: UI Rendering              │
│  • Role-based sidebar menu                   │
│  • Conditional component rendering           │
│  • Hide unauthorized features                │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│         Layer 3: Logic Protection            │
│  • Role checks in components                 │
│  • Data filtering by role                    │
│  • Action authorization                      │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│       Layer 4: Session Management            │
│  • Role stored in context                    │
│  • No role switching in session              │
│  • Auto logout on invalid session            │
└──────────────────────────────────────────────┘
```

## 📊 Data Flow

```
┌──────────────┐
│  Component   │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  AuthContext     │
│  • user          │
│  • role          │
│  • permissions   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Check Access    │
└──────┬───────────┘
       │
   ┌───┴────┐
   │        │
   ▼        ▼
Allowed  Denied
   │        │
   │        ▼
   │   Redirect to
   │   Unauthorized
   │
   ▼
┌──────────────────┐
│  Render Content  │
└──────────────────┘
```

## 🎨 Component Hierarchy

```
App
 ├── AuthProvider
 │    └── BrowserRouter
 │         └── Routes
 │              ├── Login (public)
 │              ├── Unauthorized (public)
 │              │
 │              ├── ProtectedRoute (authenticated)
 │              │    └── Layout
 │              │         ├── Sidebar (role-based menu)
 │              │         └── Main Content
 │              │              ├── Home
 │              │              ├── BillingScreen
 │              │              ├── PaymentScreen
 │              │              └── BillHistory
 │              │
 │              └── AdminRoute (admin only)
 │                   └── Layout
 │                        ├── Sidebar (full menu)
 │                        └── Main Content
 │                             ├── ProductManagement
 │                             ├── Reports
 │                             ├── Settings
 │                             └── StaffManagement
```

## 🔧 Configuration Flow

```
┌─────────────────┐
│  Admin Login    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Go to Settings │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Modify Settings        │
│  • Shop Info            │
│  • Enable/Disable       │
│    Features             │
│  • Printer Config       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Confirmation Dialog    │
│  "Changes apply to new  │
│   bills only"           │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Save Settings          │
│  • Update config        │
│  • Log action           │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Success Message        │
└─────────────────────────┘
```

## 📱 User Journey

### Staff User Journey:
```
Login ➜ Home ➜ New Bill ➜ Select Products ➜ Add to Cart 
➜ Payment ➜ Print ➜ Success ➜ New Bill / View History
```

### Admin User Journey:
```
Login ➜ Dashboard ➜ [Multiple Paths]
├─ Billing Path (same as staff)
├─ Management Path: Products ➜ Add/Edit ➜ Save
├─ Analytics Path: Reports ➜ View Stats ➜ Export
└─ Config Path: Settings ➜ Modify ➜ Confirm ➜ Save
```

## 🎯 Key Design Principles

1. **Role Enforcement at Every Level**
   - Route protection
   - UI rendering
   - Data filtering
   - Action validation

2. **Data Integrity**
   - Past bills never modified
   - Settings changes apply to new bills only
   - Bill data protected during operations

3. **User Experience**
   - Role-appropriate interfaces
   - Clear confirmation dialogs
   - Error recovery mechanisms
   - No data loss

4. **Security First**
   - Authentication required
   - Role-based authorization
   - Action logging
   - Session management

5. **Operational Safety**
   - Confirmation for destructive actions
   - Retry mechanisms for failures
   - Data backup and recovery
   - Audit trails

---

This architecture ensures a secure, user-friendly, and maintainable billing system with strict role-based access control.
