const User = require('../models/User');
const AppError = require('../utils/AppError');
const { generateToken } = require('../utils/jwt');

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return next(new AppError('Invalid username or password', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Account is deactivated', 401));
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new AppError('Invalid username or password', 401));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
const getCurrentUser = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getCurrentUser,
};
