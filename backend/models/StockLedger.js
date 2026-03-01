const mongoose = require('mongoose');

/**
 * StockLedger — immutable audit trail of every stock movement.
 * Created by: bill creation, purchase order receipt, manual admin adjustment, return processing.
 */
const stockLedgerSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
    },
    movementType: {
      type: String,
      enum: ['SALE', 'PURCHASE', 'RETURN', 'MANUAL_ADJUSTMENT'],
      required: true,
    },
    // Positive = stock added; Negative = stock removed
    quantityChange: {
      type: Number,
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    // Reference document (bill, purchase order, etc.)
    referenceType: {
      type: String,
      enum: ['Bill', 'PurchaseOrder', 'Manual', 'Return'],
      default: 'Manual',
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    referenceNumber: {
      type: String, // bill number or PO number string
      trim: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    performedByName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

stockLedgerSchema.index({ productId: 1, createdAt: -1 });
stockLedgerSchema.index({ movementType: 1, createdAt: -1 });
stockLedgerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('StockLedger', stockLedgerSchema);
