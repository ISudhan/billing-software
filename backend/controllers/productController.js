const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { logAuditAction } = require('../utils/auditLogger');

/**
 * @route   GET /api/products
 * @desc    Get all products (active only for staff, all for admin)
 * @access  Private
 */
const getProducts = async (req, res, next) => {
  try {
    const { category, isActive } = req.query;
    
    const filter = {};
    
    // Staff can only see active products
    if (req.user.role === 'CASHIER') {
      filter.isActive = true;
    } else if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (category) filter.category = category;

    const products = await Product.find(filter)
      .sort({ category: 1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/products/categories
 * @desc    Get all unique categories
 * @access  Private
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    
    res.status(200).json({
      success: true,
      categories: categories.sort(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/products/:id
 * @desc    Get single product
 * @access  Private
 */
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/products
 * @desc    Create new product (admin only)
 * @access  Private/Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, nameTamil, price, category, imageUrl } = req.body;

    const product = await Product.create({
      name,
      nameTamil,
      price,
      category,
      imageUrl: imageUrl || null,
      createdBy: req.user._id,
    });

    // Log audit action
    await logAuditAction({
      action: 'PRODUCT_CREATED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetModel: 'Product',
      targetId: product._id,
      details: { name, nameTamil, price, category },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/products/:id
 * @desc    Update product (admin only)
 * @access  Private/Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    const { name, nameTamil, price, category, imageUrl, isActive } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Update fields
    if (name !== undefined) product.name = name;
    if (nameTamil !== undefined) product.nameTamil = nameTamil;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;
    if (isActive !== undefined) product.isActive = isActive;
    
    product.updatedBy = req.user._id;
    await product.save();

    // Log audit action
    await logAuditAction({
      action: 'PRODUCT_UPDATED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetModel: 'Product',
      targetId: product._id,
      details: { name, nameTamil, price, category, isActive },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/products/:id
 * @desc    Soft delete product (admin only)
 * @access  Private/Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Soft delete
    product.isActive = false;
    product.updatedBy = req.user._id;
    await product.save();

    // Log audit action
    await logAuditAction({
      action: 'PRODUCT_DELETED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      targetModel: 'Product',
      targetId: product._id,
      details: { name: product.name, category: product.category },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getCategories,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
