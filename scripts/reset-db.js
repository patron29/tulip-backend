// Reset database (development only!)
// Run with: npm run db:reset

const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const resetDatabase = async () => {
  try {
    console.log('\n⚠️  WARNING: This will delete ALL data in your database!\n');
    
    rl.question('Are you sure you want to continue? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() !== 'yes') {
        console.log('Reset cancelled.');
        rl.close();
        process.exit(0);
      }
      
      console.log('\n🗑️  Resetting database...\n');
      
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✓ Connected to MongoDB');
      
      const db = mongoose.connection.db;
      
      // Get all collections
      const collections = await db.listCollections().toArray();
      console.log(`Found ${collections.length} collection(s)`);
      
      // Drop each collection
      for (const collection of collections) {
        await db.dropCollection(collection.name);
        console.log(`✓ Dropped ${collection.name}`);
      }
      
      console.log('\n✅ Database reset complete!');
      console.log('\n💡 Tip: Run "npm run db:seed" to add sample data\n');
      
      await mongoose.connection.close();
      rl.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    rl.close();
    process.exit(1);
  }
};

resetDatabase();
