const User = require('../models/User');
const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/jwt');

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized, no token provided', 401));
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new AppError('Invalid or expired token', 401));
    }

    // Check if user still exists and is active
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new AppError('User not found', 401));
    }

    if (!user.isActive) {
      return next(new AppError('User account is deactivated', 401));
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Not authorized', 401));
  }
};

/**
 * Restrict routes to specific roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authorized', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

/**
 * Check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};

module.exports = {
  protect,
  restrictTo,
  isAdmin,
};
