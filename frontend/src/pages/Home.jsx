import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBilingual } from '../utils/translations';
import { ShoppingCart, FileText, Package, BarChart3, Settings, TrendingUp, Users } from 'lucide-react';

export default function Home() {
  const { user, isAdmin } = useAuth();

  const staffCards = [
    {
      title: getBilingual('New Bill'),
      description: getBilingual('Create a new bill'),
      icon: ShoppingCart,
      link: '/billing',
      color: '#2563eb',
      bgColor: '#dbeafe',
    },
    {
      title: getBilingual('Bill History'),
      description: getBilingual('View your bills'),
      icon: FileText,
      link: '/bill-history',
      color: '#059669',
      bgColor: '#d1fae5',
    },
  ];

  const adminCards = [
    {
      title: getBilingual('Billing'),
      description: getBilingual('Create new bills'),
      icon: ShoppingCart,
      link: '/billing',
      color: '#2563eb',
      bgColor: '#dbeafe',
    },
    {
      title: getBilingual('Bill History'),
      description: getBilingual('View all bills'),
      icon: FileText,
      link: '/bill-history',
      color: '#059669',
      bgColor: '#d1fae5',
    },
    {
      title: getBilingual('Product Management'),
      description: getBilingual('Manage products'),
      icon: Package,
      link: '/products',
      color: '#d97706',
      bgColor: '#fef3c7',
    },
    {
      title: getBilingual('Reports'),
      description: getBilingual('View analytics'),
      icon: BarChart3,
      link: '/reports',
      color: '#9333ea',
      bgColor: '#e9d5ff',
    },
    {
      title: getBilingual('Staff Management'),
      description: getBilingual('Manage staff users'),
      icon: Users,
      link: '/staff',
      color: '#0891b2',
      bgColor: '#cffafe',
    },
    {
      title: getBilingual('Settings'),
      description: getBilingual('Configure system'),
      icon: Settings,
      link: '/settings',
      color: '#dc2626',
      bgColor: '#fee2e2',
    },
  ];

  const cards = isAdmin() ? adminCards : staffCards;

  return (
    <div style={styles.container}>
      <div style={styles.welcome}>
        <h1 style={styles.welcomeTitle}>
          {getBilingual('Welcome')}, {user.name}!
        </h1>
        <p style={styles.welcomeSubtitle}>
          {isAdmin() 
            ? getBilingual('Full system access') 
            : getBilingual('Ready to serve customers')}
        </p>
      </div>

      <div style={styles.grid}>
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              to={card.link}
              style={styles.card}
            >
              <div
                style={{
                  ...styles.iconBox,
                  backgroundColor: card.bgColor,
                }}
              >
                <Icon size={32} color={card.color} />
              </div>
              <h3 style={styles.cardTitle}>{card.title}</h3>
              <p style={styles.cardDescription}>{card.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats for Admin */}
      {isAdmin() && (
        <div style={styles.statsSection}>
          <h2 style={styles.statsTitle}>Today's Summary</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Sales</div>
              <div style={styles.statValue}>₹15,420</div>
              <div style={styles.statChange}>
                <TrendingUp size={16} color="#059669" />
                <span style={{ color: '#059669' }}>+12%</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Bills Generated</div>
              <div style={styles.statValue}>45</div>
              <div style={styles.statChange}>
                <TrendingUp size={16} color="#059669" />
                <span style={{ color: '#059669' }}>+8%</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Items Sold</div>
              <div style={styles.statValue}>178</div>
              <div style={styles.statChange}>
                <TrendingUp size={16} color="#059669" />
                <span style={{ color: '#059669' }}>+15%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions for Staff */}
      {!isAdmin() && (
        <div style={styles.infoSection}>
          <h2 style={styles.infoTitle}>Quick Guide</h2>
          <ul style={styles.infoList}>
            <li>Click "New Bill" to start billing</li>
            <li>Select products and quantities</li>
            <li>Choose payment method</li>
            <li>Print bill for customer</li>
            <li>View your bills in "Bill History"</li>
          </ul>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  welcome: {
    marginBottom: '3rem',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  welcomeSubtitle: {
    fontSize: '18px',
    color: '#6b7280',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    textDecoration: 'none',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
  },
  iconBox: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#6b7280',
  },
  statsSection: {
    marginBottom: '3rem',
  },
  statsTitle: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#1f2937',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '0.5rem',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  statChange: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '14px',
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  infoTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#1f2937',
  },
  infoList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
};
