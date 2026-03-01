const Bill = require('../models/Bill');
const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');
const Settings = require('../models/Settings');
const AppError = require('../utils/AppError');
const { logAuditAction } = require('../utils/auditLogger');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: calculate GST amounts for one line item
// Returns { taxableAmount, cgst, sgst, totalTax, lineTotal }
// ─────────────────────────────────────────────────────────────────────────────
function calculateGST(price, quantity, gstRate, taxInclusive) {
  const lineTotal = price * quantity;
  const gstFraction = gstRate / 100;

  let taxableAmount, totalTax;

  if (taxInclusive) {
    // Price includes GST → back-calculate taxable amount
    taxableAmount = lineTotal / (1 + gstFraction);
    totalTax = lineTotal - taxableAmount;
  } else {
    // Price is base price → add GST on top (subtotal already = lineTotal)
    taxableAmount = lineTotal;
    totalTax = lineTotal * gstFraction;
  }

  const cgst = totalTax / 2;
  const sgst = totalTax / 2;

  return {
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    cgst:          Math.round(cgst * 100) / 100,
    sgst:          Math.round(sgst * 100) / 100,
    totalTax:      Math.round(totalTax * 100) / 100,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/bills  — Create and finalize a new bill
// ─────────────────────────────────────────────────────────────────────────────
const createBill = async (req, res, next) => {
  try {
    const { items, paymentMode, discountAmount = 0, extraChargeAmount = 0, extraChargeLabel = '', customerId, customerName, customerPhone } = req.body;

    // ── 1. Validate and fetch products ───────────────────────────────────────
    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });

    if (products.length !== items.length) {
      return next(new AppError('One or more products are invalid or inactive', 400));
    }

    // ── 2. Stock availability check ──────────────────────────────────────────
    const stockErrors = [];
    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product) {
        stockErrors.push(`Product ${item.productId} not found`);
        continue;
      }
      if (product.stockQuantity < item.quantity) {
        stockErrors.push(
          `"${product.name}" — only ${product.stockQuantity} unit(s) available (requested ${item.quantity})`
        );
      }
    }
    if (stockErrors.length > 0) {
      return next(new AppError(`Insufficient stock:\n${stockErrors.join('\n')}`, 400));
    }

    // ── 3. Build bill items with GST breakdown ────────────────────────────────
    const billItems = items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId);
      const subtotal = product.price * item.quantity;
      const gst = calculateGST(product.price, item.quantity, product.gstRate || 0, product.taxInclusive !== false);

      return {
        productId: product._id,
        name: product.name,
        nameTamil: product.nameTamil,
        price: product.price,
        quantity: item.quantity,
        subtotal,
        hsnCode: product.hsnCode || '',
        gstRate: product.gstRate || 0,
        taxInclusive: product.taxInclusive !== false,
        taxableAmount: gst.taxableAmount,
        cgst: gst.cgst,
        sgst: gst.sgst,
        totalTax: gst.totalTax,
      };
    });

    // ── 4. Calculate totals ───────────────────────────────────────────────────
    const subtotal      = billItems.reduce((s, i) => s + i.subtotal, 0);
    const totalTax      = billItems.reduce((s, i) => s + i.totalTax, 0);
    const totalCgst     = billItems.reduce((s, i) => s + i.cgst, 0);
    const totalSgst     = billItems.reduce((s, i) => s + i.sgst, 0);
    const total         = subtotal + (extraChargeAmount || 0) - (discountAmount || 0);

    // ── 5. Generate bill number ───────────────────────────────────────────────
    const billNumber = await Settings.getNextBillNumber();

    // ── 6. Create bill ────────────────────────────────────────────────────────
    const bill = await Bill.create({
      billNumber,
      items: billItems,
      subtotal,
      totalTax,
      totalCgst,
      totalSgst,
      total,
      discountAmount,
      extraChargeAmount,
      extraChargeLabel,
      paymentMode,
      status: 'PAID',
      isFinalized: true,
      customerId: customerId || undefined,
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      createdBy: req.user._id,
      createdByName: req.user.name,
    });

    // ── 7. Deduct stock + write StockLedger entries ───────────────────────────
    const ledgerEntries = [];
    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId);
      const balanceBefore = product.stockQuantity;
      const balanceAfter  = balanceBefore - item.quantity;

      await Product.findByIdAndUpdate(product._id, { $inc: { stockQuantity: -item.quantity } });

      ledgerEntries.push({
        productId:       product._id,
        productName:     product.name,
        movementType:    'SALE',
        quantityChange:  -item.quantity,
        balanceBefore,
        balanceAfter,
        referenceType:   'Bill',
        referenceId:     bill._id,
        referenceNumber: bill.billNumber,
        note:            `Sale - ${bill.billNumber}`,
        performedBy:     req.user._id,
        performedByName: req.user.name,
      });
    }
    await StockLedger.insertMany(ledgerEntries);

    res.status(201).json({ success: true, bill });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/bills
// ─────────────────────────────────────────────────────────────────────────────
const getBills = async (req, res, next) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (req.user.role === 'CASHIER') filter.createdBy = req.user._id;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [bills, total] = await Promise.all([
      Bill.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/bills/:id
// ─────────────────────────────────────────────────────────────────────────────
const getBill = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id).lean();
    if (!bill) return next(new AppError('Bill not found', 404));
    if (req.user.role === 'CASHIER' && bill.createdBy.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to view this bill', 403));
    }
    res.status(200).json({ success: true, bill });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/bills/number/:billNumber
// ─────────────────────────────────────────────────────────────────────────────
const getBillByNumber = async (req, res, next) => {
  try {
    const bill = await Bill.findOne({ billNumber: req.params.billNumber }).lean();
    if (!bill) return next(new AppError('Bill not found', 404));
    if (req.user.role === 'CASHIER' && bill.createdBy.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to view this bill', 403));
    }
    res.status(200).json({ success: true, bill });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/bills/:id/void  [Admin only]
// ─────────────────────────────────────────────────────────────────────────────
const voidBill = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const bill = await Bill.findById(req.params.id);
    if (!bill)                return next(new AppError('Bill not found', 404));
    if (bill.status === 'VOIDED') return next(new AppError('Bill is already voided', 400));
    if (!bill.isFinalized)    return next(new AppError('Cannot void a draft bill', 400));

    bill.void(req.user._id, reason);
    await bill.save();

    // Restore stock for voided bill items
    const stockRestoreEntries = [];
    for (const item of bill.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const balanceBefore = product.stockQuantity;
        await Product.findByIdAndUpdate(item.productId, { $inc: { stockQuantity: item.quantity } });
        stockRestoreEntries.push({
          productId:       item.productId,
          productName:     item.name,
          movementType:    'RETURN',
          quantityChange:  item.quantity,
          balanceBefore,
          balanceAfter:    balanceBefore + item.quantity,
          referenceType:   'Bill',
          referenceId:     bill._id,
          referenceNumber: bill.billNumber,
          note:            `Void - ${bill.billNumber} - ${reason || 'No reason'}`,
          performedBy:     req.user._id,
          performedByName: req.user.name,
        });
      }
    }
    if (stockRestoreEntries.length > 0) {
      await StockLedger.insertMany(stockRestoreEntries);
    }

    await logAuditAction({
      action: 'BILL_VOIDED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetModel: 'Bill',
      targetId: bill._id,
      details: { billNumber: bill.billNumber, reason, total: bill.total },
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Bill voided and stock restored', bill });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBill, getBills, getBill, getBillByNumber, voidBill };
