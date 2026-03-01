import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useLanguage } from '../components/Layout';
import { getText } from '../utils/translations';
import {
  Plus, Minus, Trash2, ShoppingCart, AlertCircle,
  Search, Camera, Sun, Zap, Battery, Lightbulb, Wrench, Package, ScanLine, X
} from 'lucide-react';

// Category display config
const CATEGORY_CONFIG = {
  'CCTV Cameras':       { icon: Camera,     color: '#8b5cf6', bg: '#f5f3ff', border: '#c4b5fd' },
  'Solar Water Heaters':{ icon: Sun,        color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  'Inverters':          { icon: Zap,        color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  'Batteries':          { icon: Battery,    color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  'Solar Street Lights':{ icon: Lightbulb,  color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
  'Accessories':        { icon: Wrench,     color: '#06b6d4', bg: '#ecfeff', border: '#a5f3fc' },
};
const DEFAULT_CAT = { icon: Package, color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
const getCat = (c) => CATEGORY_CONFIG[c] || DEFAULT_CAT;

function StockBadge({ product }) {
  const stock = product.stockQuantity ?? 999;
  const threshold = product.lowStockThreshold ?? 5;

  if (stock === 0) return (
    <span style={{ ...badge, background: '#fee2e2', color: '#dc2626' }}>
      🔴 Out of Stock
    </span>
  );
  if (stock <= threshold) return (
    <span style={{ ...badge, background: '#fef3c7', color: '#92400e' }}>
      🟡 Low ({stock} left)
    </span>
  );
  return (
    <span style={{ ...badge, background: '#dcfce7', color: '#15803d' }}>
      🟢 {stock} in stock
    </span>
  );
}

const badge = {
  fontSize: '10px', fontWeight: 700,
  padding: '2px 6px', borderRadius: '6px',
  display: 'inline-flex', alignItems: 'center', gap: '3px',
};

export default function BillingScreen() {
  const { user } = useAuth();
  const { products, categories: productCategories, loading, error, refreshProducts } = useProducts();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const barcodeRef = useRef('');
  const barcodeTimerRef = useRef(null);

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [barcodeMode, setBarcodeMode] = useState(false);
  const [scanFeedback, setScanFeedback] = useState('');

  useEffect(() => {
    if (products.length === 0 && !loading && !error) refreshProducts();
  }, []);

  // ── Barcode scanner: capture keyboard input when barcodeMode is on ──────────
  const handleBarcodeKeydown = useCallback((e) => {
    if (!barcodeMode) return;
    // Barcode scanners emit characters rapidly ending with Enter
    if (e.key === 'Enter') {
      const code = barcodeRef.current.trim();
      barcodeRef.current = '';
      if (code) {
        const product = products.find(p => p.barcode === code);
        if (product) {
          addToCart(product);
          setScanFeedback(`✅ Added: ${product.name}`);
        } else {
          setScanFeedback(`❌ No product found for barcode: ${code}`);
        }
        setTimeout(() => setScanFeedback(''), 2500);
      }
    } else if (e.key.length === 1) {
      barcodeRef.current += e.key;
      clearTimeout(barcodeTimerRef.current);
      barcodeTimerRef.current = setTimeout(() => { barcodeRef.current = ''; }, 100);
    }
  }, [barcodeMode, products]);

  useEffect(() => {
    window.addEventListener('keydown', handleBarcodeKeydown);
    return () => window.removeEventListener('keydown', handleBarcodeKeydown);
  }, [handleBarcodeKeydown]);

  const categories = ['ALL', ...productCategories];

  const filteredProducts = products.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.nameTamil.includes(searchTerm) ||
      p.category.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(searchTerm));
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const getCartItem = (productId) => cart.find(i => i.id === productId);
  const getCartQty = (productId) => getCartItem(productId)?.quantity || 0;

  const addToCart = (product) => {
    const stock = product.stockQuantity ?? 999;
    const currentQty = getCartQty(product._id);

    if (stock === 0) return; // out of stock — blocked
    if (currentQty >= stock) {
      setScanFeedback(`⚠️ Max stock reached for ${product.name} (${stock} available)`);
      setTimeout(() => setScanFeedback(''), 2500);
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.id === product._id);
      if (existing) {
        return prev.map(i => i.id === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: product._id,
        productId: product._id,
        name: product.name,
        nameTamil: product.nameTamil,
        price: product.price,
        category: product.category,
        stockQuantity: product.stockQuantity,
        quantity: 1,
      }];
    });
  };

  const updateQuantity = (productId, qty) => {
    const product = products.find(p => p._id === productId);
    const maxStock = product?.stockQuantity ?? 999;
    if (qty <= 0) removeFromCart(productId);
    else if (qty > maxStock) return;
    else setCart(cart.map(i => i.id === productId ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (productId) => setCart(cart.filter(i => i.id !== productId));
  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Clear all items from cart?')) setCart([]);
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleProceedToPayment = () => {
    if (cart.length === 0) return;
    navigate('/payment', {
      state: {
        cart: cart.map(i => ({
          id: i.id,
          productId: i.id,
          name: i.name,
          nameTamil: i.nameTamil,
          price: i.price,
          quantity: i.quantity,
          category: i.category,
        }))
      }
    });
  };

  return (
    <div style={styles.wrapper}>
      {/* ── LHS: Product Grid ── */}
      <div style={styles.productPane}>

        {/* Header row */}
        <div style={styles.productHeader}>
          <h1 style={styles.pageTitle}>🛒 New Bill</h1>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Barcode toggle */}
            <button
              onClick={() => setBarcodeMode(!barcodeMode)}
              style={{
                ...styles.barcodeBtn,
                background: barcodeMode ? 'linear-gradient(135deg,#0ea5e9,#2563eb)' : 'white',
                color: barcodeMode ? 'white' : '#0ea5e9',
                borderColor: '#0ea5e9',
              }}
              title={barcodeMode ? 'Barcode scan mode ON — scanning keyboard' : 'Click to enable barcode scanner'}
            >
              <ScanLine size={18} />
              {barcodeMode ? 'Scanning…' : 'Barcode'}
            </button>
          </div>
        </div>

        {/* Scan feedback */}
        {scanFeedback && (
          <div style={{
            ...styles.scanFeedback,
            background: scanFeedback.startsWith('✅') ? '#dcfce7' : scanFeedback.startsWith('⚠️') ? '#fef3c7' : '#fee2e2',
            color: scanFeedback.startsWith('✅') ? '#15803d' : scanFeedback.startsWith('⚠️') ? '#92400e' : '#dc2626',
          }}>
            {scanFeedback}
          </div>
        )}

        {/* Search bar */}
        <div style={styles.searchBox}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search products, Tamil name, barcode…"
            style={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={styles.clearSearch}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div style={styles.catScroll}>
          {categories.map(cat => {
            const active = selectedCategory === cat;
            const cfg = cat === 'ALL' ? { color: '#0f172a', bg: '#f1f5f9', border: '#cbd5e1' } : getCat(cat);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  ...styles.catBtn,
                  background: active ? cfg.bg : 'white',
                  color: active ? cfg.color : '#64748b',
                  borderColor: active ? cfg.border : '#e2e8f0',
                  fontWeight: active ? 700 : 500,
                }}
              >
                {cat === 'ALL' ? '📦 All' : cat}
              </button>
            );
          })}
        </div>

        {/* Product grid */}
        {loading && <div style={styles.centerMsg}>Loading products…</div>}
        {error   && <div style={{ ...styles.centerMsg, color: '#dc2626' }}><AlertCircle size={20} /> {error}</div>}

        <div style={styles.productGrid}>
          {filteredProducts.map(product => {
            const cfg = getCat(product.category);
            const Icon = cfg.icon;
            const inCart = getCartQty(product._id);
            const stockQty = product.stockQuantity ?? 999;
            const outOfStock = stockQty === 0;

            return (
              <button
                key={product._id}
                onClick={() => !outOfStock && addToCart(product)}
                disabled={outOfStock}
                style={{
                  ...styles.productCard,
                  borderColor: inCart > 0 ? cfg.color : cfg.border,
                  background: outOfStock ? '#f8fafc' : inCart > 0 ? cfg.bg : 'white',
                  opacity: outOfStock ? 0.6 : 1,
                  cursor: outOfStock ? 'not-allowed' : 'pointer',
                  boxShadow: inCart > 0 ? `0 0 0 2px ${cfg.color}40` : undefined,
                }}
              >
                {/* Category icon area */}
                <div style={{ ...styles.catIconArea, background: cfg.bg }}>
                  <Icon size={26} color={outOfStock ? '#94a3b8' : cfg.color} />
                </div>

                {/* In-cart badge */}
                {inCart > 0 && (
                  <div style={{ ...styles.cartBadge, background: cfg.color }}>
                    {inCart}
                  </div>
                )}

                <div style={styles.cardBody}>
                  <div style={styles.productName}>{product.name}</div>
                  <div style={styles.productTamil} className="tamil-text">{product.nameTamil}</div>
                  <div style={styles.priceRow}>
                    <span style={{ ...styles.price, color: outOfStock ? '#94a3b8' : cfg.color }}>
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.gstRate > 0 && (
                      <span style={styles.gstTag}>GST {product.gstRate}%</span>
                    )}
                  </div>
                  <StockBadge product={product} />
                </div>
              </button>
            );
          })}

          {filteredProducts.length === 0 && !loading && (
            <div style={{ ...styles.centerMsg, gridColumn: '1 / -1' }}>
              No products found. Try a different search.
            </div>
          )}
        </div>
      </div>

      {/* ── RHS: Cart ── */}
      <div style={styles.cartPane}>
        <div style={styles.cartHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={20} color="#0f172a" />
            <span style={styles.cartTitle}>Cart</span>
            {cartCount > 0 && (
              <span style={styles.cartCountBadge}>{cartCount}</span>
            )}
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} style={styles.clearCartBtn}>Clear All</button>
          )}
        </div>

        {cart.length === 0 ? (
          <div style={styles.emptyCart}>
            <ShoppingCart size={48} color="#cbd5e1" />
            <p style={{ color: '#94a3b8', marginTop: '1rem', fontSize: '14px' }}>
              Cart is empty.<br />Click a product to add.
            </p>
          </div>
        ) : (
          <>
            <div style={styles.cartItems}>
              {cart.map(item => {
                const product = products.find(p => p._id === item.id);
                const maxStock = product?.stockQuantity ?? 999;
                return (
                  <div key={item.id} style={styles.cartItem}>
                    <div style={styles.cartItemName}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>₹{item.price.toLocaleString('en-IN')} each</div>
                    </div>
                    <div style={styles.cartQtyRow}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}><Minus size={14} /></button>
                      <span style={styles.qtyNum}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= maxStock}
                        style={{ ...styles.qtyBtn, opacity: item.quantity >= maxStock ? 0.4 : 1 }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div style={styles.cartItemTotal}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                    <button onClick={() => removeFromCart(item.id)} style={styles.removeBtn}><Trash2 size={14} /></button>
                  </div>
                );
              })}
            </div>

            <div style={styles.cartFooter}>
              <div style={styles.totalRow}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Subtotal ({cartCount} items)</span>
                <span style={styles.totalAmount}>₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={styles.gstNote}>* Final total incl. GST calculated at checkout</div>
              <button onClick={handleProceedToPayment} style={styles.checkoutBtn}>
                Proceed to Payment →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '1.25rem',
    alignItems: 'start',
    minHeight: 'calc(100vh - 76px)',
  },

  // Product pane
  productPane: { display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 },
  productHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 },

  barcodeBtn: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.5rem 0.875rem', border: '1.5px solid', borderRadius: '10px',
    cursor: 'pointer', fontSize: '13px', fontWeight: 700, transition: 'all 0.15s',
  },

  scanFeedback: {
    padding: '0.625rem 1rem', borderRadius: '10px',
    fontSize: '13px', fontWeight: 600, marginTop: '-0.25rem',
    border: '1px solid transparent',
  },

  searchBox: {
    display: 'flex', alignItems: 'center', gap: '0.625rem',
    background: 'white', border: '1.5px solid #e2e8f0',
    borderRadius: '12px', padding: '0.625rem 1rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  searchInput: {
    flex: 1, border: 'none', outline: 'none', fontSize: '14px',
    color: '#0f172a', background: 'transparent',
  },
  clearSearch: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' },

  catScroll: {
    display: 'flex', gap: '0.5rem', overflowX: 'auto',
    paddingBottom: '4px', flexWrap: 'wrap',
  },
  catBtn: {
    flexShrink: 0, padding: '0.4rem 0.875rem',
    border: '1.5px solid', borderRadius: '8px',
    cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },

  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '0.875rem',
  },
  productCard: {
    position: 'relative', display: 'flex', flexDirection: 'column',
    border: '1.5px solid', borderRadius: '14px', overflow: 'hidden',
    textAlign: 'left', transition: 'all 0.15s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  catIconArea: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '72px',
  },
  cartBadge: {
    position: 'absolute', top: '8px', right: '8px',
    width: '22px', height: '22px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: 800, color: 'white',
    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
  },
  cardBody: { padding: '0.625rem 0.75rem 0.75rem', flex: 1 },
  productName: { fontSize: '13px', fontWeight: 700, color: '#0f172a', lineHeight: 1.3, marginBottom: '2px' },
  productTamil: { fontSize: '10px', color: '#94a3b8', marginBottom: '4px' },
  priceRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' },
  price: { fontSize: '15px', fontWeight: 800 },
  gstTag: {
    fontSize: '9px', fontWeight: 700, padding: '1px 5px',
    background: '#f1f5f9', color: '#64748b', borderRadius: '4px',
  },

  centerMsg: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.5rem', padding: '3rem', fontSize: '14px', color: '#64748b',
    gridColumn: '1 / -1',
  },

  // Cart
  cartPane: {
    background: 'white', borderRadius: '20px',
    border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column',
    position: 'sticky', top: '90px',
    maxHeight: 'calc(100vh - 120px)',
    overflow: 'hidden',
  },
  cartHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #f1f5f9',
  },
  cartTitle: { fontSize: '16px', fontWeight: 800, color: '#0f172a' },
  cartCountBadge: {
    background: 'linear-gradient(135deg,#10b981,#059669)',
    color: 'white', borderRadius: '99px',
    fontSize: '11px', fontWeight: 800,
    padding: '1px 7px',
  },
  clearCartBtn: {
    background: 'none', border: '1px solid #fecaca', borderRadius: '7px',
    color: '#ef4444', fontSize: '12px', fontWeight: 600,
    padding: '3px 8px', cursor: 'pointer',
  },

  emptyCart: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '2rem', textAlign: 'center',
  },

  cartItems: { flex: 1, overflowY: 'auto', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' },
  cartItem: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.625rem 0.75rem', background: '#f8fafc',
    borderRadius: '10px', border: '1px solid #f1f5f9',
  },
  cartItemName: { flex: 1, minWidth: 0 },
  cartQtyRow: { display: 'flex', alignItems: 'center', gap: '0.25rem' },
  qtyBtn: {
    width: '26px', height: '26px', borderRadius: '7px',
    border: '1.5px solid #e2e8f0', background: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#64748b',
  },
  qtyNum: { fontSize: '14px', fontWeight: 700, color: '#0f172a', minWidth: '24px', textAlign: 'center' },
  cartItemTotal: { fontSize: '13px', fontWeight: 700, color: '#0f172a', minWidth: '60px', textAlign: 'right' },
  removeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#ef4444', padding: '4px', display: 'flex',
  },

  cartFooter: { borderTop: '1px solid #f1f5f9', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' },
  totalRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  totalAmount: { fontSize: '18px', fontWeight: 800, color: '#10b981' },
  gstNote: { fontSize: '10px', color: '#94a3b8' },
  checkoutBtn: {
    width: '100%', padding: '0.875rem',
    background: 'linear-gradient(135deg,#10b981,#059669)',
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '15px', fontWeight: 800, cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
  },
};
