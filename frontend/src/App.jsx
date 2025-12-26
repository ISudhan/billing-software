import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Home from './pages/Home';
import BillingScreen from './pages/BillingScreen';
import PaymentScreen from './pages/PaymentScreen';
import BillHistory from './pages/BillHistory';
import ProductManagement from './pages/ProductManagement';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import StaffManagement from './pages/StaffManagement';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes - All authenticated users */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Layout>
                  <BillingScreen />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Layout>
                  <PaymentScreen />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bill-history"
            element={
              <ProtectedRoute>
                <Layout>
                  <BillHistory />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin-Only Routes */}
          <Route
            path="/products"
            element={
              <AdminRoute>
                <Layout>
                  <ProductManagement />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <AdminRoute>
                <Layout>
                  <Reports />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <AdminRoute>
                <Layout>
                  <Settings />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <AdminRoute>
                <Layout>
                  <StaffManagement />
                </Layout>
              </AdminRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
