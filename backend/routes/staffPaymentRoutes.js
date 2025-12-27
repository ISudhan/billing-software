const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  createWorkRecord,
  getWorkRecords,
  getWorkRecord,
  updateWorkRecord,
  addPayment,
  getStaffSummary,
  deleteWorkRecord,
  getPaymentStats,
} = require('../controllers/staffPaymentController');

// All routes are admin-only
router.use(protect, restrictTo('ADMIN'));

router.route('/').get(getWorkRecords).post(createWorkRecord);

router.get('/stats', getPaymentStats);

router.get('/staff/:staffId/summary', getStaffSummary);

router
  .route('/:id')
  .get(getWorkRecord)
  .put(updateWorkRecord)
  .delete(deleteWorkRecord);

router.post('/:id/payment', addPayment);

module.exports = router;
