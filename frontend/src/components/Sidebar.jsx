import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import { useLanguage } from './Layout';
import { getText } from '../utils/translations';
import { 
  ShoppingCart, 
  Package, 
  FileText, 
  Settings, 
  LogOut,
  BarChart3,
  Users,
  Home,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  // Staff menu items - BILLING ONLY
  const staffMenuItems = [
    { path: '/', icon: Home, label: getText('Home', language) },
    { path: '/billing', icon: ShoppingCart, label: getText('New Bill', language) },
    { path: '/bill-history', icon: FileText, label: getText('My Bills', language) },
  ];

  // Admin menu items - FULL ACCESS
  const adminMenuItems = [
    { path: '/', icon: Home, label: getText('Dashboard', language) },
    { path: '/billing', icon: ShoppingCart, label: getText('Billing', language) },
    { path: '/bill-history', icon: FileText, label: getText('All Bills', language) },
    { path: '/products', icon: Package, label: getText('Products', language) },
    { path: '/reports', icon: BarChart3, label: getText('Reports', language) },
    { path: '/staff', icon: Users, label: getText('Staff Management', language) },
    { path: '/settings', icon: Settings, label: getText('Settings', language) },
  ];

  const menuItems = user?.role === ROLES.ADMIN ? adminMenuItems : staffMenuItems;

  return (
    <>
      <div 
        style={{
          ...styles.sidebar,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        className="sidebar"
      >
        {/* Close button for mobile only */}
        <button onClick={onClose} style={styles.closeBtn} className="sidebar-close-btn">
          <X size={24} />
        </button>
        
        <div style={styles.header}>
          <div style={styles.logoSection}>
            <span style={styles.logo}>🏪</span>
            <h2 style={styles.title}>Senthur</h2>
          </div>
          <div style={styles.userBadge}>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>{user?.role}</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose} // Auto-close on mobile after navigation
                style={{
                  ...styles.navItem,
                  ...(isActive(item.path) ? styles.navItemActive : {}),
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    top: '64px', // Below header
    height: 'calc(100vh - 64px)',
    width: '260px',
    backgroundColor: '#1e293b',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease',
    zIndex: 900,
    overflowY: 'auto',
    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
  },
  closeBtn: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    color: '#cbd5e1',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  },
  header: {
    padding: '1.5rem',
    borderBottom: '1px solid rgba(203, 213, 225, 0.1)',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  logo: {
    fontSize: '2rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
  },
  userBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: '0.75rem',
    borderRadius: '8px',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#60a5fa',
  },
  userRole: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.25rem',
    textTransform: 'capitalize',
  },
  nav: {
    flex: 1,
    padding: '1rem 0',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.875rem 1.5rem',
    color: '#cbd5e1',
    textDecoration: 'none',
    transition: 'all 0.2s',
    fontSize: '0.95rem',
    borderLeft: '3px solid transparent',
    fontWeight: '500',
  },
  navItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#ffffff',
    borderLeft: '3px solid #3b82f6',
  },
};
