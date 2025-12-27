const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg).join('. ');
    return next(new AppError(errorMessages, 400));
  }
  next();
};

// Validation rules for different routes

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const createUserValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'STAFF']).withMessage('Invalid role'),
];

const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'STAFF']).withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be boolean'),
];

const createProductValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('nameTamil')
    .trim()
    .notEmpty().withMessage('Tamil name is required')
    .isLength({ max: 100 }).withMessage('Tamil name cannot exceed 100 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ max: 50 }).withMessage('Category cannot exceed 50 characters'),
  body('imageUrl')
    .optional()
    .trim(),
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Product name cannot be empty')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('nameTamil')
    .optional()
    .trim()
    .notEmpty().withMessage('Tamil name cannot be empty')
    .isLength({ max: 100 }).withMessage('Tamil name cannot exceed 100 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .trim()
    .notEmpty().withMessage('Category cannot be empty')
    .isLength({ max: 50 }).withMessage('Category cannot exceed 50 characters'),
  body('imageUrl')
    .optional()
    .trim(),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be boolean'),
];

const createBillValidation = [
  body('items')
    .isArray({ min: 1 }).withMessage('Bill must have at least one item'),
  body('items.*.productId')
    .notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMode')
    .notEmpty().withMessage('Payment mode is required')
    .isIn(['CASH', 'CARD', 'UPI']).withMessage('Invalid payment mode'),
];

const voidBillValidation = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters'),
];

const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format'),
];

module.exports = {
  validate,
  loginValidation,
  createUserValidation,
  updateUserValidation,
  createProductValidation,
  updateProductValidation,
  createBillValidation,
  voidBillValidation,
  dateRangeValidation,
};
