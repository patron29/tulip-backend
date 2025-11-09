// Verify that everything is set up correctly
const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking Tulip Backend Setup...\n');

let allGood = true;

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 16) {
  console.log(`✅ Node.js ${nodeVersion} (minimum 16.0.0)`);
} else {
  console.log(`❌ Node.js ${nodeVersion} - Please upgrade to 16.0.0 or higher`);
  allGood = false;
}

// Check if .env exists
if (fs.existsSync('.env')) {
  console.log('✅ .env file exists');
  
  // Check .env contents
  require('dotenv').config();
  const requiredVars = ['PORT', 'MONGODB_URI', 'JWT_SECRET', 'FRONTEND_URL'];
  let envComplete = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`   ✓ ${varName} is set`);
    } else {
      console.log(`   ❌ ${varName} is missing`);
      envComplete = false;
      allGood = false;
    }
  });
  
  if (!envComplete) {
    console.log('\n💡 Tip: Run the setup script to configure your .env file');
  }
} else {
  console.log('❌ .env file not found');
  console.log('💡 Run setup.sh (Mac/Linux) or setup.bat (Windows) to create it');
  allGood = false;
}

// Check if node_modules exists
if (fs.existsSync('node_modules')) {
  console.log('✅ Dependencies installed');
} else {
  console.log('❌ Dependencies not installed');
  console.log('💡 Run: npm install');
  allGood = false;
}

// Check required directories
const requiredDirs = ['models', 'routes', 'middleware', 'config'];
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/ directory exists`);
  } else {
    console.log(`❌ ${dir}/ directory missing`);
    allGood = false;
  }
});

// Check required files
const requiredFiles = ['server.js', 'package.json'];
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allGood = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 Everything looks good! You\'re ready to start.');
  console.log('\nNext steps:');
  console.log('  1. npm run dev    - Start the development server');
  console.log('  2. npm test       - Test MongoDB connection');
  console.log('='.repeat(50) + '\n');
  process.exit(0);
} else {
  console.log('⚠️  Some issues need to be fixed before starting.');
  console.log('\nRun the setup script or fix the issues above.');
  console.log('='.repeat(50) + '\n');
  process.exit(1);
}
