# ⚡ Smart Energy Solutions — Billing System

A production-ready **POS billing and inventory management system** built with React (Vite) + Node.js (Express) + MongoDB.

---

## 🚀 Features

- **JWT Authentication** — role-based access (Admin / Staff)
- **Billing / POS** — fast bill creation with product search and QR code support
- **Inventory & Stock Management** — live stock levels, low-stock alerts, ledger history
- **Reports** — daily sales, date-range reports, staff-wise sales, top products
- **Staff Management & Payments** — work records, salary tracking
- **Settings** — shop details, bill prefix, configurable via admin panel
- **Multi-language UI** — i18n support built-in
- **Rate limiting, Helmet, Compression** — production security baked in

---

## 📁 Project Structure

```
billing-software/
├── backend/               # Node.js + Express API
│   ├── config/            # DB connection & app config
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Auth, error handling
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API route definitions
│   ├── scripts/           # DB seed script
│   ├── utils/             # Helpers
│   └── server.js          # Entry point
│
└── frontend/              # React + Vite SPA
    ├── public/
    └── src/
        ├── components/    # Reusable UI components
        ├── context/       # React context (Auth, etc.)
        ├── pages/         # Page-level components
        ├── services/      # Axios API layer (api.js)
        └── utils/         # Helpers & translations
```

---

## ⚙️ Environment Setup

### Backend — `backend/.env`

Copy from the example and fill in your values:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | `development` or `production` | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/smart_energy_solutions` |
| `JWT_SECRET` | Secret key for JWT signing | *(must set)* |
| `JWT_EXPIRE` | Token expiry duration | `7d` |
| `ADMIN_USERNAME` | Default admin username (seed) | `admin` |
| `ADMIN_PASSWORD` | Default admin password (seed) | `admin123` |
| `SHOP_NAME` | Shop name shown on bills | `Smart Energy Solutions` |
| `BILL_PREFIX` | Prefix for bill numbers | `BILL` |

### Frontend — `frontend/.env`

Copy from the example and fill in your values:

```bash
cp frontend/.env.example frontend/.env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `VITE_APP_NAME` | App name shown in UI | `Smart Energy Solutions` |
| `VITE_APP_VERSION` | App version | `1.0.0` |

> All frontend env variables **must** be prefixed with `VITE_` to be exposed by Vite.

---

## 🛠️ Local Development

### Prerequisites

- Node.js ≥ 16
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env    # edit as needed
cp frontend/.env.example frontend/.env  # edit as needed
```

### 3. Seed the database

```bash
cd backend && npm run seed
```

This creates the default admin user and sample products.

### 4. Start the servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — login with the seeded admin credentials.

---

## 🌐 API Overview

Base URL: `http://localhost:5000/api`

| Module | Prefix | Description |
|---|---|---|
| Auth | `/api/auth` | Login, current user |
| Users | `/api/users` | Admin user management |
| Products | `/api/products` | CRUD + categories |
| Bills | `/api/bills` | Create, list, void bills |
| Reports | `/api/reports` | Daily, date-range, staff, top-products |
| Settings | `/api/settings` | Shop settings |
| Staff Payments | `/api/staff-payments` | Work records & salary |
| Stock | `/api/stock` | Stock list, alerts, ledger, adjustments |

Health check: `GET /health`

---

## ☁️ Deployment (Vercel)

The project is configured for Vercel deployment via `vercel.json` at the root level.

- **Frontend** — deployed as a static Vite build
- **Backend** — deployed as a Vercel serverless function

### Steps

1. Push the repo to GitHub
2. Import the project in [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard:
   - All `backend/.env` values under **Backend** settings
   - All `frontend/.env` values (prefixed `VITE_`) under **Frontend** settings
4. Update `VITE_API_URL` to point to your deployed backend URL
5. Update the CORS `origin` in `backend/server.js` with your Vercel frontend URL

---

## 🔑 Default Login

After running the seed script:

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin123` |

> **Change this immediately in production.**

---

## 📄 License

MIT
