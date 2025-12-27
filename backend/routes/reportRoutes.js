const express = require('express');
const router = express.Router();
const {
  getDailySales,
  getDateRangeSales,
  getStaffSales,
  getTopProducts,
} = require('../controllers/reportController');
const { protect, isAdmin } = require('../middleware/auth');
const { dateRangeValidation, validate } = require('../middleware/validator');

// All report routes require admin access
router.use(protect, isAdmin);

router.get('/daily', getDailySales);
router.get('/date-range', dateRangeValidation, validate, getDateRangeSales);
router.get('/staff', dateRangeValidation, validate, getStaffSales);
router.get('/top-products', dateRangeValidation, validate, getTopProducts);

module.exports = router;
