import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import { reportAPI, stockAPI } from '../services/api';
import {
  TrendingUp, ShoppingBag, Package, Users,
  AlertTriangle, AlertCircle, ChevronRight, Zap,
  Camera, Sun, Battery, Lightbulb, Wrench,
} from 'lucide-react';

const CATEGORY_ICONS = {
  'CCTV Cameras': Camera,
  'Solar Water Heaters': Sun,
  'Inverters': Zap,
  'Batteries': Battery,
  'Solar Street Lights': Lightbulb,
  'Accessories': Wrench,
};
const CATEGORY_COLORS = {
  'CCTV Cameras': '#8b5cf6',
  'Solar Water Heaters': '#f59e0b',
  'Inverters': '#3b82f6',
  'Batteries': '#10b981',
  'Solar Street Lights': '#f97316',
  'Accessories': '#06b6d4',
};

function StatCard({ icon, label, value, sub, gradient, loading }) {
  return (
    <div style={{ ...st.statCard, background: gradient }}>
      <div style={st.statIcon}>{icon}</div>
      <div>
        <div style={st.statValue}>{loading ? '—' : value}</div>
        <div style={st.statLabel}>{label}</div>
        {sub && <div style={st.statSub}>{sub}</div>}
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingStats(true);
        const data = await reportAPI.getDailySales();
        setStats(data.summary);
      } catch { /* fail silently */ }
      finally { setLoadingStats(false); }
    };
    load();
  }, []);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setLoadingAlerts(true);
        const data = await stockAPI.getAlerts();
        setAlerts(data);
      } catch { /* fail silently */ }
      finally { setLoadingAlerts(false); }
    };
    loadAlerts();
  }, []);

  const todayRevenue = stats?.totalRevenue ?? 0;
  const todayBills   = stats?.totalBills   ?? 0;
  const todayItems   = stats?.totalItems   ?? 0;

  const lowStockCount   = alerts?.lowStock?.count    ?? 0;
  const outOfStockCount = alerts?.outOfStock?.count  ?? 0;
  const hasStockAlerts  = (lowStockCount + outOfStockCount) > 0;

  return (
    <div style={st.page}>
      {/* ── Welcome banner ── */}
      <div style={st.welcomeBanner}>
        <div>
          <h1 style={st.welcomeTitle}>
            ⚡ Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p style={st.welcomeSub}>
            Smart Energy Solutions • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/billing" style={st.newBillBtn}>
          + New Bill
        </Link>
      </div>

      {/* ── Today's Stats ── */}
      <div style={st.statsGrid}>
        <StatCard
          icon={<TrendingUp size={22} color="white" />}
          label="Today's Revenue"
          value={`₹${todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          gradient="linear-gradient(135deg,#10b981,#059669)"
          loading={loadingStats}
        />
        <StatCard
          icon={<ShoppingBag size={22} color="white" />}
          label="Bills Today"
          value={todayBills}
          sub="paid transactions"
          gradient="linear-gradient(135deg,#3b82f6,#2563eb)"
          loading={loadingStats}
        />
        <StatCard
          icon={<Package size={22} color="white" />}
          label="Items Sold"
          value={todayItems}
          sub="units today"
          gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)"
          loading={loadingStats}
        />
        <StatCard
          icon={<Users size={22} color="white" />}
          label="Avg. Order Value"
          value={todayBills > 0 ? `₹${(todayRevenue / todayBills).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '₹0'}
          gradient="linear-gradient(135deg,#f59e0b,#d97706)"
          loading={loadingStats}
        />
      </div>

      {/* ── Stock Alerts ── */}
      {!loadingAlerts && hasStockAlerts && (
        <div style={st.alertsSection}>
          <div style={st.alertsHeader}>
            <AlertTriangle size={18} color="#f59e0b" />
            <h2 style={st.alertsTitle}>⚠️ Stock Alerts</h2>
            <Link to="/stock" style={st.viewAllLink}>View Stock →</Link>
          </div>

          {outOfStockCount > 0 && (
            <div style={{ ...st.alertBand, background: '#fef2f2', borderColor: '#fecaca' }}>
              <AlertCircle size={16} color="#dc2626" />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>🔴 Out of Stock ({outOfStockCount} products)</span>
                <div style={st.alertProductList}>
                  {alerts.outOfStock.products.slice(0, 4).map(p => (
                    <span key={p._id} style={{ ...st.alertChip, background: '#fee2e2', color: '#dc2626' }}>
                      {p.name}
                    </span>
                  ))}
                  {outOfStockCount > 4 && <span style={st.moreChip}>+{outOfStockCount - 4} more</span>}
                </div>
              </div>
            </div>
          )}

          {lowStockCount > 0 && (
            <div style={{ ...st.alertBand, background: '#fffbeb', borderColor: '#fde68a' }}>
              <AlertCircle size={16} color="#d97706" />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, color: '#92400e' }}>🟡 Low Stock ({lowStockCount} products)</span>
                <div style={st.alertProductList}>
                  {alerts.lowStock.products.slice(0, 4).map(p => (
                    <span key={p._id} style={{ ...st.alertChip, background: '#fef3c7', color: '#92400e' }}>
                      {p.name} ({p.stockQuantity} left)
                    </span>
                  ))}
                  {lowStockCount > 4 && <span style={st.moreChip}>+{lowStockCount - 4} more</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div style={st.sectionHeader}>
        <h2 style={st.sectionTitle}>Quick Actions</h2>
      </div>
      <div style={st.actionsGrid}>
        {[
          { to: '/billing',   label: '🛒 New Bill',         desc: 'Start billing a customer',      color: '#10b981' },
          { to: '/bills',     label: '📋 Bill History',      desc: 'View all transactions',          color: '#3b82f6' },
          ...(isAdmin ? [
            { to: '/products', label: '📦 Products',          desc: 'Manage product catalog',         color: '#8b5cf6' },
            { to: '/stock',    label: '🗃️ Inventory',         desc: 'Stock levels & adjustments',    color: '#f59e0b' },
            { to: '/reports',  label: '📊 Reports',           desc: 'Revenue & sales analytics',      color: '#0ea5e9' },
            { to: '/staff',    label: '👥 Staff',             desc: 'Staff management & payments',    color: '#f97316' },
            { to: '/settings', label: '⚙️ Settings',          desc: 'Shop configuration',             color: '#64748b' },
          ] : []),
        ].map(action => (
          <Link key={action.to} to={action.to} style={{ ...st.actionCard, borderColor: `${action.color}30` }}>
            <div style={{ ...st.actionIcon, background: `${action.color}15`, color: action.color }}>
              {action.label.split(' ')[0]}
            </div>
            <div>
              <div style={st.actionLabel}>{action.label.split(' ').slice(1).join(' ')}</div>
              <div style={st.actionDesc}>{action.desc}</div>
            </div>
            <ChevronRight size={16} color="#94a3b8" style={{ marginLeft: 'auto' }} />
          </Link>
        ))}
      </div>

      {/* ── Product Category Tiles ── */}
      <div style={st.sectionHeader}>
        <h2 style={st.sectionTitle}>Product Categories</h2>
        <Link to="/billing" style={st.viewAllLink}>Start Billing →</Link>
      </div>
      <div style={st.catGrid}>
        {Object.entries(CATEGORY_ICONS).map(([cat, Icon]) => {
          const color = CATEGORY_COLORS[cat] || '#64748b';
          return (
            <Link key={cat} to="/billing" style={{ ...st.catTile, borderColor: `${color}30` }}>
              <div style={{ ...st.catTileIcon, background: `${color}15` }}>
                <Icon size={28} color={color} />
              </div>
              <div style={{ ...st.catTileLabel, color }}>{cat}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const st = {
  page: { display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' },

  welcomeBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    borderRadius: '20px', padding: '1.75rem 2rem', flexWrap: 'wrap', gap: '1rem',
  },
  welcomeTitle: { fontSize: '22px', fontWeight: 800, color: 'white', margin: 0 },
  welcomeSub:   { fontSize: '13px', color: '#94a3b8', marginTop: '4px' },
  newBillBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg,#10b981,#059669)',
    color: 'white', borderRadius: '12px',
    fontWeight: 800, fontSize: '14px', textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  statCard: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    borderRadius: '16px', padding: '1.25rem 1.5rem',
    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
  },
  statIcon: {
    width: '44px', height: '44px', borderRadius: '12px',
    background: 'rgba(255,255,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statValue: { fontSize: '22px', fontWeight: 800, color: 'white' },
  statLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontWeight: 600 },
  statSub:   { fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' },

  // Alerts
  alertsSection: {
    background: 'white', borderRadius: '16px', padding: '1.25rem',
    border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
  },
  alertsHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  alertsTitle: { fontSize: '16px', fontWeight: 800, color: '#0f172a', flex: 1, margin: 0 },
  alertBand: {
    display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
    padding: '0.875rem 1rem', borderRadius: '12px',
    border: '1px solid',
  },
  alertProductList: { display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' },
  alertChip: { padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 },
  moreChip:  { padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: '#f1f5f9', color: '#64748b' },

  // Quick actions
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 },
  viewAllLink: { fontSize: '13px', fontWeight: 700, color: '#0ea5e9', textDecoration: 'none' },

  actionsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem',
  },
  actionCard: {
    display: 'flex', alignItems: 'center', gap: '0.875rem',
    padding: '0.875rem 1rem', background: 'white', borderRadius: '14px',
    border: '1.5px solid', textDecoration: 'none', transition: 'all 0.15s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  actionIcon: {
    width: '40px', height: '40px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', flexShrink: 0,
  },
  actionLabel: { fontSize: '14px', fontWeight: 700, color: '#0f172a' },
  actionDesc:  { fontSize: '11px', color: '#94a3b8', marginTop: '2px' },

  // Category tiles
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.875rem' },
  catTile: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '1.5rem 1rem', background: 'white', borderRadius: '16px',
    border: '1.5px solid', textDecoration: 'none', transition: 'all 0.15s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)', gap: '0.75rem',
  },
  catTileIcon: { width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  catTileLabel: { fontSize: '13px', fontWeight: 700, textAlign: 'center' },
};
