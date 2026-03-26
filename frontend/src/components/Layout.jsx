import React, { useState, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { getText } from '../utils/translations';
import { Menu, Globe, LogOut, User, Zap, Bell } from 'lucide-react';

// Language Context for Dashboard ONLY (NOT affecting billing)
const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) return { language: 'en', setLanguage: () => {} };
  return context;
};

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Persist language in localStorage so navigation does not reset it
  const [language, setLanguageState] = useState(() => {
    try { return localStorage.getItem('ses_lang') || 'en'; } catch { return 'en'; }
  });
  const setLanguage = (lang) => {
    setLanguageState(lang);
    try { localStorage.setItem('ses_lang', lang); } catch {}
  };
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/login');
    }
  };

  const handleSidebarClose = () => setIsSidebarOpen(false);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <div style={styles.container}>

        {/* ── Top Header ── */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            {/* Hamburger — Mobile Only (hidden on desktop via CSS) */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              style={styles.menuButton}
              className="menu-button"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            {/* Brand */}
            <div style={styles.brand}>
              <div style={styles.brandIcon}>
                <Zap size={18} color="white" />
              </div>
              <div className="header-brand-text">
                <div style={styles.brandName}>Smart Energy Solutions</div>
                <div style={styles.brandSubtitle}>Billing System</div>
              </div>
            </div>
          </div>

          <div style={styles.headerRight}>
            {/* Language Toggle */}
            <div style={styles.langToggle}>
              <Globe size={14} color="#64748b" />
              {['en', 'ta'].map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{
                    ...styles.langBtn,
                    ...(language === lang ? styles.langBtnActive : {}),
                  }}
                >
                  {lang === 'en' ? 'EN' : 'தமிழ்'}
                </button>
              ))}
            </div>

            {/* User info */}
            <div style={styles.userChip}>
              <div style={styles.userAvatar}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={styles.userDetails} className="header-user-name">
                <div style={styles.userName}>{user?.name}</div>
                <div style={styles.userRole}>{user?.role}</div>
              </div>
            </div>

            {/* Logout */}
            <button onClick={handleLogout} style={styles.logoutBtn} title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Sidebar — permanent on desktop, slide-in on mobile */}
        <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

        {/* Main Content — shifts right on desktop to account for fixed sidebar */}
        <main style={styles.main} className="layout-main">
          {children}
        </main>

        {/* Mobile overlay — only rendered when sidebar is open on mobile */}
        {isSidebarOpen && (
          <div style={styles.overlay} className="sidebar-overlay" onClick={handleSidebarClose} />
        )}
      </div>
    </LanguageContext.Provider>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f0f4f8',
    position: 'relative',
  },
  header: {
    position: 'fixed',
    top: 0, right: 0, left: 0,
    height: '60px',
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.25rem',
    zIndex: 1002,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '0.875rem' },

  menuButton: {
    width: '36px', height: '36px',
    background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
    color: 'white', border: 'none', borderRadius: '10px',
    cursor: 'pointer', display: 'none',
    alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
    transition: 'all 0.2s',
  },

  brand: { display: 'flex', alignItems: 'center', gap: '0.625rem' },
  brandIcon: {
    width: '34px', height: '34px',
    background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(14,165,233,0.35)',
    flexShrink: 0,
  },
  brandName: { fontSize: '14px', fontWeight: '800', color: '#0f172a', lineHeight: 1.2 },
  brandSubtitle: { fontSize: '10px', color: '#94a3b8', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' },

  langToggle: {
    display: 'flex', alignItems: 'center', gap: '0.25rem',
    background: '#f8fafc', padding: '0.25rem 0.5rem',
    borderRadius: '8px', border: '1px solid #e2e8f0',
  },
  langBtn: {
    padding: '0.2rem 0.5rem', border: 'none',
    background: 'transparent', borderRadius: '6px',
    fontSize: '12px', fontWeight: '600', color: '#64748b',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  langBtnActive: {
    background: 'white', color: '#2563eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },

  userChip: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: '#f8fafc', padding: '0.375rem 0.75rem',
    borderRadius: '10px', border: '1px solid #e2e8f0',
  },
  userAvatar: {
    width: '28px', height: '28px',
    background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)',
    borderRadius: '8px', color: 'white',
    fontSize: '13px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userDetails: {},
  userName: { fontSize: '13px', fontWeight: '700', color: '#0f172a', lineHeight: 1.2 },
  userRole: { fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' },

  logoutBtn: {
    width: '34px', height: '34px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: 'none', border: '1.5px solid #e2e8f0',
    borderRadius: '9px', color: '#64748b', cursor: 'pointer',
    transition: 'all 0.2s',
  },

  main: {
    flex: 1,
    paddingTop: '76px',
    padding: '76px 1.75rem 1.75rem',
    minHeight: '100vh',
    transition: 'margin-left 0.25s ease',
  },

  overlay: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
  },
};

// Responsive layout is handled by index.css media queries
