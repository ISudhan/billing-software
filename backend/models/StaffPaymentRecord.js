const mongoose = require('mongoose');

const staffPaymentRecordSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workDate: {
      type: Date,
      required: [true, 'Work date is required'],
      index: true,
    },
    startTime: {
      type: String, // Format: "HH:mm" (24-hour)
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'],
    },
    endTime: {
      type: String, // Format: "HH:mm" (24-hour)
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'],
    },
    hoursWorked: {
      type: Number,
      required: true,
      min: [0, 'Hours cannot be negative'],
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: [0, 'Hourly rate cannot be negative'],
    },
    totalPayable: {
      type: Number,
      required: true,
      min: [0, 'Total payable cannot be negative'],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
    },
    remainingBalance: {
      type: Number,
      default: 0,
    },
    advanceBalance: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PARTIAL', 'PAID', 'ADVANCE'],
      default: 'UNPAID',
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
staffPaymentRecordSchema.index({ staff: 1, workDate: -1 });
staffPaymentRecordSchema.index({ paymentStatus: 1, workDate: -1 });

// Calculate hours worked before saving
staffPaymentRecordSchema.pre('save', function (next) {
  if (this.isModified('startTime') || this.isModified('endTime')) {
    const [startHour, startMin] = this.startTime.split(':').map(Number);
    const [endHour, endMin] = this.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    let minutesWorked = endMinutes - startMinutes;
    if (minutesWorked < 0) {
      minutesWorked += 24 * 60; // Handle overnight shifts
    }
    
    this.hoursWorked = Math.round((minutesWorked / 60) * 100) / 100; // 2 decimal places
  }
  
  // Calculate total payable
  if (this.isModified('hoursWorked') || this.isModified('hourlyRate')) {
    this.totalPayable = Math.round(this.hoursWorked * this.hourlyRate * 100) / 100;
  }
  
  // Calculate remaining balance and status
  if (this.isModified('paidAmount') || this.isModified('totalPayable')) {
    const diff = this.paidAmount - this.totalPayable;
    
    if (diff < 0) {
      // Underpaid or unpaid
      this.remainingBalance = Math.abs(diff);
      this.advanceBalance = 0;
      
      if (this.paidAmount === 0) {
        this.paymentStatus = 'UNPAID';
      } else {
        this.paymentStatus = 'PARTIAL';
      }
    } else if (diff === 0) {
      // Exact payment
      this.remainingBalance = 0;
      this.advanceBalance = 0;
      this.paymentStatus = 'PAID';
    } else {
      // Overpaid (advance given)
      this.remainingBalance = 0;
      this.advanceBalance = diff;
      this.paymentStatus = 'ADVANCE';
    }
  }
  
  next();
});

// Instance method to update payment
staffPaymentRecordSchema.methods.addPayment = function (amount) {
  this.paidAmount += amount;
  return this.save();
};

// Static method to get staff summary
staffPaymentRecordSchema.statics.getStaffSummary = async function (staffId, startDate, endDate) {
  const query = { staff: staffId };
  
  if (startDate || endDate) {
    query.workDate = {};
    if (startDate) query.workDate.$gte = new Date(startDate);
    if (endDate) query.workDate.$lte = new Date(endDate);
  }
  
  const records = await this.find(query).sort({ workDate: -1 });
  
  const summary = {
    totalHours: 0,
    totalPayable: 0,
    totalPaid: 0,
    totalRemaining: 0,
    totalAdvance: 0,
    recordCount: records.length,
  };
  
  records.forEach(record => {
    summary.totalHours += record.hoursWorked;
    summary.totalPayable += record.totalPayable;
    summary.totalPaid += record.paidAmount;
    summary.totalRemaining += record.remainingBalance;
    summary.totalAdvance += record.advanceBalance;
  });
  
  // Round to 2 decimals
  Object.keys(summary).forEach(key => {
    if (typeof summary[key] === 'number' && key !== 'recordCount') {
      summary[key] = Math.round(summary[key] * 100) / 100;
    }
  });
  
  return { summary, records };
};

module.exports = mongoose.model('StaffPaymentRecord', staffPaymentRecordSchema);
