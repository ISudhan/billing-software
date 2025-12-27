import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../components/Layout';
import { getText } from '../utils/translations';
import { productAPI } from '../services/api';
import { useProducts } from '../context/ProductContext';
import { useAuth, ROLES } from '../context/AuthContext';

export default function ProductManagement() {
  const { language } = useLanguage();
  const { products: contextProducts, loading, error, refreshProducts } = useProducts();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (contextProducts.length > 0) {
      setProducts(contextProducts);
    }
  }, [contextProducts]);

  // Load products on mount if not already loaded
  useEffect(() => {
    if (contextProducts.length === 0 && !loading && !error) {
      refreshProducts();
    }
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(`Image too large. Max 2MB / படம் மிக பெரியது. அதிகபட்சம் 2MB`);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        if (editingProduct) {
          setEditingProduct({ ...editingProduct, imageUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
    setImagePreview(product.imageUrl);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingProduct.name || !editingProduct.nameTamil || !editingProduct.price) {
      alert(`${getText('Please fill all fields', language)}`);
      return;
    }

    if (editingProduct.price <= 0) {
      alert(`Price must be positive / விலை நேர்மறையாக இருக்க வேண்டும்`);
      return;
    }

    if (window.confirm(`${getText('Update product', language)}?`)) {
      try {
        setIsSaving(true);
        await productAPI.updateProduct(editingProduct._id, {
          name: editingProduct.name,
          nameTamil: editingProduct.nameTamil,
          price: editingProduct.price,
          category: editingProduct.category,
          enabled: editingProduct.enabled,
          imageUrl: editingProduct.imageUrl,
        });
        
        await refreshProducts();
        setIsEditing(false);
        setEditingProduct(null);
        setImagePreview(null);
        alert(`${getText('Success', language)}!`);
      } catch (error) {
        console.error('Failed to update product:', error);
        alert(error.message || `${getText('Failed to update product', language)}`);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingProduct(null);
    setImagePreview(null);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`${getText('Delete', language)} "${product.name}"?`)) {
      if (window.confirm(`${getText('Are you absolutely sure', language)}? ${getText('This cannot be undone', language)}.`)) {
        try {
          await productAPI.deleteProduct(product._id);
          await refreshProducts();
          alert(`${getText('Product deleted successfully', language)}`);
        } catch (error) {
          console.error('Failed to delete product:', error);
          alert(error.message || `${getText('Failed to delete product', language)}`);
        }
      }
    }
  };

  const toggleEnabled = async (product) => {
    const action = product.enabled ? 'disable' : 'enable';
    const actionTamil = product.enabled ? 'முடக்கு' : 'செயல்படுத்து';
    
    if (window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} "${product.name}"? / ${actionTamil} "${product.nameTamil}"?`)) {
      try {
        await productAPI.updateProduct(product._id, { enabled: !product.enabled });
        await refreshProducts();
      } catch (error) {
        console.error('Failed to toggle product:', error);
        alert(error.message || `${getText('Failed to update product', language)}`);
      }
    }
  };

  const handleAddProduct = () => {
    const newProduct = {
      name: '',
      nameTamil: '',
      price: 0,
      category: 'Groceries',
      enabled: true,
      imageUrl: '',
    };
    setEditingProduct(newProduct);
    setImagePreview(null);
    setShowAddForm(true);
  };

  const handleSaveNewProduct = async () => {
    if (!editingProduct.name || !editingProduct.nameTamil || !editingProduct.price) {
      alert(`${getText('Please fill all fields', language)}`);
      return;
    }

    if (editingProduct.price <= 0) {
      alert(`Price must be positive / விலை நேர்மறையாக இருக்க வேண்டும்`);
      return;
    }

    try {
      setIsSaving(true);
      await productAPI.createProduct(editingProduct);
      await refreshProducts();
      setShowAddForm(false);
      setEditingProduct(null);
      setImagePreview(null);
      alert(`${getText('Product added successfully', language)}`);
    } catch (error) {
      console.error('Failed to add product:', error);
      alert(error.message || `${getText('Failed to add product', language)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    setImagePreview(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{getText('Product Management', language)}</h1>
        <button onClick={handleAddProduct} style={styles.addBtn}>
          <Plus size={20} />
          {getText('Add Product', language)}
        </button>
      </div>

      {(showAddForm || isEditing) && editingProduct && (
        <div style={styles.editForm}>
          <h3 style={styles.formTitle}>
            {showAddForm ? getText('Add Product', language) : getText('Edit Product', language)}
          </h3>
          
          <div style={styles.formGrid}>
            <div style={styles.imageSection}>
              <div style={styles.imageUploadArea}>
                {imagePreview ? (
                  <div style={styles.imagePreviewContainer}>
                    <img src={imagePreview} alt="Product" style={styles.imagePreview} />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setEditingProduct({ ...editingProduct, image: null });
                      }}
                      style={styles.removeImageBtn}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label style={styles.uploadLabel}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={styles.fileInput}
                    />
                    <ImageIcon size={48} color="#9ca3af" />
                    <div style={styles.uploadText}>{getText('Upload Image', language)}</div>
                    <div style={styles.uploadHint}>Max 2MB / அதிகபட்சம் 2MB</div>
                  </label>
                )}
              </div>
            </div>

            <div style={styles.formFields}>
              <div style={styles.formGroup}>
                <label style={styles.label}>{getText('Product Name', language)} *</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  style={styles.input}
                  placeholder="e.g., Rice"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>{getText('Tamil Name', language)} *</label>
                <input
                  type="text"
                  value={editingProduct.nameTamil}
                  onChange={(e) => setEditingProduct({ ...editingProduct, nameTamil: e.target.value })}
                  style={styles.input}
                  placeholder="e.g., அரிசி"
                  className="tamil-text"
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>{getText('Price', language)} (₹) *</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    style={styles.input}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>{getText('Category', language)}</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    style={styles.input}
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div style={styles.formActions}>
                <button
                  onClick={showAddForm ? handleSaveNewProduct : handleSave}
                  style={styles.saveBtn}
                  disabled={isSaving}
                >
                  <Save size={18} />
                  {isSaving ? getText('Saving...', language) : getText('Save', language)}
                </button>
                <button
                  onClick={showAddForm ? handleCancelAdd : handleCancel}
                  style={styles.cancelBtn}
                  disabled={isSaving}
                >
                >
                  <X size={18} />
                  {getText('Cancel', language)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingText}>{getText('Loading products...', language)}</div>
        </div>
      )}

      {error && (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div style={styles.emptyState}>
          <p>{getText('No products found', language)}</p>
        </div>
      )}

      <div style={styles.productsGrid}>
        {products.map(product => (
          <div key={product._id} style={styles.productCard}>
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} style={styles.cardImage} />
            ) : (
              <div style={styles.cardImagePlaceholder}>
                <ImageIcon size={40} color="#d1d5db" />
              </div>
            )}
            
            <div style={styles.cardContent}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.productName}>{product.name}</h3>
                  <p style={styles.productNameTamil} className="tamil-text">{product.nameTamil}</p>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: product.enabled ? '#dcfce7' : '#fee2e2',
                  color: product.enabled ? '#15803d' : '#b91c1c',
                }}>
                  {product.enabled ? getText('Active', language) : getText('Disabled', language)}
                </span>
              </div>

              <div style={styles.cardDetails}>
                <div style={styles.priceRow}>
                  <span style={styles.priceLabel}>{getText('Price', language)}:</span>
                  <span style={styles.price}>₹{product.price}</span>
                </div>
                <div style={styles.categoryRow}>
                  <span style={styles.categoryLabel}>{getText('Category', language)}:</span>
                  <span style={styles.category}>{product.category}</span>
                </div>
              </div>

              <div style={styles.cardActions}>
                <button onClick={() => handleEdit(product)} style={styles.editBtn}>
                  <Edit size={16} />
                  {getText('Edit', language)}
                </button>
                <button
                  onClick={() => toggleEnabled(product)}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: product.enabled ? '#fef3c7' : '#dcfce7',
                    color: product.enabled ? '#92400e' : '#15803d',
                  }}
                >
                  {product.enabled ? getText('Disable', language) : getText('Enable', language)}
                </button>
                {user?.role === ROLES.ADMIN && (
                  <button onClick={() => handleDelete(product)} style={styles.deleteBtn}>
                    <Trash2 size={16} />
                    {getText('Delete', language)}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div style={styles.emptyState}>
          <p>{getText('No products found', language)}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addBtn: {
    padding: '1rem 1.5rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '16px',
    fontWeight: '600',
  },
  editForm: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    color: '#1f2937',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '2rem',
  },
  imageSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  imageUploadArea: {
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
  },
  uploadLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
  },
  fileInput: {
    display: 'none',
  },
  uploadText: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#4b5563',
  },
  uploadHint: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'contain',
    borderRadius: '8px',
  },
  removeImageBtn: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    padding: '0.5rem',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  formFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  label: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '0.875rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '15px',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  saveBtn: {
    padding: '1rem 1.75rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '16px',
    fontWeight: '600',
  },
  cancelBtn: {
    padding: '1rem 1.75rem',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '16px',
    fontWeight: '600',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '180px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
  },
  cardContent: {
    padding: '1.25rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '1rem',
  },
  productName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  productNameTamil: {
    fontSize: '14px',
    color: '#6b7280',
  },
  statusBadge: {
    padding: '0.375rem 0.875rem',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: '600',
  },
  cardDetails: {
    marginBottom: '1rem',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  priceLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  price: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2563eb',
  },
  categoryRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  categoryLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  category: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4b5563',
  },
  cardActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editBtn: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontSize: '14px',
    fontWeight: '600',
  },
  toggleBtn: {
    flex: 1,
    padding: '0.75rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  deleteBtn: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontSize: '14px',
    fontWeight: '600',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '3rem',
  },
  loadingText: {
    fontSize: '16px',
    color: '#6b7280',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '14px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem',
    color: '#9ca3af',
    fontSize: '16px',
  },
};
