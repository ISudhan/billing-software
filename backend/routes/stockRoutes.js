const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const { getStockList, getProductLedger, adjustStock, getStockAlerts } = require('../controllers/stockController');

router.use(protect);

router.get('/', getStockList);
router.get('/alerts', getStockAlerts);
router.get('/:productId/ledger', getProductLedger);
router.post('/:productId/adjust', isAdmin, adjustStock);

module.exports = router;
