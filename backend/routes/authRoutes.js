const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { login, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginValidation, validate } = require('../middleware/validator');
const config = require('../config/config');

// Rate limiter for login endpoint
const loginLimiter = rateLimit({
  windowMs: config.loginRateLimit.windowMs,
  max: config.loginRateLimit.max,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// @route   POST /api/auth/login
router.post('/login', loginLimiter, loginValidation, validate, login);

// @route   GET /api/auth/me
router.get('/me', protect, getCurrentUser);

module.exports = router;
