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

// Virtual for public representation
productSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    nameTamil: this.nameTamil,
    price: this.price,
    category: this.category,
    imageUrl: this.imageUrl,
    isActive: this.isActive,
  };
};

module.exports = mongoose.model('Product', productSchema);
