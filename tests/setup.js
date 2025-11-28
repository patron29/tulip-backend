// tests/setup.js
// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_testing_only';
process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/tulip_test';

// Increase timeout for database operations
jest.setTimeout(10000);

// Global test utilities
global.testHelpers = {
  // Generate random email for testing
  randomEmail: () => `test${Date.now()}@example.com`,
  
  // Generate random barcode
  randomBarcode: () => Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0'),
};