const StaffPaymentRecord = require('../models/StaffPaymentRecord');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { auditLog } = require('../utils/auditLogger');

// @desc    Create new work record
// @route   POST /api/staff-payments
// @access  Admin only
exports.createWorkRecord = async (req, res, next) => {
  try {
    const { staffId, workDate, startTime, endTime, hourlyRate, paidAmount, notes } = req.body;

    // Validate staff exists and is cashier
    const staff = await User.findById(staffId);
    if (!staff) {
      return next(new AppError('Staff member not found', 404));
    }
    if (staff.role !== 'CASHIER') {
      return next(new AppError('Can only create records for cashier staff', 400));
    }

    const record = await StaffPaymentRecord.create({
      staff: staffId,
      workDate,
      startTime,
      endTime,
      hourlyRate,
      paidAmount: paidAmount || 0,
      notes,
      createdBy: req.user._id,
    });

    await record.populate('staff', 'name username');

    await auditLog(
      req.user._id,
      'CREATE',
      'StaffPaymentRecord',
      record._id,
      `Work record created for ${staff.name}: ${record.hoursWorked}h @ ₹${hourlyRate}/h`
    );

    res.status(201).json({
      success: true,
      record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get work records
// @route   GET /api/staff-payments
// @access  Admin only
exports.getWorkRecords = async (req, res, next) => {
  try {
    const { staffId, startDate, endDate, status } = req.query;

    const query = {};
    if (staffId) query.staff = staffId;
    if (status) query.paymentStatus = status;
    
    if (startDate || endDate) {
      query.workDate = {};
      if (startDate) query.workDate.$gte = new Date(startDate);
      if (endDate) query.workDate.$lte = new Date(endDate);
    }

    const records = await StaffPaymentRecord.find(query)
      .populate('staff', 'name username')
      .populate('createdBy', 'name')
      .sort({ workDate: -1, createdAt: -1 });

    res.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single work record
// @route   GET /api/staff-payments/:id
// @access  Admin only
exports.getWorkRecord = async (req, res, next) => {
  try {
    const record = await StaffPaymentRecord.findById(req.params.id)
      .populate('staff', 'name username')
      .populate('createdBy', 'name');

    if (!record) {
      return next(new AppError('Work record not found', 404));
    }

    res.json({
      success: true,
      record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update work record
// @route   PUT /api/staff-payments/:id
// @access  Admin only
exports.updateWorkRecord = async (req, res, next) => {
  try {
    let record = await StaffPaymentRecord.findById(req.params.id);

    if (!record) {
      return next(new AppError('Work record not found', 404));
    }

    const { workDate, startTime, endTime, hourlyRate, paidAmount, notes } = req.body;

    // Update allowed fields
    if (workDate) record.workDate = workDate;
    if (startTime) record.startTime = startTime;
    if (endTime) record.endTime = endTime;
    if (hourlyRate !== undefined) record.hourlyRate = hourlyRate;
    if (paidAmount !== undefined) record.paidAmount = paidAmount;
    if (notes !== undefined) record.notes = notes;

    await record.save();
    await record.populate('staff', 'name username');

    await auditLog(
      req.user._id,
      'UPDATE',
      'StaffPaymentRecord',
      record._id,
      `Updated work record for ${record.staff.name}`
    );

    res.json({
      success: true,
      record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add payment to record
// @route   POST /api/staff-payments/:id/payment
// @access  Admin only
exports.addPayment = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return next(new AppError('Valid payment amount is required', 400));
    }

    const record = await StaffPaymentRecord.findById(req.params.id);

    if (!record) {
      return next(new AppError('Work record not found', 404));
    }

    await record.addPayment(amount);
    await record.populate('staff', 'name username');

    await auditLog(
      req.user._id,
      'UPDATE',
      'StaffPaymentRecord',
      record._id,
      `Payment of ₹${amount} added to ${record.staff.name}'s record`
    );

    res.json({
      success: true,
      record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get staff summary
// @route   GET /api/staff-payments/staff/:staffId/summary
// @access  Admin only
exports.getStaffSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const staff = await User.findById(req.params.staffId);
    if (!staff) {
      return next(new AppError('Staff member not found', 404));
    }

    const result = await StaffPaymentRecord.getStaffSummary(
      req.params.staffId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      staff: {
        _id: staff._id,
        name: staff.name,
        username: staff.username,
      },
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete work record
// @route   DELETE /api/staff-payments/:id
// @access  Admin only
exports.deleteWorkRecord = async (req, res, next) => {
  try {
    const record = await StaffPaymentRecord.findById(req.params.id).populate('staff', 'name');

    if (!record) {
      return next(new AppError('Work record not found', 404));
    }

    await record.deleteOne();

    await auditLog(
      req.user._id,
      'DELETE',
      'StaffPaymentRecord',
      record._id,
      `Deleted work record for ${record.staff.name}`
    );

    res.json({
      success: true,
      message: 'Work record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment statistics
// @route   GET /api/staff-payments/stats
// @access  Admin only
exports.getPaymentStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.workDate = {};
      if (startDate) matchStage.workDate.$gte = new Date(startDate);
      if (endDate) matchStage.workDate.$lte = new Date(endDate);
    }

    const stats = await StaffPaymentRecord.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalHours: { $sum: '$hoursWorked' },
          totalPayable: { $sum: '$totalPayable' },
          totalPaid: { $sum: '$paidAmount' },
          totalRemaining: { $sum: '$remainingBalance' },
          totalAdvance: { $sum: '$advanceBalance' },
        },
      },
    ]);

    const statusBreakdown = await StaffPaymentRecord.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          amount: { $sum: '$totalPayable' },
        },
      },
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalRecords: 0,
        totalHours: 0,
        totalPayable: 0,
        totalPaid: 0,
        totalRemaining: 0,
        totalAdvance: 0,
      },
      statusBreakdown,
    });
  } catch (error) {
    next(error);
  }
};
