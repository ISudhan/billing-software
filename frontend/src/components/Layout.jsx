import React, { useState, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { getText } from '../utils/translations';
import { Menu, Globe, LogOut, User } from 'lucide-react';

// Language Context for Dashboard ONLY (NOT affecting billing)
const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return { language: 'en', setLanguage: () => {} };
  }
  return context;
};

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [language, setLanguage] = useState('en'); // Dashboard language only
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm(getText('Logout', language) + '?')) {
      logout();
      navigate('/login');
    }
  };

  // Close sidebar after navigation on mobile
  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <div style={styles.container}>
        {/* Top Header - Fixed */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            {/* Hamburger - Tablet & Mobile Only */}
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              style={styles.menuButton}
              className="menu-button"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            
            {/* App Logo/Name */}
            <div style={styles.appName}>
              <span style={styles.appLogo}>🏪</span>
              <span style={styles.appTitle}>Senthur Billing</span>
            </div>
          </div>

          <div style={styles.headerRight}>
            {/* Language Toggle - Dashboard Only */}
            <div style={styles.languageToggle}>
              <Globe size={16} style={{ color: '#64748b' }} />
              <button
                onClick={() => setLanguage('en')}
                style={{
                  ...styles.langButton,
                  ...(language === 'en' ? styles.langButtonActive : {})
                }}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ta')}
                style={{
                  ...styles.langButton,
                  ...(language === 'ta' ? styles.langButtonActive : {})
                }}
              >
                தமிழ்
              </button>
            </div>

            {/* User Profile & Logout */}
            <div style={styles.userSection}>
              <div style={styles.userInfo}>
                <User size={18} />
                <span style={styles.userName}>{user?.name}</span>
              </div>
              <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Sidebar with auto-close on navigation */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={handleSidebarClose}
        />
        
        {/* Main Content */}
        <main style={styles.main}>{children}</main>
        
        {/* Overlay for Mobile */}
        {isSidebarOpen && (
          <div 
            style={styles.overlay} 
            onClick={handleSidebarClose}
          />
        )}
      </div>
    </LanguageContext.Provider>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    position: 'relative',
  },
  header: {
    position: 'fixed',
    top: 0,
    right: 0,
    left: 0,
    height: '64px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
    zIndex: 900,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  menuButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.625rem',
    cursor: 'pointer',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
  },
  appName: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  appLogo: {
    fontSize: '24px',
  },
  appTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
  },
  languageToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f8fafc',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
  },
  langButton: {
    padding: '0.375rem 0.75rem',
    border: 'none',
    background: 'transparent',
    borderRadius: '0.375rem',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  langButtonActive: {
    backgroundColor: '#ffffff',
    color: '#2563eb',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
  },
  logoutBtn: {
    padding: '0.5rem',
    backgroundColor: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  main: {
    flex: 1,
    paddingTop: '80px',
    padding: '80px 2rem 2rem 2rem',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    transition: 'margin-left 0.2s ease',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 950,
  },
};

// Responsive Media Queries
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    /* Desktop: Sidebar Always Visible, No Hamburger */
    @media (min-width: 1025px) {
      main {
        margin-left: 260px !important;
      }
      .menu-button {
        display: none !important;
      }
    }
    
    /* Mobile/Tablet: Hamburger Menu, Sidebar Overlay */
    @media (max-width: 1024px) {
      .menu-button {
        display: flex !important;
      }
      main {
        margin-left: 0 !important;
      }
    }
    
    @media (max-width: 768px) {
      header {
        padding: 0 1rem !important;
      }
      main {
        padding: 5rem 1rem 1rem 1rem !important;
      }
    }
  `;
  document.head.appendChild(style);
}
