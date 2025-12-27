import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is logged in but doesn't have permission
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  return <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>{children}</ProtectedRoute>;
};

export const CashierRoute = ({ children }) => {
  return <ProtectedRoute allowedRoles={[ROLES.CASHIER]}>{children}</ProtectedRoute>;
};

export const BillingRoute = ({ children }) => {
  // Both Admin and Cashier can access billing and products
  return <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CASHIER]}>{children}</ProtectedRoute>;
};
