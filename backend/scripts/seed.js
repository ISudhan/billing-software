/**
 * Seed script for Smart Energy Solutions Billing Software v2.0
 * Run: npm run seed
 * Includes: Stock quantities, GST rates, cost prices, barcodes
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const StockLedger = require('../models/StockLedger');
const config = require('../config/config');

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Settings.deleteMany({});
    await StockLedger.deleteMany({});
    console.log('✅ Data cleared');

    // ─── Users ───────────────────────────────────────────────────
    console.log('👤 Creating users...');
    const admin = await User.create({ username: config.admin.username, password: config.admin.password, name: config.admin.name, role: 'ADMIN' });
    await User.create({ username: 'cashier1', password: 'cashier123', name: 'Ravi Kumar',  role: 'CASHIER' });
    await User.create({ username: 'cashier2', password: 'cashier123', name: 'Priya Devi',  role: 'CASHIER' });
    console.log('✅ 3 users created');

    // ─── Products ─────────────────────────────────────────────────
    console.log('📦 Creating Smart Energy Solutions products...');

    const products = [
      // ── CCTV Cameras (GST 18%) ──
      { name: 'Dome Camera 2MP',           nameTamil: 'டோம் கேமரா 2MP',               price: 1299, costPrice: 850,  category: 'CCTV Cameras',       hsnCode: '85258090', gstRate: 18, stockQuantity: 25, lowStockThreshold: 3,  barcode: '8901234560001' },
      { name: 'Bullet Camera 4MP',         nameTamil: 'புல்லட் கேமரா 4MP',             price: 2499, costPrice: 1600, category: 'CCTV Cameras',       hsnCode: '85258090', gstRate: 18, stockQuantity: 18, lowStockThreshold: 3,  barcode: '8901234560002' },
      { name: 'PTZ Camera 5MP',            nameTamil: 'PTZ கேமரா 5MP',                price: 8999, costPrice: 5800, category: 'CCTV Cameras',       hsnCode: '85258090', gstRate: 18, stockQuantity: 8,  lowStockThreshold: 2,  barcode: '8901234560003' },
      { name: 'IP Camera 8MP (4K)',         nameTamil: 'IP கேமரா 8MP (4K)',             price: 5999, costPrice: 3900, category: 'CCTV Cameras',       hsnCode: '85258090', gstRate: 18, stockQuantity: 12, lowStockThreshold: 2,  barcode: '8901234560004' },
      { name: 'DVR 4 Channel',             nameTamil: 'DVR 4 சேனல்',                  price: 3499, costPrice: 2200, category: 'CCTV Cameras',       hsnCode: '85218100', gstRate: 18, stockQuantity: 15, lowStockThreshold: 3,  barcode: '8901234560005' },
      { name: 'NVR 8 Channel',             nameTamil: 'NVR 8 சேனல்',                  price: 6999, costPrice: 4500, category: 'CCTV Cameras',       hsnCode: '85218100', gstRate: 18, stockQuantity: 10, lowStockThreshold: 2,  barcode: '8901234560006' },
      { name: 'CCTV Installation Kit',     nameTamil: 'CCTV நிறுவல் கிட்',            price: 1999, costPrice: 1200, category: 'CCTV Cameras',       hsnCode: '85359000', gstRate: 18, stockQuantity: 30, lowStockThreshold: 5,  barcode: '8901234560007' },

      // ── Solar Water Heaters (GST 5%) ──
      { name: 'Solar Water Heater 100L',   nameTamil: 'சோலார் வாட்டர் ஹீட்டர் 100L', price: 18500, costPrice: 13000, category: 'Solar Water Heaters', hsnCode: '84191900', gstRate: 5,  stockQuantity: 6,  lowStockThreshold: 2,  barcode: '8901234561001' },
      { name: 'Solar Water Heater 150L',   nameTamil: 'சோலார் வாட்டர் ஹீட்டர் 150L', price: 24500, costPrice: 17000, category: 'Solar Water Heaters', hsnCode: '84191900', gstRate: 5,  stockQuantity: 5,  lowStockThreshold: 2,  barcode: '8901234561002' },
      { name: 'Solar Water Heater 200L',   nameTamil: 'சோலார் வாட்டர் ஹீட்டர் 200L', price: 31000, costPrice: 22000, category: 'Solar Water Heaters', hsnCode: '84191900', gstRate: 5,  stockQuantity: 4,  lowStockThreshold: 1,  barcode: '8901234561003' },
      { name: 'Solar Water Heater 300L',   nameTamil: 'சோலார் வாட்டர் ஹீட்டர் 300L', price: 45000, costPrice: 32000, category: 'Solar Water Heaters', hsnCode: '84191900', gstRate: 5,  stockQuantity: 3,  lowStockThreshold: 1,  barcode: '8901234561004' },
      { name: 'ETC Solar Collector Panel', nameTamil: 'ETC சோலார் கலெக்டர் பேனல்',   price: 8500,  costPrice: 6000,  category: 'Solar Water Heaters', hsnCode: '84191900', gstRate: 5,  stockQuantity: 10, lowStockThreshold: 2,  barcode: '8901234561005' },

      // ── Inverters (GST 12%) ──
      { name: 'Home Inverter 850VA',       nameTamil: 'ஹோம் இன்வர்ட்டர் 850VA',      price: 4999,  costPrice: 3300,  category: 'Inverters',           hsnCode: '85044090', gstRate: 12, stockQuantity: 20, lowStockThreshold: 4,  barcode: '8901234562001' },
      { name: 'Home Inverter 1500VA',      nameTamil: 'ஹோம் இன்வர்ட்டர் 1500VA',     price: 7999,  costPrice: 5400,  category: 'Inverters',           hsnCode: '85044090', gstRate: 12, stockQuantity: 15, lowStockThreshold: 3,  barcode: '8901234562002' },
      { name: 'Solar Inverter 3kW',        nameTamil: 'சோலார் இன்வர்ட்டர் 3kW',      price: 22000, costPrice: 15500, category: 'Inverters',           hsnCode: '85044090', gstRate: 12, stockQuantity: 8,  lowStockThreshold: 2,  barcode: '8901234562003' },
      { name: 'Solar Inverter 5kW',        nameTamil: 'சோலார் இன்வர்ட்டர் 5kW',      price: 38000, costPrice: 27000, category: 'Inverters',           hsnCode: '85044090', gstRate: 12, stockQuantity: 5,  lowStockThreshold: 1,  barcode: '8901234562004' },
      { name: 'Hybrid Inverter 10kW',      nameTamil: 'ஹைப்ரிட் இன்வர்ட்டர் 10kW',   price: 65000, costPrice: 47000, category: 'Inverters',           hsnCode: '85044090', gstRate: 12, stockQuantity: 3,  lowStockThreshold: 1,  barcode: '8901234562005' },

      // ── Batteries (GST 28%) ──
      { name: 'Tubular Battery 100Ah',     nameTamil: 'டியூபுலார் பேட்டரி 100Ah',    price: 8999,  costPrice: 6200,  category: 'Batteries',           hsnCode: '85071000', gstRate: 28, stockQuantity: 22, lowStockThreshold: 4,  barcode: '8901234563001' },
      { name: 'Tubular Battery 150Ah',     nameTamil: 'டியூபுலார் பேட்டரி 150Ah',    price: 12500, costPrice: 8800,  category: 'Batteries',           hsnCode: '85071000', gstRate: 28, stockQuantity: 18, lowStockThreshold: 3,  barcode: '8901234563002' },
      { name: 'Tubular Battery 200Ah',     nameTamil: 'டியூபுலார் பேட்டரி 200Ah',    price: 16999, costPrice: 12000, category: 'Batteries',           hsnCode: '85071000', gstRate: 28, stockQuantity: 12, lowStockThreshold: 3,  barcode: '8901234563003' },
      { name: 'Lithium Battery 100Ah',     nameTamil: 'லித்தியம் பேட்டரி 100Ah',     price: 32000, costPrice: 23000, category: 'Batteries',           hsnCode: '85076000', gstRate: 28, stockQuantity: 6,  lowStockThreshold: 1,  barcode: '8901234563004' },
      { name: 'SMF Battery 42Ah',          nameTamil: 'SMF பேட்டரி 42Ah',            price: 4499,  costPrice: 3100,  category: 'Batteries',           hsnCode: '85072000', gstRate: 28, stockQuantity: 25, lowStockThreshold: 5,  barcode: '8901234563005' },

      // ── Solar Street Lights (GST 12%) ──
      { name: 'Solar Street Light 20W',    nameTamil: 'சோலார் தெரு விளக்கு 20W',     price: 3999,  costPrice: 2700,  category: 'Solar Street Lights', hsnCode: '94054090', gstRate: 12, stockQuantity: 15, lowStockThreshold: 3,  barcode: '8901234564001' },
      { name: 'Solar Street Light 40W',    nameTamil: 'சோலார் தெரு விளக்கு 40W',     price: 7499,  costPrice: 5200,  category: 'Solar Street Lights', hsnCode: '94054090', gstRate: 12, stockQuantity: 10, lowStockThreshold: 2,  barcode: '8901234564002' },
      { name: 'Solar Street Light 60W',    nameTamil: 'சோலார் தெரு விளக்கு 60W',     price: 11500, costPrice: 8000,  category: 'Solar Street Lights', hsnCode: '94054090', gstRate: 12, stockQuantity: 8,  lowStockThreshold: 2,  barcode: '8901234564003' },
      { name: 'Integrated Solar LED 30W',  nameTamil: 'ஒருங்கிணைந்த சோலார் LED 30W', price: 5999,  costPrice: 4200,  category: 'Solar Street Lights', hsnCode: '94054090', gstRate: 12, stockQuantity: 12, lowStockThreshold: 2,  barcode: '8901234564004' },

      // ── Accessories (GST 18%) ──
      { name: 'Solar Panel 100W Mono',     nameTamil: 'சோலார் பேனல் 100W மோனோ',     price: 4500,  costPrice: 3100,  category: 'Accessories',         hsnCode: '85414090', gstRate: 5,  stockQuantity: 30, lowStockThreshold: 5,  barcode: '8901234565001' },
      { name: 'Solar Panel 330W Poly',     nameTamil: 'சோலார் பேனல் 330W பாலி',     price: 9800,  costPrice: 7000,  category: 'Accessories',         hsnCode: '85414090', gstRate: 5,  stockQuantity: 20, lowStockThreshold: 4,  barcode: '8901234565002' },
      { name: 'Solar Charge Controller 40A',nameTamil:'சோலார் சார்ஜ் கண்ட்ரோலர் 40A', price: 2999, costPrice: 2000,  category: 'Accessories',         hsnCode: '85044090', gstRate: 18, stockQuantity: 25, lowStockThreshold: 5,  barcode: '8901234565003' },
      { name: 'CCTV Power Supply 12V',     nameTamil: 'CCTV பவர் சப்ளை 12V',        price: 499,   costPrice: 300,   category: 'Accessories',         hsnCode: '85044090', gstRate: 18, stockQuantity: 50, lowStockThreshold: 10, barcode: '8901234565004' },
      { name: 'BNC Cable 20m',             nameTamil: 'BNC கேபிள் 20m',             price: 350,   costPrice: 200,   category: 'Accessories',         hsnCode: '85444290', gstRate: 18, stockQuantity: 60, lowStockThreshold: 10, barcode: '8901234565005' },
      { name: 'Mounting Bracket Set',      nameTamil: 'மவுண்டிங் பிராக்கட் செட்',   price: 699,   costPrice: 450,   category: 'Accessories',         hsnCode: '73269090', gstRate: 18, stockQuantity: 40, lowStockThreshold: 8,  barcode: '8901234565006' },
      { name: 'AMC Service Package',       nameTamil: 'AMC சேவை தொகுப்பு',          price: 2999,  costPrice: 1500,  category: 'Accessories',         hsnCode: '99850000', gstRate: 18, stockQuantity: 100,lowStockThreshold: 10, barcode: '8901234565007' },
    ].map(p => ({ ...p, createdBy: admin._id, taxInclusive: true }));

    await Product.insertMany(products);
    console.log(`✅ ${products.length} Smart Energy Solutions products created`);

    // ─── Settings ─────────────────────────────────────────────────
    console.log('⚙️  Initializing settings...');
    await Settings.create({
      shopName: 'Smart Energy Solutions',
      shopAddress1: 'Perfect Home Essential Products',
      shopAddress2: 'CCTV | Solar | Inverters | Batteries | Solar Street Lights',
      phone: '9876543210',
      email: 'smartenergy@email.com',
      billPrefix: 'SES',
      billCounter: 1,
      defaultLanguage: 'both',
    });
    console.log('✅ Settings initialized');

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║   ⚡ Smart Energy Solutions — DB Seeded v2.0! ✅        ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║   ADMIN:    admin / admin123                             ║');
    console.log('║   CASHIER1: cashier1 / cashier123 (Ravi Kumar)          ║');
    console.log('║   CASHIER2: cashier2 / cashier123 (Priya Devi)          ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║   Products: ${products.length} items | 6 categories | Stock + GST ready ║`);
    console.log('║   GST Rates: CCTV=18% | Solar WH=5% | Inverter=12%     ║');
    console.log('║             Battery=28% | Street Lights=12% | Acc=5-18% ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
