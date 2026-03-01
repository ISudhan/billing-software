const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    nameTamil: {
      type: String,
      required: [true, 'Tamil name is required'],
      trim: true,
      maxlength: [100, 'Tamil name cannot exceed 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    // ── Inventory ──────────────────────────────────────────
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },
    // ── GST / Tax ──────────────────────────────────────────
    hsnCode: {
      type: String,
      trim: true,
      default: '',
    },
    // GST rate in percent (0, 5, 12, 18, 28)
    gstRate: {
      type: Number,
      enum: [0, 5, 12, 18, 28],
      default: 18,
    },
    // true = price already includes GST; false = GST added on top
    taxInclusive: {
      type: Boolean,
      default: true,
    },
    // ── Barcode ────────────────────────────────────────────
    barcode: {
      type: String,
      trim: true,
      default: '',
      index: true,
      sparse: true,
    },
    // ── Metadata ───────────────────────────────────────────
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    imageUrl: {
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ stockQuantity: 1 }); // for low-stock queries

// Computed stock status virtual
productSchema.virtual('stockStatus').get(function () {
  if (this.stockQuantity === 0) return 'OUT_OF_STOCK';
  if (this.stockQuantity <= this.lowStockThreshold) return 'LOW_STOCK';
  return 'IN_STOCK';
});

// Gross margin % virtual
productSchema.virtual('marginPercent').get(function () {
  if (!this.costPrice || this.costPrice === 0) return null;
  return Math.round(((this.price - this.costPrice) / this.price) * 100);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
