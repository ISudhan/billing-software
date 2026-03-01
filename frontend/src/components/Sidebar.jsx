import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import { useLanguage } from './Layout';
import { getText } from '../utils/translations';
import {
  ShoppingCart, Package, FileText, Settings, LogOut,
  BarChart3, Users, Home, X, Zap
} from 'lucide-react';

// Category color map for visual accent
const CATEGORY_COLORS = {
  '/':            '#0ea5e9',
  '/billing':     '#10b981',
  '/bill-history':'#3b82f6',
  '/products':    '#f59e0b',
  '/reports':     '#8b5cf6',
  '/staff':       '#06b6d4',
  '/settings':    '#ef4444',
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  const cashierMenuItems = [
    { path: '/',             icon: Home,         label: getText('Home', language) },
    { path: '/billing',      icon: ShoppingCart, label: getText('New Bill', language) },
    { path: '/bill-history', icon: FileText,     label: getText('My Bills', language) },
    { path: '/products',     icon: Package,      label: getText('Product Management', language) },
  ];

  const adminMenuItems = [
    { path: '/',             icon: Home,         label: getText('Dashboard', language) },
    { path: '/billing',      icon: ShoppingCart, label: getText('Billing', language) },
    { path: '/bill-history', icon: FileText,     label: getText('All Bills', language) },
    { path: '/products',     icon: Package,      label: getText('Products', language) },
    { path: '/reports',      icon: BarChart3,    label: getText('Reports', language) },
    { path: '/staff',        icon: Users,        label: getText('Staff Management', language) },
    { path: '/settings',     icon: Settings,     label: getText('Settings', language) },
  ];

  const menuItems = user?.role === ROLES.ADMIN ? adminMenuItems : cashierMenuItems;

  return (
    <div
      style={styles.sidebar}
      className={`sidebar${isOpen ? ' sidebar-open' : ''}`}
    >
      {/* ── Header ── */}
      <div style={styles.sidebarHeader}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>
            <Zap size={20} color="white" />
          </div>
          <div>
            <div style={styles.logoTitle}>Smart Energy</div>
            <div style={styles.logoSub}>Solutions</div>
          </div>
        </div>

        {/* Close button (mobile) */}
        <button onClick={onClose} style={styles.closeBtn} className="sidebar-close-btn">
          <X size={18} />
        </button>
      </div>

      {/* ── User badge ── */}
      <div style={styles.userSection}>
        <div style={styles.userAvatar}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={styles.userName}>{user?.name}</div>
          <div style={styles.userRole}>{user?.role}</div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={styles.nav}>
        <div style={styles.navLabel}>NAVIGATION</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const accentColor = CATEGORY_COLORS[item.path] || '#0ea5e9';

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={{
                ...styles.navItem,
                ...(active ? { ...styles.navItemActive, borderLeftColor: accentColor } : {}),
              }}
            >
              <div style={{
                ...styles.navIconWrap,
                background: active ? `${accentColor}22` : 'transparent',
                color: active ? accentColor : '#94a3b8',
              }}>
                <Icon size={18} />
              </div>
              <span style={{ color: active ? '#f1f5f9' : '#94a3b8' }}>
                {item.label}
              </span>
              {active && <div style={{ ...styles.activeIndicator, background: accentColor }} />}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div style={styles.sidebarFooter}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
        <div style={styles.footerVersion}>Smart Energy Solutions v2.0</div>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    position: 'fixed', left: 0, top: '60px',
    height: 'calc(100vh - 60px)', width: '260px',
    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    display: 'flex', flexDirection: 'column',
    transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
    zIndex: 900,
    overflowY: 'auto',
    boxShadow: '4px 0 20px rgba(0,0,0,0.25)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },

  sidebarHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1.25rem 1.25rem 0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.625rem' },
  logoIcon: {
    width: '38px', height: '38px',
    background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)',
    borderRadius: '10px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(14,165,233,0.35)',
  },
  logoTitle: { fontSize: '15px', fontWeight: '800', color: '#f1f5f9', lineHeight: 1.2 },
  logoSub: { fontSize: '11px', color: '#64748b', fontWeight: '500' },

  closeBtn: {
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#94a3b8', cursor: 'pointer', padding: '0.4rem',
    borderRadius: '8px', display: 'flex', alignItems: 'center',
    transition: 'all 0.15s',
  },

  userSection: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    margin: '0.875rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    padding: '0.75rem 1rem', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  userAvatar: {
    width: '36px', height: '36px',
    background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)',
    borderRadius: '10px', color: 'white',
    fontSize: '15px', fontWeight: '800',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  userName: { fontSize: '13px', fontWeight: '700', color: '#e2e8f0' },
  userRole: { fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },

  nav: { flex: 1, padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' },
  navLabel: {
    fontSize: '10px', fontWeight: '700', color: '#475569',
    letterSpacing: '0.08em', padding: '0.75rem 0.75rem 0.375rem',
    textTransform: 'uppercase',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.7rem 0.875rem',
    borderRadius: '10px', color: '#94a3b8',
    textDecoration: 'none',
    transition: 'all 0.15s',
    fontSize: '14px', fontWeight: '500',
    borderLeft: '3px solid transparent',
    position: 'relative',
    cursor: 'pointer',
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.07)',
    color: '#f1f5f9',
    borderLeft: '3px solid',
    fontWeight: '600',
  },
  navIconWrap: {
    width: '32px', height: '32px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'all 0.15s',
  },
  activeIndicator: {
    position: 'absolute', right: '0.75rem',
    width: '6px', height: '6px', borderRadius: '50%',
  },

  sidebarFooter: {
    padding: '0.875rem 1rem 1.25rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  logoutBtn: {
    width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.65rem 0.875rem',
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    color: '#f87171', borderRadius: '10px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600', transition: 'all 0.15s',
    marginBottom: '0.625rem',
  },
  footerVersion: { textAlign: 'center', fontSize: '11px', color: '#334155' },
};
