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
const { protect, isAdmin, restrictTo } = require('../middleware/auth');
const {
  createProductValidation,
  updateProductValidation,
  validate,
} = require('../middleware/validator');

// Public routes (require authentication)
router.get('/', protect, getProducts);
router.get('/categories', protect, getCategories);
router.get('/:id', protect, getProduct);

// Cashier and Admin can create/update products
router.post('/', protect, restrictTo('ADMIN', 'CASHIER'), createProductValidation, validate, createProduct);
router.put('/:id', protect, restrictTo('ADMIN', 'CASHIER'), updateProductValidation, validate, updateProduct);

// Only Admin can delete products
router.delete('/:id', protect, isAdmin, deleteProduct);

module.exports = router;
