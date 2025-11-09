// Test MongoDB connection and environment setup
const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  console.log('\n🔍 Testing Backend Configuration...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log(`  ✓ PORT: ${process.env.PORT || '❌ Not set'}`);
  console.log(`  ✓ NODE_ENV: ${process.env.NODE_ENV || '❌ Not set'}`);
  console.log(`  ✓ MONGODB_URI: ${process.env.MONGODB_URI ? '✓ Set' : '❌ Not set'}`);
  console.log(`  ✓ JWT_SECRET: ${process.env.JWT_SECRET ? '✓ Set' : '❌ Not set'}`);
  console.log(`  ✓ FRONTEND_URL: ${process.env.FRONTEND_URL || '❌ Not set'}`);
  console.log('');
  
  // Test MongoDB connection
  console.log('Testing MongoDB connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connection successful!\n');
    
    // Test database operations
    console.log('Testing database operations...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✓ Found ${collections.length} collection(s)`);
    
    await mongoose.connection.close();
    console.log('✅ All tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error(`   ${error.message}\n`);
    console.log('Troubleshooting:');
    console.log('  1. Make sure MongoDB is running');
    console.log('  2. Check your MONGODB_URI in .env');
    console.log('  3. If using Atlas, check network access settings\n');
    process.exit(1);
  }
};

testConnection();
