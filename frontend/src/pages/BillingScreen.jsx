import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../components/Layout';
import { getText } from '../utils/translations';
import { Plus, Minus, Trash2, ShoppingCart, Image as ImageIcon } from 'lucide-react';

export default function BillingScreen() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    // Load products - mock data
    const mockProducts = [
      { id: 1, name: 'Rice', nameTamil: 'அரிசி', price: 50, category: 'Groceries', enabled: true, image: null },
      { id: 2, name: 'Wheat', nameTamil: 'கோதுமை', price: 45, category: 'Groceries', enabled: true, image: null },
      { id: 3, name: 'Sugar', nameTamil: 'சர்க்கரை', price: 40, category: 'Groceries', enabled: true, image: null },
      { id: 4, name: 'Tea', nameTamil: 'தேநீர்', price: 250, category: 'Beverages', enabled: true, image: null },
      { id: 5, name: 'Coffee', nameTamil: 'காபி', price: 350, category: 'Beverages', enabled: true, image: null },
      { id: 6, name: 'Salt', nameTamil: 'உப்பு', price: 20, category: 'Groceries', enabled: true, image: null },
    ];
    setProducts(mockProducts.filter(p => p.enabled));
  }, []);

  const categories = ['ALL', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.nameTamil.includes(searchTerm);
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      // No confirmation - instant removal per UX requirements
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      alert(getText('Please add items to cart', language));
      return;
    }
    
    // Save current bill to sessionStorage to prevent data loss
    sessionStorage.setItem('currentBill', JSON.stringify({
      items: cart,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    }));
    
    navigate('/payment', { state: { cart, total: calculateTotal() } });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <ShoppingCart size={32} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
          {getText('New Bill', language)}
        </h1>
        <div style={styles.userInfo}>
          <span className="badge badge-primary" style={{ fontSize: '14px', padding: '0.5rem 1rem' }}>
            {getText('Cashier', language)}: {user.name}
          </span>
        </div>
      </div>

      <div className="billing-layout" style={styles.content}>
        {/* Products Section - Left/Main Area */}
        <div style={styles.productsSection} className="products-section">
          <div style={styles.searchBar}>
            <input
              type="text"
              placeholder={getText('Search products', language) + '...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              className="input-field"
            />
          </div>

          <div style={styles.categories}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? 'btn btn-primary' : 'btn'}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '14px',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={styles.productGrid} className="pos-product-grid">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                style={styles.productCard} 
                className="pos-product-card card-hover"
                onClick={() => addToCart(product)}
              >
                {product.image ? (
                  <img src={product.image} alt={product.name} style={styles.productImage} />
                ) : (
                  <div style={styles.productImagePlaceholder}>
                    <ImageIcon size={32} color="#9ca3af" />
                  </div>
                )}
                <div style={styles.productInfo}>
                  {/* ALWAYS show both languages - NOT affected by language toggle */}
                  <div className="pos-product-name-en">{product.name}</div>
                  <div className="pos-product-name-ta tamil-text">{product.nameTamil}</div>
                  <div style={styles.productPrice}>₹{product.price}</div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div style={styles.noResults}>
              {getText('No products found', language)}
            </div>
          )}
        </div>

        {/* Cart Section - Right Panel (Always Visible) */}
        <div style={styles.cartSection} className="pos-bill-panel bill-panel-sticky">
          <div style={styles.cartHeader}>
            <ShoppingCart size={22} />
            <span style={{ flex: 1 }}>{getText('Cart', language)}</span>
            <span className="badge badge-primary">{cart.length}</span>
          </div>

          <div style={styles.cartItems}>
            {cart.length === 0 ? (
              <div style={styles.emptyCart}>
                <ShoppingCart size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                <div>{getText('Cart is empty', language)}</div>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} style={styles.cartItem}>
                  <div style={styles.cartItemInfo}>
                    {/* Cart items also show both languages always */}
                    <div style={styles.cartItemName}>{item.name} / {item.nameTamil}</div>
                    <div style={styles.cartItemPrice}>₹{item.price} × {item.quantity}</div>
                  </div>
                  
                  <div style={styles.cartItemActions}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, item.quantity - 1);
                      }}
                      className="btn-icon"
                      style={styles.qtyBtn}
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, parseInt(e.target.value) || 0);
                      }}
                      style={styles.qtyInput}
                      min="1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, item.quantity + 1);
                      }}
                      className="btn-icon"
                      style={styles.qtyBtn}
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // No confirmation - instant removal per UX requirements
                        removeFromCart(item.id);
                      }}
                      className="btn-icon btn-danger"
                      style={styles.deleteBtn}
                      title={getText('Delete', language)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={styles.cartItemTotal}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={styles.cartFooter}>
            <div style={styles.total}>
              <span>{getText('Total Amount', language)}:</span>
              <span style={styles.totalAmount}>₹{calculateTotal().toFixed(2)}</span>
            </div>
            <button
              onClick={handleProceedToPayment}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                padding: '1.25rem',
                fontSize: '16px',
                opacity: cart.length === 0 ? 0.5 : 1,
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              }}
              disabled={cart.length === 0}
            >
              {getText('Proceed to Payment', language)} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '0',
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid var(--border-color, #e5e7eb)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--text-primary, #1e293b)',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
  },
  userInfo: {
    color: '#64748b',
    fontSize: '14px',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem',
    height: 'calc(100vh - 180px)',
  },
  productsSection: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: 'var(--radius-lg, 12px)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-md, 0 4px 6px rgba(0,0,0,0.1))',
    overflow: 'auto',
  },
  searchBar: {
    marginBottom: '1rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '2px solid var(--border-color, #e5e7eb)',
    borderRadius: 'var(--radius-md, 8px)',
    fontSize: '15px',
    transition: 'border-color 0.2s',
  },
  categories: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
  },
  productCard: {
    padding: '1rem',
    border: '2px solid var(--border-color, #e5e7eb)',
    borderRadius: 'var(--radius-lg, 12px)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#ffffff',
    minHeight: '200px',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  productImage: {
    width: '100%',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '0.75rem',
  },
  productInfo: {
    textAlign: 'center',
  },
  productPrice: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--primary-color, #2563eb)',
    marginTop: '0.5rem',
  },
  noResults: {
    textAlign: 'center',
    padding: '3rem',
    color: '#94a3b8',
    fontSize: '16px',
  },
  cartSection: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: 'var(--radius-lg, 12px)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-md, 0 4px 6px rgba(0,0,0,0.1))',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  cartHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid var(--border-color, #e5e7eb)',
    color: 'var(--text-primary, #1e293b)',
  },
  cartItems: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '1rem',
  },
  emptyCart: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: '3rem 1rem',
    fontSize: '15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartItem: {
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s',
  },
  cartItemInfo: {
    marginBottom: '0.75rem',
  },
  cartItemName: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#1e293b',
    marginBottom: '0.25rem',
  },
  cartItemPrice: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '0.25rem',
  },
  cartItemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  qtyBtn: {
    padding: '0.5rem',
    border: '2px solid #e5e7eb',
    backgroundColor: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  qtyInput: {
    width: '60px',
    padding: '0.5rem',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '600',
  },
  deleteBtn: {
    padding: '0.5rem',
    marginLeft: 'auto',
  },
  cartItemTotal: {
    textAlign: 'right',
    fontWeight: '700',
    fontSize: '16px',
    color: 'var(--primary-color, #2563eb)',
  },
  cartFooter: {
    borderTop: '2px solid var(--border-color, #e5e7eb)',
    paddingTop: '1rem',
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '1rem',
    color: 'var(--text-primary, #1e293b)',
  },
  totalAmount: {
    color: 'var(--primary-color, #2563eb)',
    fontSize: '24px',
    fontWeight: '700',
  },
};
