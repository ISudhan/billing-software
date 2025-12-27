const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    // Shop Information
    shopName: {
      type: String,
      required: true,
      default: 'Senthur Billing',
      trim: true,
    },
    shopAddress1: {
      type: String,
      trim: true,
    },
    shopAddress2: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    
    // Bill Configuration
    billPrefix: {
      type: String,
      required: true,
      default: 'BILL',
      trim: true,
      uppercase: true,
    },
    billCounter: {
      type: Number,
      required: true,
      default: 1,
    },
    
    // Language Settings
    defaultLanguage: {
      type: String,
      enum: ['en', 'ta', 'both'],
      default: 'both',
    },
    
    // Feature Flags
    enableDiscounts: {
      type: Boolean,
      default: false,
    },
    enableExtraCharges: {
      type: Boolean,
      default: false,
    },
    
    // Last updated tracking
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.statics.getInstance = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Atomic counter increment for bill numbers
settingsSchema.statics.getNextBillNumber = async function () {
  const settings = await this.findOneAndUpdate(
    {},
    { $inc: { billCounter: 1 } },
    { new: true, upsert: true }
  );
  
  const paddedCounter = String(settings.billCounter).padStart(6, '0');
  return `${settings.billPrefix}-${paddedCounter}`;
};

module.exports = mongoose.model('Settings', settingsSchema);
