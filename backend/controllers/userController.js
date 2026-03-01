const User = require('../models/User');
const AppError = require('../utils/AppError');
const { logAuditAction } = require('../utils/auditLogger');

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, isActive } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users: users.map((user) => user.toPublicJSON()),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get single user by ID
 * @access  Private/Admin
 */
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users
 * @desc    Create new user (admin only)
 * @access  Private/Admin
 */
const createUser = async (req, res, next) => {
  try {
    const { username, password, name, role } = req.body;

    const user = await User.create({
      username,
      password,
      name,
      role: role || 'CASHIER',
    });

    // Log audit action
    await logAuditAction({
      action: 'USER_CREATED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetModel: 'User',
      targetId: user._id,
      details: { username, name, role: user.role },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (admin only)
 * @access  Private/Admin
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, password, role, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update fields
    if (name) user.name = name;
    if (password) user.password = password;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // Log audit action
    await logAuditAction({
      action: 'USER_UPDATED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetModel: 'User',
      targetId: user._id,
      details: { name, role, isActive },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/users/:id
 * @desc    Deactivate user (soft delete - admin only)
 * @access  Private/Admin
 */
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Prevent deactivating yourself
    if (user._id.toString() === req.user._id.toString()) {
      return next(new AppError('Cannot deactivate your own account', 400));
    }

    user.isActive = false;
    await user.save();

    // Log audit action
    await logAuditAction({
      action: 'USER_DEACTIVATED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetModel: 'User',
      targetId: user._id,
      details: { username: user.username, name: user.name },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deactivateUser,
};
