import React, { createContext, useContext, useState, useEffect } from 'react';
import { productAPI } from '../services/api';

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Don't load on mount - let individual pages trigger loadProducts when needed
  // This prevents 401 errors before user logs in

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setProducts([]);
        setCategories([]);
        setLoading(false);
        return;
      }
      
      // Fetch products from backend - cashier sees active only, admin sees all
      const response = await productAPI.getProducts({ isActive: true });
      setProducts(response.products || []);

      // Extract unique categories
      const uniqueCategories = [...new Set(response.products.map(p => p.category))].sort();
      setCategories(uniqueCategories);
      
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Failed to load products from server');
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh products (call after CRUD operations)
  const refreshProducts = async () => {
    await loadProducts();
  };

  const value = {
    products,
    categories,
    loading,
    error,
    refreshProducts,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
