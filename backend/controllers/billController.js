const Bill = require('../models/Bill');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const AppError = require('../utils/AppError');
const { logAuditAction } = require('../utils/auditLogger');

/**
 * @route   POST /api/bills
 * @desc    Create and finalize a new bill
 * @access  Private
 */
const createBill = async (req, res, next) => {
  try {
    const { items, paymentMode } = req.body;

    // Validate items and fetch product details
    const productIds = items.map((item) => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    }).lean();

    if (products.length !== items.length) {
      return next(new AppError('One or more products are invalid or inactive', 400));
    }

    // Build bill items with product details
    const billItems = items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId);
      
      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, 400);
      }

      const subtotal = product.price * item.quantity;

      return {
        productId: product._id,
        name: product.name,
        nameTamil: product.nameTamil,
        price: product.price,
        quantity: item.quantity,
        subtotal,
      };
    });

    // Calculate total
    const total = billItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Generate collision-proof bill number using atomic counter
    const billNumber = await Settings.getNextBillNumber();

    // Create bill
    const bill = await Bill.create({
      billNumber,
      items: billItems,
      total,
      paymentMode,
      status: 'PAID',
      isFinalized: true,
      createdBy: req.user._id,
      createdByName: req.user.name,
    });

    res.status(201).json({
      success: true,
      bill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bills
 * @desc    Get all bills (admin sees all, staff sees own)
 * @access  Private
 */
const getBills = async (req, res, next) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    
    // Staff can only see their own bills
    if (req.user.role === 'STAFF') {
      filter.createdBy = req.user._id;
    }
    
    // Filter by status
    if (status) {
      filter.status = status;
    }
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [bills, total] = await Promise.all([
      Bill.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Bill.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: bills.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      bills,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bills/:id
 * @desc    Get single bill by ID
 * @access  Private
 */
const getBill = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id).lean();

    if (!bill) {
      return next(new AppError('Bill not found', 404));
    }

    // Staff can only view their own bills
    if (req.user.role === 'STAFF' && bill.createdBy.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to view this bill', 403));
    }

    res.status(200).json({
      success: true,
      bill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bills/number/:billNumber
 * @desc    Get bill by bill number (for reprints)
 * @access  Private
 */
const getBillByNumber = async (req, res, next) => {
  try {
    const bill = await Bill.findOne({ billNumber: req.params.billNumber }).lean();

    if (!bill) {
      return next(new AppError('Bill not found', 404));
    }

    // Staff can only view their own bills
    if (req.user.role === 'STAFF' && bill.createdBy.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to view this bill', 403));
    }

    res.status(200).json({
      success: true,
      bill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/bills/:id/void
 * @desc    Void a bill (admin only)
 * @access  Private/Admin
 */
const voidBill = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return next(new AppError('Bill not found', 404));
    }

    if (bill.status === 'VOIDED') {
      return next(new AppError('Bill is already voided', 400));
    }

    if (!bill.isFinalized) {
      return next(new AppError('Cannot void a draft bill', 400));
    }

    // Void the bill
    bill.void(req.user._id, reason);
    await bill.save();

    // Log audit action
    await logAuditAction({
      action: 'BILL_VOIDED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetModel: 'Bill',
      targetId: bill._id,
      details: { billNumber: bill.billNumber, reason, total: bill.total },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Bill voided successfully',
      bill,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBill,
  getBills,
  getBill,
  getBillByNumber,
  voidBill,
};
