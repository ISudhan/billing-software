const mongoose = require('mongoose');

// ── GST breakdown per line item ──────────────────────────────────────────────
const billItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name:      { type: String, required: true },
    nameTamil: { type: String, required: true },
    price:     { type: Number, required: true, min: 0 },
    quantity:  { type: Number, required: true, min: 1 },
    subtotal:  { type: Number, required: true, min: 0 },

    // GST fields (stored at time of sale — immutable)
    hsnCode:       { type: String, default: '' },
    gstRate:       { type: Number, default: 0 },   // total GST % (CGST + SGST)
    taxInclusive:  { type: Boolean, default: true },
    taxableAmount: { type: Number, default: 0 },   // pre-tax amount
    cgst:          { type: Number, default: 0 },
    sgst:          { type: Number, default: 0 },
    totalTax:      { type: Number, default: 0 },
  },
  { _id: false }
);

// ── Bill ─────────────────────────────────────────────────────────────────────
const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [billItemSchema],
      required: true,
      validate: {
        validator: (items) => items && items.length > 0,
        message: 'Bill must have at least one item',
      },
    },
    // Totals
    subtotal:      { type: Number, required: true, min: 0 },
    totalTax:      { type: Number, default: 0, min: 0 },
    totalCgst:     { type: Number, default: 0, min: 0 },
    totalSgst:     { type: Number, default: 0, min: 0 },
    total:         { type: Number, required: true, min: 0 },

    // Discounts / extra charges
    discountAmount:    { type: Number, default: 0, min: 0 },
    extraChargeAmount: { type: Number, default: 0, min: 0 },
    extraChargeLabel:  { type: String, default: '' },

    paymentMode: {
      type: String,
      enum: ['CASH', 'CARD', 'UPI'],
      required: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PAID', 'VOIDED'],
      default: 'DRAFT',
      required: true,
    },

    // Customer (optional)
    customerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, trim: true },
    customerPhone:{ type: String, trim: true },
    loyaltyPointsEarned:  { type: Number, default: 0 },
    loyaltyPointsRedeemed:{ type: Number, default: 0 },

    createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdByName: { type: String, required: true },

    voidedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    voidedAt:  { type: Date },
    voidReason:{ type: String, trim: true },

    isFinalized: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes
billSchema.index({ billNumber: 1 }, { unique: true });
billSchema.index({ createdAt: -1 });
billSchema.index({ createdBy: 1, createdAt: -1 });
billSchema.index({ status: 1, createdAt: -1 });
billSchema.index({ status: 1, createdAt: -1, createdBy: 1 });
billSchema.index({ customerId: 1 });

// Pre-save — immutability enforcement
billSchema.pre('save', function (next) {
  if (this.isFinalized && !this.isNew) {
    const modifiedPaths = this.modifiedPaths();
    const allowedChanges = ['status', 'voidedBy', 'voidedAt', 'voidReason'];
    const hasUnallowedChanges = modifiedPaths.some(
      (path) => !allowedChanges.includes(path)
    );
    if (hasUnallowedChanges) {
      return next(new Error('Cannot modify finalized bill'));
    }
  }
  next();
});

billSchema.methods.finalize = function () {
  this.isFinalized = true;
  this.status = 'PAID';
};

billSchema.methods.void = function (userId, reason) {
  if (!this.isFinalized) throw new Error('Can only void finalized bills');
  this.status = 'VOIDED';
  this.voidedBy = userId;
  this.voidedAt = new Date();
  this.voidReason = reason || 'No reason provided';
};

module.exports = mongoose.model('Bill', billSchema);
