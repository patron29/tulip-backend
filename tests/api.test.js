// tests/api.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // We'll need to export app from server.js
const User = require('../models/User');
const Product = require('../models/Product');

let authToken;
let userId;

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/tulip_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // Clean up and close connection
  await User.deleteMany({});
  await Product.deleteMany({});
  await mongoose.connection.close();
});

describe('Health Check', () => {
  test('GET /api/health should return 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Tulip API is running');
  });
});

describe('Authentication', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'testpassword123',
    name: 'Test User'
  };

  test('POST /api/auth/signup should create new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.tier).toBe('free');
    
    authToken = res.body.data.token;
    userId = res.body.data.user.id;
  });

  test('POST /api/auth/signup should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login should authenticate user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  test('POST /api/auth/login should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me should return current user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  test('GET /api/auth/me should reject invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid_token');

    expect(res.statusCode).toBe(401);
  });
});

describe('Products', () => {
  const testProduct = {
    barcode: '012000161551',
    name: 'Coca-Cola Classic 12pk',
    brand: 'Coca-Cola',
    category: 'Beverages',
    description: 'Classic Coca-Cola 12 pack cans',
    prices: [
      { retailer: 'Walmart', price: 5.99, inStock: true },
      { retailer: 'Target', price: 6.49, inStock: true }
    ]
  };

  beforeAll(async () => {
    // Add test product
    const product = new Product(testProduct);
    await product.save();
  });

  test('GET /api/products/:barcode should return product', async () => {
    const res = await request(app)
      .get(`/api/products/${testProduct.barcode}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.barcode).toBe(testProduct.barcode);
    expect(res.body.data.name).toBe(testProduct.name);
  });

  test('GET /api/products/:barcode should return 404 for non-existent product', async () => {
    const res = await request(app)
      .get('/api/products/999999999999')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/products/:barcode should reject unauthenticated request', async () => {
    const res = await request(app)
      .get(`/api/products/${testProduct.barcode}`);

    expect(res.statusCode).toBe(401);
  });
});

describe('Scans', () => {
  test('POST /api/scans should record scan', async () => {
    const scanData = {
      barcode: '012000161551',
      productName: 'Coca-Cola Classic',
      prices: [
        { retailer: 'Walmart', price: 5.99, inStock: true }
      ]
    };

    const res = await request(app)
      .post('/api/scans')
      .set('Authorization', `Bearer ${authToken}`)
      .send(scanData);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.scan).toBeDefined();
    expect(res.body.data.scansRemaining).toBeDefined();
  });

  test('GET /api/scans/history should return scan history', async () => {
    const res = await request(app)
      .get('/api/scans/history')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('POST /api/scans should reject unauthenticated request', async () => {
    const res = await request(app)
      .post('/api/scans')
      .send({
        barcode: '012000161551',
        productName: 'Test Product'
      });

    expect(res.statusCode).toBe(401);
  });
});

describe('Tier Upgrade', () => {
  test('PUT /api/auth/upgrade should upgrade user tier', async () => {
    const res = await request(app)
      .put('/api/auth/upgrade')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ tier: 'premium' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.tier).toBe('premium');
  });

  test('PUT /api/auth/upgrade should reject invalid tier', async () => {
    const res = await request(app)
      .put('/api/auth/upgrade')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ tier: 'invalid_tier' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Social Authentication', () => {
  test('POST /api/auth/google should authenticate Google user', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({
        googleId: 'google_test_123',
        email: 'googleuser@test.com',
        name: 'Google Test User'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('googleuser@test.com');
  });

  test('POST /api/auth/apple should authenticate Apple user', async () => {
    const res = await request(app)
      .post('/api/auth/apple')
      .send({
        appleId: 'apple_test_123',
        email: 'appleuser@test.com',
        name: 'Apple Test User'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });
});