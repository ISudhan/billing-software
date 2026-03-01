const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');
const AppError = require('../utils/AppError');
const { logAuditAction } = require('../utils/auditLogger');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/stock
// Returns all products with stock status — admin sees all, cashier sees active
// ─────────────────────────────────────────────────────────────────────────────
const getStockList = async (req, res, next) => {
  try {
    const { lowStock, outOfStock, category } = req.query;

    const filter = {};
    if (req.user.role === 'CASHIER') filter.isActive = true;

    if (outOfStock === 'true') {
      filter.stockQuantity = 0;
    } else if (lowStock === 'true') {
      filter.$expr = { $lte: ['$stockQuantity', '$lowStockThreshold'] };
    }

    if (category) filter.category = category;

    const products = await Product.find(filter)
      .sort({ stockQuantity: 1, name: 1 })
      .lean({ virtuals: true });

    const lowStockCount = await Product.countDocuments({
      isActive: true,
      $expr: { $and: [
        { $gt: ['$stockQuantity', 0] },
        { $lte: ['$stockQuantity', '$lowStockThreshold'] }
      ]},
    });

    const outOfStockCount = await Product.countDocuments({
      isActive: true,
      stockQuantity: 0,
    });

    res.status(200).json({
      success: true,
      summary: { lowStockCount, outOfStockCount, totalProducts: products.length },
      products,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/stock/:productId/ledger
// Returns stock movement history for a specific product
// ─────────────────────────────────────────────────────────────────────────────
const getProductLedger = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const product = await Product.findById(req.params.productId).lean({ virtuals: true });
    if (!product) return next(new AppError('Product not found', 404));

    const [movements, total] = await Promise.all([
      StockLedger.find({ productId: req.params.productId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      StockLedger.countDocuments({ productId: req.params.productId }),
    ]);

    res.status(200).json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        currentStock: product.stockQuantity,
        stockStatus: product.stockStatus,
        lowStockThreshold: product.lowStockThreshold,
      },
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      movements,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/stock/:productId/adjust  [Admin only]
// Manual stock adjustment (e.g., physical count correction)
// Body: { quantity, note }  — quantity can be negative (shrinkage)
// ─────────────────────────────────────────────────────────────────────────────
const adjustStock = async (req, res, next) => {
  try {
    const { quantity, note } = req.body;

    if (quantity === undefined || quantity === null) {
      return next(new AppError('Quantity is required', 400));
    }

    const qtyNum = parseInt(quantity);
    if (isNaN(qtyNum)) return next(new AppError('Quantity must be a number', 400));

    const product = await Product.findById(req.params.productId);
    if (!product) return next(new AppError('Product not found', 404));

    const balanceBefore = product.stockQuantity;
    const newStock = balanceBefore + qtyNum;

    if (newStock < 0) {
      return next(new AppError(`Cannot reduce stock below 0. Current: ${balanceBefore}, adjustment: ${qtyNum}`, 400));
    }

    product.stockQuantity = newStock;
    product.updatedBy = req.user._id;
    await product.save();

    // Write ledger entry
    await StockLedger.create({
      productId: product._id,
      productName: product.name,
      movementType: 'MANUAL_ADJUSTMENT',
      quantityChange: qtyNum,
      balanceBefore,
      balanceAfter: newStock,
      referenceType: 'Manual',
      note: note || 'Manual stock adjustment',
      performedBy: req.user._id,
      performedByName: req.user.name,
    });

    await logAuditAction({
      action: 'STOCK_ADJUSTED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetModel: 'Product',
      targetId: product._id,
      details: { productName: product.name, quantityChange: qtyNum, balanceBefore, balanceAfter: newStock, note },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Stock adjusted by ${qtyNum > 0 ? '+' : ''}${qtyNum}`,
      product: {
        id: product._id,
        name: product.name,
        stockQuantity: product.stockQuantity,
        stockStatus: product.stockStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/stock/alerts
// Low-stock and out-of-stock summary for dashboard
// ─────────────────────────────────────────────────────────────────────────────
const getStockAlerts = async (req, res, next) => {
  try {
    const [outOfStock, lowStock] = await Promise.all([
      Product.find({ isActive: true, stockQuantity: 0 })
        .select('name nameTamil category stockQuantity lowStockThreshold')
        .lean(),
      Product.find({
        isActive: true,
        stockQuantity: { $gt: 0 },
        $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
      })
        .select('name nameTamil category stockQuantity lowStockThreshold')
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      outOfStock: { count: outOfStock.length, products: outOfStock },
      lowStock: { count: lowStock.length, products: lowStock },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStockList, getProductLedger, adjustStock, getStockAlerts };
