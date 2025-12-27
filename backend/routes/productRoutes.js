const express = require('express');
const router = express.Router();
const {
  getProducts,
  getCategories,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, isAdmin } = require('../middleware/auth');
const {
  createProductValidation,
  updateProductValidation,
  validate,
} = require('../middleware/validator');

// Public routes (require authentication)
router.get('/', protect, getProducts);
router.get('/categories', protect, getCategories);
router.get('/:id', protect, getProduct);

// Admin-only routes
router.post('/', protect, isAdmin, createProductValidation, validate, createProduct);
router.put('/:id', protect, isAdmin, updateProductValidation, validate, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

module.exports = router;
