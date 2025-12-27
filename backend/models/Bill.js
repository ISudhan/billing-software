const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    nameTamil: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

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
        validator: function (items) {
          return items && items.length > 0;
        },
        message: 'Bill must have at least one item',
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdByName: {
      type: String,
      required: true,
    },
    voidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    voidedAt: {
      type: Date,
    },
    voidReason: {
      type: String,
      trim: true,
    },
    // Immutability flag - bills cannot be edited after finalization
    isFinalized: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high-performance queries
billSchema.index({ billNumber: 1 }, { unique: true });
billSchema.index({ createdAt: -1 });
billSchema.index({ createdBy: 1, createdAt: -1 });
billSchema.index({ status: 1, createdAt: -1 });
billSchema.index({ isFinalized: 1 });

// Compound index for reporting queries
billSchema.index({ status: 1, createdAt: -1, createdBy: 1 });

// Pre-save hook to ensure immutability
billSchema.pre('save', function (next) {
  if (this.isFinalized && !this.isNew) {
    // Allow only status and void-related changes for finalized bills
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

// Method to finalize bill
billSchema.methods.finalize = function () {
  this.isFinalized = true;
  this.status = 'PAID';
};

// Method to void bill (admin only)
billSchema.methods.void = function (userId, reason) {
  if (!this.isFinalized) {
    throw new Error('Can only void finalized bills');
  }
  this.status = 'VOIDED';
  this.voidedBy = userId;
  this.voidedAt = new Date();
  this.voidReason = reason || 'No reason provided';
};

module.exports = mongoose.model('Bill', billSchema);
