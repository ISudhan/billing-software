const express = require('express');
const router = express.Router();
const {
  createBill,
  getBills,
  getBill,
  getBillByNumber,
  voidBill,
} = require('../controllers/billController');
const { protect, isAdmin } = require('../middleware/auth');
const {
  createBillValidation,
  voidBillValidation,
  validate,
} = require('../middleware/validator');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getBills)
  .post(createBillValidation, validate, createBill);

router.get('/:id', getBill);
router.get('/number/:billNumber', getBillByNumber);

// Admin-only routes
router.put('/:id/void', isAdmin, voidBillValidation, validate, voidBill);

module.exports = router;
