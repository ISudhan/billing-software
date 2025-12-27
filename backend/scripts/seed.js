/**
 * Seed script to initialize database with default data
 * Run: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const config = require('../config/config');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you don't want to clear)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Settings.deleteMany({});
    console.log('✅ Data cleared');

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      username: config.admin.username,
      password: config.admin.password,
      name: config.admin.name,
      role: 'ADMIN',
    });
    console.log(`✅ Admin created: ${admin.username}`);

    // Create sample staff user
    console.log('👤 Creating staff user...');
    const staff = await User.create({
      username: 'staff1',
      password: 'staff123',
      name: 'Staff Member',
      role: 'STAFF',
    });
    console.log(`✅ Staff created: ${staff.username}`);

    // Create sample products
    console.log('📦 Creating sample products...');
    const products = [
      {
        name: 'Rice',
        nameTamil: 'அரிசி',
        price: 50,
        category: 'Groceries',
        imageUrl: null,
        createdBy: admin._id,
      },
      {
        name: 'Wheat',
        nameTamil: 'கோதுமை',
        price: 45,
        category: 'Groceries',
        imageUrl: '/wheat.webp',
        createdBy: admin._id,
      },
      {
        name: 'Sugar',
        nameTamil: 'சர்க்கரை',
        price: 40,
        category: 'Groceries',
        imageUrl: '/sugar.jpg',
        createdBy: admin._id,
      },
      {
        name: 'Tea',
        nameTamil: 'தேநீர்',
        price: 250,
        category: 'Beverages',
        imageUrl: '/tea.jpg',
        createdBy: admin._id,
      },
      {
        name: 'Coffee',
        nameTamil: 'காபி',
        price: 350,
        category: 'Beverages',
        imageUrl: '/coffee.jpg',
        createdBy: admin._id,
      },
      {
        name: 'Salt',
        nameTamil: 'உப்பு',
        price: 20,
        category: 'Groceries',
        imageUrl: '/salt.jpg',
        createdBy: admin._id,
      },
      {
        name: 'Oil',
        nameTamil: 'எண்ணெய்',
        price: 150,
        category: 'Groceries',
        imageUrl: null,
        createdBy: admin._id,
      },
      {
        name: 'Milk',
        nameTamil: 'பால்',
        price: 60,
        category: 'Dairy',
        imageUrl: null,
        createdBy: admin._id,
      },
    ];

    await Product.insertMany(products);
    console.log(`✅ ${products.length} products created`);

    // Initialize settings
    console.log('⚙️  Initializing settings...');
    await Settings.create({
      shopName: config.shop.name,
      billPrefix: config.shop.billPrefix,
      billCounter: 1,
      defaultLanguage: 'both',
    });
    console.log('✅ Settings initialized');

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   ✅ Database seeded successfully!         ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log('║   Admin Credentials:                       ║');
    console.log(`║   Username: ${config.admin.username.padEnd(30)} ║`);
    console.log(`║   Password: ${config.admin.password.padEnd(30)} ║`);
    console.log('║                                            ║');
    console.log('║   Staff Credentials:                       ║');
    console.log('║   Username: staff1                         ║');
    console.log('║   Password: staff123                       ║');
    console.log('╚════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
