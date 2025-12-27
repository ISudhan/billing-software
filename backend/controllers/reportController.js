const Bill = require('../models/Bill');
const AppError = require('../utils/AppError');

/**
 * @route   GET /api/reports/daily
 * @desc    Get daily sales summary
 * @access  Private/Admin
 */
const getDailySales = async (req, res, next) => {
  try {
    const { date } = req.query;
    
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const [sales, billCount] = await Promise.all([
      Bill.aggregate([
        {
          $match: {
            status: 'PAID',
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$total' },
            totalBills: { $sum: 1 },
          },
        },
      ]),
      Bill.countDocuments({
        status: { $in: ['PAID', 'VOIDED'] },
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }),
    ]);

    const summary = sales[0] || { totalSales: 0, totalBills: 0 };

    res.status(200).json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      summary: {
        totalSales: summary.totalSales,
        totalBills: summary.totalBills,
        totalBillsIncludingVoided: billCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/date-range
 * @desc    Get sales report for date range
 * @access  Private/Admin
 */
const getDateRangeSales = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(new AppError('Start date and end date are required', 400));
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const report = await Bill.aggregate([
      {
        $match: {
          status: 'PAID',
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalSales: { $sum: '$total' },
          totalBills: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          totalSales: 1,
          totalBills: 1,
        },
      },
    ]);

    const totalSales = report.reduce((sum, day) => sum + day.totalSales, 0);
    const totalBills = report.reduce((sum, day) => sum + day.totalBills, 0);

    res.status(200).json({
      success: true,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      summary: {
        totalSales,
        totalBills,
        averageBillValue: totalBills > 0 ? totalSales / totalBills : 0,
      },
      dailyBreakdown: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/staff
 * @desc    Get staff-wise sales summary
 * @access  Private/Admin
 */
const getStaffSales = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { status: 'PAID' };
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const staffSales = await Bill.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: '$createdBy',
          staffName: { $first: '$createdByName' },
          totalSales: { $sum: '$total' },
          totalBills: { $sum: 1 },
        },
      },
      {
        $sort: { totalSales: -1 },
      },
      {
        $project: {
          _id: 0,
          staffId: '$_id',
          staffName: 1,
          totalSales: 1,
          totalBills: 1,
          averageBillValue: {
            $cond: [
              { $gt: ['$totalBills', 0] },
              { $divide: ['$totalSales', '$totalBills'] },
              0,
            ],
          },
        },
      },
    ]);

    const grandTotal = staffSales.reduce((sum, staff) => sum + staff.totalSales, 0);
    const grandTotalBills = staffSales.reduce((sum, staff) => sum + staff.totalBills, 0);

    res.status(200).json({
      success: true,
      summary: {
        grandTotal,
        grandTotalBills,
        averageBillValue: grandTotalBills > 0 ? grandTotal / grandTotalBills : 0,
      },
      staffBreakdown: staffSales,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/top-products
 * @desc    Get top-selling products
 * @access  Private/Admin
 */
const getTopProducts = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    const filter = { status: 'PAID' };
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const topProducts = await Bill.aggregate([
      {
        $match: filter,
      },
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.name' },
          productNameTamil: { $first: '$items.nameTamil' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          timesOrdered: { $sum: 1 },
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          productName: 1,
          productNameTamil: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          timesOrdered: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: topProducts.length,
      products: topProducts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailySales,
  getDateRangeSales,
  getStaffSales,
  getTopProducts,
};
