import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // In production, this would be an API call
    // For now, we'll use a simple mock
    try {
      // Mock API call
      const response = await mockLoginAPI(username, password);
      
      const userData = {
        id: response.id,
        username: response.username,
        name: response.name,
        role: response.role,
        loginTime: new Date().toISOString(),
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Log the login action
      logAction('LOGIN', userData);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    if (user) {
      logAction('LOGOUT', user);
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isAdmin = () => hasRole(ROLES.ADMIN);
  const isStaff = () => hasRole(ROLES.STAFF);

  const value = {
    user,
    login,
    logout,
    hasRole,
    isAdmin,
    isStaff,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock login API - Replace with actual API call
const mockLoginAPI = async (username, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock users for development
      const users = {
        admin: { id: 1, username: 'admin', name: 'Administrator', role: ROLES.ADMIN, password: 'admin123' },
        staff1: { id: 2, username: 'staff1', name: 'Staff Member 1', role: ROLES.STAFF, password: 'staff123' },
        staff2: { id: 3, username: 'staff2', name: 'Staff Member 2', role: ROLES.STAFF, password: 'staff123' },
      };

      const user = users[username];
      if (user && user.password === password) {
        const { password: _, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      } else {
        reject(new Error('Invalid username or password'));
      }
    }, 500);
  });
};

// Action logger - Replace with actual API call
const logAction = (action, user) => {
  const logEntry = {
    action,
    userId: user.id,
    username: user.username,
    role: user.role,
    timestamp: new Date().toISOString(),
  };
  console.log('Action logged:', logEntry);
  // In production: send to backend API
};
