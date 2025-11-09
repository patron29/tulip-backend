// Seed database with sample products
// Run with: npm run db:seed

const mongoose = require('mongoose');
require('dotenv').config();

const sampleProducts = {
  '012000161551': {
    name: 'Coca-Cola Classic 12pk',
    category: 'Beverages',
    brand: 'Coca-Cola',
    size: '12 x 12oz',
    prices: [
      { retailer: 'Walmart', price: 5.98, inStock: true, lastUpdated: new Date() },
      { retailer: 'Target', price: 6.49, inStock: true, lastUpdated: new Date() },
      { retailer: 'Kroger', price: 5.99, inStock: false, lastUpdated: new Date() }
    ],
    coupons: [
      { 
        description: '$1 off 2 packs', 
        code: 'COKE123', 
        expires: '2025-12-31',
        savings: 1.00
      }
    ]
  },
  '028400064057': {
    name: 'Doritos Nacho Cheese',
    category: 'Snacks',
    brand: 'Frito-Lay',
    size: '9.75oz',
    prices: [
      { retailer: 'Walmart', price: 3.98, inStock: true, lastUpdated: new Date() },
      { retailer: 'Target', price: 4.29, inStock: true, lastUpdated: new Date() },
      { retailer: 'CVS', price: 4.49, inStock: true, lastUpdated: new Date() }
    ],
    coupons: []
  },
  '016000119949': {
    name: 'Cheerios Original',
    category: 'Breakfast',
    brand: 'General Mills',
    size: '18oz',
    prices: [
      { retailer: 'Walmart', price: 4.48, inStock: true, lastUpdated: new Date() },
      { retailer: 'Target', price: 4.99, inStock: true, lastUpdated: new Date() },
      { retailer: 'Kroger', price: 4.79, inStock: true, lastUpdated: new Date() }
    ],
    coupons: [
      {
        description: '$0.75 off any Cheerios',
        code: 'CHEER75',
        expires: '2025-11-30',
        savings: 0.75
      }
    ]
  },
  '011110856364': {
    name: 'Tide Liquid Laundry Detergent',
    category: 'Household',
    brand: 'Tide',
    size: '64 loads',
    prices: [
      { retailer: 'Walmart', price: 14.97, inStock: true, lastUpdated: new Date() },
      { retailer: 'Target', price: 16.99, inStock: true, lastUpdated: new Date() },
      { retailer: 'Amazon', price: 15.49, inStock: true, lastUpdated: new Date() }
    ],
    coupons: []
  },
  '070470002255': {
    name: 'Charmin Ultra Soft Toilet Paper',
    category: 'Household',
    brand: 'Charmin',
    size: '12 mega rolls',
    prices: [
      { retailer: 'Walmart', price: 24.94, inStock: true, lastUpdated: new Date() },
      { retailer: 'Target', price: 26.99, inStock: false, lastUpdated: new Date() },
      { retailer: 'Costco', price: 22.99, inStock: true, lastUpdated: new Date() }
    ],
    coupons: [
      {
        description: '$2 off Charmin products',
        code: 'CHARM2',
        expires: '2025-12-15',
        savings: 2.00
      }
    ]
  }
};

const seedDatabase = async () => {
  try {
    console.log('\n🌱 Seeding database with sample products...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    
    // Create products collection if it doesn't exist
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'products' }).toArray();
    
    if (collections.length === 0) {
      await db.createCollection('products');
      console.log('✓ Created products collection');
    }
    
    const productsCollection = db.collection('products');
    
    // Insert or update products
    let insertedCount = 0;
    let updatedCount = 0;
    
    for (const [barcode, productData] of Object.entries(sampleProducts)) {
      const result = await productsCollection.updateOne(
        { barcode },
        { $set: { ...productData, barcode, updatedAt: new Date() } },
        { upsert: true }
      );
      
      if (result.upsertedCount > 0) {
        insertedCount++;
      } else {
        updatedCount++;
      }
    }
    
    console.log(`✓ Inserted ${insertedCount} new products`);
    console.log(`✓ Updated ${updatedCount} existing products`);
    console.log(`\n✅ Database seeded successfully!`);
    console.log(`\nSample barcodes you can test:`);
    Object.keys(sampleProducts).forEach(barcode => {
      console.log(`  • ${barcode} - ${sampleProducts[barcode].name}`);
    });
    console.log('');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
