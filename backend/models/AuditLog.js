const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'USER_CREATED',
        'USER_UPDATED',
        'USER_DEACTIVATED',
        'PRODUCT_CREATED',
        'PRODUCT_UPDATED',
        'PRODUCT_DELETED',
        'BILL_VOIDED',
        'BILL_REOPENED',
        'SETTINGS_UPDATED',
      ],
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
    targetModel: {
      type: String,
      required: true,
      enum: ['User', 'Product', 'Bill', 'Settings'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ targetModel: 1, targetId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
