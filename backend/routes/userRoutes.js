const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deactivateUser,
} = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/auth');
const {
  createUserValidation,
  updateUserValidation,
  validate,
} = require('../middleware/validator');

// All routes require authentication and admin role
router.use(protect, isAdmin);

router.route('/')
  .get(getUsers)
  .post(createUserValidation, validate, createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUserValidation, validate, updateUser)
  .delete(deactivateUser);

module.exports = router;
