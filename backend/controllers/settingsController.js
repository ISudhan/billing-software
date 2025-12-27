const Settings = require('../models/Settings');
const AppError = require('../utils/AppError');
const { logAuditAction } = require('../utils/auditLogger');

/**
 * @route   GET /api/settings
 * @desc    Get shop settings
 * @access  Private
 */
const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getInstance();

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/settings
 * @desc    Update shop settings (admin only)
 * @access  Private/Admin
 */
const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;
    
    // Get current settings
    const settings = await Settings.getInstance();

    // Update allowed fields
    const allowedFields = [
      'shopName',
      'shopAddress1',
      'shopAddress2',
      'phone',
      'email',
      'billPrefix',
      'defaultLanguage',
      'enableDiscounts',
      'enableExtraCharges',
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        settings[field] = updates[field];
      }
    });

    settings.updatedBy = req.user._id;
    await settings.save();

    // Log audit action
    await logAuditAction({
      action: 'SETTINGS_UPDATED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetModel: 'Settings',
      targetId: settings._id,
      details: updates,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
