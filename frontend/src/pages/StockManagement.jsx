import React, { useState, useEffect } from 'react';
import { stockAPI } from '../services/api';
import { useAuth, ROLES } from '../context/AuthContext';
import {
  Package, AlertCircle, AlertTriangle, TrendingDown, Sliders,
  RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';

const STATUS_CONFIG = {
  IN_STOCK:     { label: '🟢 In Stock',     bg: '#dcfce7', color: '#15803d' },
  LOW_STOCK:    { label: '🟡 Low Stock',    bg: '#fef3c7', color: '#92400e' },
  OUT_OF_STOCK: { label: '🔴 Out of Stock', bg: '#fee2e2', color: '#b91c1c' },
};

function getStatus(product) {
  if (product.stockQuantity === 0) return 'OUT_OF_STOCK';
  if (product.stockQuantity <= product.lowStockThreshold) return 'LOW_STOCK';
  return 'IN_STOCK';
}

export default function StockManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL | LOW | OUT
  const [search, setSearch] = useState('');

  // Adjustment modal
  const [adjProduct, setAdjProduct] = useState(null);
  const [adjQty, setAdjQty] = useState('');
  const [adjNote, setAdjNote] = useState('');
  const [adjSaving, setAdjSaving] = useState(false);
  const [adjError, setAdjError] = useState('');

  // Ledger drawer
  const [ledgerProduct, setLedgerProduct] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const loadStock = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'LOW') params.lowStock = 'true';
      if (filter === 'OUT') params.outOfStock = 'true';
      const data = await stockAPI.getStockList(params);
      setProducts(data.products || []);
      setSummary(data.summary || {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadStock(); }, [filter]);

  const openAdjust = (product) => {
    setAdjProduct(product);
    setAdjQty('');
    setAdjNote('');
    setAdjError('');
  };

  const submitAdjustment = async () => {
    const qty = parseInt(adjQty);
    if (isNaN(qty) || qty === 0) { setAdjError('Enter a non-zero quantity (+/-)'); return; }
    try {
      setAdjSaving(true);
      await stockAPI.adjustStock(adjProduct._id, qty, adjNote || 'Manual adjustment');
      setAdjProduct(null);
      loadStock();
    } catch (e) {
      setAdjError(e.message || 'Failed to adjust stock');
    } finally {
      setAdjSaving(false);
    }
  };

  const openLedger = async (product) => {
    setLedgerProduct(product);
    setLedger([]);
    setLedgerLoading(true);
    try {
      const data = await stockAPI.getProductLedger(product._id);
      setLedger(data.movements || []);
    } catch (e) { console.error(e); }
    finally { setLedgerLoading(false); }
  };

  const filtered = products.filter(p => {
    if (!search) return true;
    return p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase());
  });

  const movTypeStyle = {
    SALE: { bg: '#fee2e2', color: '#dc2626' },
    PURCHASE: { bg: '#dcfce7', color: '#15803d' },
    RETURN: { bg: '#dbeafe', color: '#1e40af' },
    MANUAL_ADJUSTMENT: { bg: '#f3e8ff', color: '#7c3aed' },
  };

  return (
    <div style={st.page}>
      {/* Header */}
      <div style={st.header}>
        <div>
          <h1 style={st.title}>🗃️ Inventory Management</h1>
          <p style={st.subtitle}>Real-time stock levels and movement ledger</p>
        </div>
        <button onClick={loadStock} style={st.refreshBtn}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div style={st.summaryGrid}>
        <div style={{ ...st.summaryCard, borderColor: '#a7f3d0' }}>
          <Package size={20} color="#10b981" />
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{summary.totalProducts ?? '—'}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Total Products</div>
          </div>
        </div>
        <div style={{ ...st.summaryCard, borderColor: '#fde68a', cursor: 'pointer' }} onClick={() => setFilter(f => f === 'LOW' ? 'ALL' : 'LOW')}>
          <AlertTriangle size={20} color="#d97706" />
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{summary.lowStockCount ?? '—'}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Low Stock</div>
          </div>
        </div>
        <div style={{ ...st.summaryCard, borderColor: '#fecaca', cursor: 'pointer' }} onClick={() => setFilter(f => f === 'OUT' ? 'ALL' : 'OUT')}>
          <AlertCircle size={20} color="#dc2626" />
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{summary.outOfStockCount ?? '—'}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Out of Stock</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={st.filterRow}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products…"
          style={st.searchInput}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'LOW', 'OUT'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ ...st.filterBtn, background: filter === f ? '#0f172a' : 'white', color: filter === f ? 'white' : '#64748b' }}
            >
              {f === 'ALL' ? 'All' : f === 'LOW' ? '🟡 Low Stock' : '🔴 Out of Stock'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={st.tableWrap}>
        {loading ? (
          <div style={st.loading}>Loading stock data…</div>
        ) : (
          <table style={st.table}>
            <thead>
              <tr style={st.tableHead}>
                <th style={st.th}>Product</th>
                <th style={st.th}>Category</th>
                <th style={st.th}>HSN</th>
                <th style={st.th}>GST%</th>
                <th style={st.th}>Cost</th>
                <th style={st.th}>Price</th>
                <th style={{ ...st.th, textAlign: 'center' }}>Stock</th>
                <th style={{ ...st.th, textAlign: 'center' }}>Status</th>
                <th style={st.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const status = getStatus(product);
                const stCfg = STATUS_CONFIG[status];
                return (
                  <tr key={product._id} style={st.tableRow}>
                    <td style={st.td}>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{product.name}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>{product.nameTamil}</div>
                    </td>
                    <td style={st.td}><span style={st.catChip}>{product.category}</span></td>
                    <td style={st.td}>{product.hsnCode || '—'}</td>
                    <td style={st.td}>{product.gstRate ?? 0}%</td>
                    <td style={st.td}>₹{(product.costPrice || 0).toLocaleString('en-IN')}</td>
                    <td style={st.td}>₹{(product.price || 0).toLocaleString('en-IN')}</td>
                    <td style={{ ...st.td, textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '16px', color: status === 'OUT_OF_STOCK' ? '#dc2626' : status === 'LOW_STOCK' ? '#d97706' : '#0f172a' }}>
                        {product.stockQuantity}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                        min: {product.lowStockThreshold}
                      </div>
                    </td>
                    <td style={{ ...st.td, textAlign: 'center' }}>
                      <span style={{ ...st.badge, background: stCfg.bg, color: stCfg.color }}>
                        {stCfg.label}
                      </span>
                    </td>
                    <td style={st.td}>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        {isAdmin && (
                          <button onClick={() => openAdjust(product)} style={st.actionBtn} title="Adjust Stock">
                            <Sliders size={14} /> Adjust
                          </button>
                        )}
                        <button onClick={() => openLedger(product)} style={{ ...st.actionBtn, background: '#eff6ff', color: '#2563eb' }} title="View Ledger">
                          <TrendingDown size={14} /> Ledger
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No products found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Adjustment Modal ── */}
      {adjProduct && (
        <div style={st.overlay} onClick={() => setAdjProduct(null)}>
          <div style={st.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Adjust Stock: {adjProduct.name}</h3>
            <div style={{ marginBottom: '0.75rem', color: '#64748b', fontSize: '13px' }}>
              Current stock: <b>{adjProduct.stockQuantity}</b> units
            </div>
            <div style={st.formGroup}>
              <label style={st.label}>Quantity Change (+ to add, − to reduce)</label>
              <input
                type="number"
                value={adjQty}
                onChange={e => setAdjQty(e.target.value)}
                placeholder="e.g. 10 or -5"
                style={st.input}
              />
            </div>
            <div style={st.formGroup}>
              <label style={st.label}>Note (optional)</label>
              <input
                value={adjNote}
                onChange={e => setAdjNote(e.target.value)}
                placeholder="e.g. Physical count correction"
                style={st.input}
              />
            </div>
            {adjError && <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '0.75rem' }}>{adjError}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setAdjProduct(null)} style={st.cancelBtn}>Cancel</button>
              <button onClick={submitAdjustment} disabled={adjSaving} style={st.saveBtn}>
                {adjSaving ? 'Saving…' : 'Apply Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Ledger Drawer ── */}
      {ledgerProduct && (
        <div style={st.overlay} onClick={() => setLedgerProduct(null)}>
          <div style={{ ...st.modal, maxWidth: '650px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '0.25rem', fontWeight: 800 }}>📋 Stock Ledger: {ledgerProduct.name}</h3>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '1rem' }}>Current: {ledgerProduct.stockQuantity} units</div>
            {ledgerLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading ledger…</div>
            ) : ledger.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No movements recorded yet.</div>
            ) : (
              <table style={{ ...st.table, marginBottom: 0 }}>
                <thead>
                  <tr style={st.tableHead}>
                    <th style={st.th}>Type</th>
                    <th style={st.th}>Change</th>
                    <th style={st.th}>Before</th>
                    <th style={st.th}>After</th>
                    <th style={st.th}>Reference</th>
                    <th style={st.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((m, i) => {
                    const mStyle = movTypeStyle[m.movementType] || { bg: '#f1f5f9', color: '#64748b' };
                    return (
                      <tr key={i} style={st.tableRow}>
                        <td style={st.td}>
                          <span style={{ ...st.badge, background: mStyle.bg, color: mStyle.color, fontSize: '10px' }}>
                            {m.movementType.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ ...st.td, fontWeight: 700, color: m.quantityChange > 0 ? '#10b981' : '#dc2626' }}>
                          {m.quantityChange > 0 ? '+' : ''}{m.quantityChange}
                        </td>
                        <td style={st.td}>{m.balanceBefore}</td>
                        <td style={st.td}>{m.balanceAfter}</td>
                        <td style={{ ...st.td, fontSize: '11px' }}>{m.referenceNumber || m.note || '—'}</td>
                        <td style={{ ...st.td, fontSize: '11px', color: '#94a3b8' }}>
                          {new Date(m.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <div style={{ textAlign: 'right', marginTop: '1rem' }}>
              <button onClick={() => setLedgerProduct(null)} style={st.cancelBtn}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const st = {
  page: { maxWidth: '1300px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '13px', color: '#64748b', marginTop: '4px' },
  refreshBtn: {
    display: 'flex', alignItems: 'center', gap: '0.375rem',
    padding: '0.625rem 1rem', border: '1.5px solid #e2e8f0',
    borderRadius: '10px', background: 'white', cursor: 'pointer',
    fontSize: '13px', fontWeight: 600, color: '#374151',
  },

  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.25rem' },
  summaryCard: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    background: 'white', borderRadius: '14px', padding: '1.25rem',
    border: '1.5px solid', boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },

  filterRow: { display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' },
  searchInput: {
    flex: 1, minWidth: '200px',
    padding: '0.625rem 0.875rem', border: '1.5px solid #e2e8f0',
    borderRadius: '10px', fontSize: '14px', outline: 'none',
  },
  filterBtn: {
    padding: '0.5rem 1rem', border: '1.5px solid #e2e8f0',
    borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
  },

  tableWrap: { background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { background: '#f8fafc' },
  th: { padding: '0.875rem 1rem', fontSize: '11px', fontWeight: 700, color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' },
  tableRow: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '13px', color: '#374151' },
  catChip: { padding: '2px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontSize: '11px', fontWeight: 600 },
  badge: { padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' },

  actionBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '3px',
    padding: '4px 10px', borderRadius: '7px',
    border: 'none', cursor: 'pointer',
    background: '#f3e8ff', color: '#7c3aed', fontSize: '12px', fontWeight: 600,
  },

  loading: { padding: '2rem', textAlign: 'center', color: '#94a3b8' },

  // Modal
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white', borderRadius: '20px',
    padding: '2rem', width: '100%', maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  formGroup: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' },
  input: {
    width: '100%', padding: '0.7rem 0.875rem',
    border: '1.5px solid #e2e8f0', borderRadius: '10px',
    fontSize: '14px', color: '#0f172a',
  },
  cancelBtn: {
    padding: '0.625rem 1.25rem', border: '1.5px solid #e2e8f0',
    borderRadius: '10px', background: 'white', cursor: 'pointer',
    fontSize: '13px', fontWeight: 600,
  },
  saveBtn: {
    padding: '0.625rem 1.5rem', border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(135deg,#10b981,#059669)',
    color: 'white', cursor: 'pointer',
    fontSize: '13px', fontWeight: 700,
  },
};
