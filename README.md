# 🌷 Tulip Backend - One-Click Setup

Welcome! This backend is designed to get you up and running in **less than 2 minutes**.

## 🚀 Super Quick Start

### Step 1: Clone the repo
```bash
git clone https://github.com/patron29/tulip-backend.git
cd tulip-backend
```

### Step 2: Run the setup script

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```bash
setup.bat
```

### Step 3: Start coding!
```bash
npm run dev
```

That's it! 🎉

---

## 📦 What You Get

The automated setup handles everything:

- ✅ **Dependencies** - Installs all npm packages
- ✅ **Environment Config** - Creates `.env` with secure settings
- ✅ **JWT Secret** - Generates cryptographically secure token
- ✅ **MongoDB Setup** - Guides you through local or cloud setup
- ✅ **Helper Scripts** - Quick commands for common tasks
- ✅ **Sample Data** - Optional product seeding

---

## 🎮 Quick Commands

After setup, you have these commands available:

```bash
npm run dev          # Start development server with auto-reload
npm start            # Start production server
npm test             # Test MongoDB connection and config
npm run setup        # Verify setup is complete
npm run db:seed      # Add sample products to database
npm run db:reset     # Reset database (⚠️ deletes all data)
```

**Helper scripts created by setup:**
```bash
./start-dev.sh       # Quick start (Mac/Linux)
./test-api.sh        # Test all endpoints (Mac/Linux)
start-dev.bat        # Quick start (Windows)
test-api.bat         # Test all endpoints (Windows)
```

---

## 🏗️ Project Structure

```
tulip-backend/
├── config/
│   └── db.js                 # MongoDB connection
├── middleware/
│   └── auth.js               # JWT authentication
├── models/
│   ├── User.js               # User schema
│   └── Scan.js               # Scan history schema
├── routes/
│   ├── auth.js               # Authentication endpoints
│   ├── products.js           # Product lookup
│   └── scans.js              # Scan tracking
├── scripts/
│   ├── seed-products.js      # Sample data
│   └── reset-db.js           # Database reset
├── .env                      # Environment variables (auto-generated)
├── .gitignore
├── server.js                 # Main server file
├── package.json
├── setup.sh                  # Mac/Linux setup script
├── setup.bat                 # Windows setup script
└── test-connection.js        # Connection tester
```

---

## 🔑 API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Email/password login
- `POST /auth/google` - Google Sign-In
- `POST /auth/apple` - Apple Sign-In
- `GET /auth/me` - Get current user (requires auth)
- `PUT /auth/upgrade` - Upgrade subscription tier (requires auth)

### Scans
- `POST /scans` - Record new scan (requires auth)
- `GET /scans/history` - Get scan history (requires auth)

### Products
- `GET /products/:barcode` - Get product info by barcode (requires auth)

### System
- `GET /health` - Health check

---

## 🧪 Testing the API

After starting the server, test it:

**Using the test script:**
```bash
./test-api.sh        # Mac/Linux
test-api.bat         # Windows
```

**Using curl:**
```bash
# Health check
curl http://localhost:5000/api/health

# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

---

## 🗄️ Database Setup

The setup script will ask you to choose:

### Option 1: Local MongoDB (Recommended for development)

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
1. Download from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install and start the MongoDB service

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

### Option 2: MongoDB Atlas (Cloud - Free tier)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up (free)
3. Create a cluster (M0 free tier)
4. Create database user
5. Whitelist IP: `0.0.0.0/0` (for development)
6. Get connection string
7. Paste it when setup script asks

---

## 🔐 Security Features

- ✅ **Password Hashing** - bcryptjs with salt rounds
- ✅ **JWT Tokens** - 30-day expiration
- ✅ **CORS Protection** - Configured for your frontend
- ✅ **Environment Variables** - Sensitive data in `.env`
- ✅ **Input Validation** - All endpoints validated
- ✅ **Error Handling** - Comprehensive error messages

---

## 💡 Subscription Tiers

| Tier | Price | Scans/Month | Features |
|------|-------|-------------|----------|
| **Free** | $0 | 5 | Basic price comparison (2 retailers) |
| **Basic** | $4.99 | 100 | Full price comparison (all retailers) |
| **Premium** | $9.99 | Unlimited | Everything + coupons + price alerts |

Limits are enforced automatically by the backend.

---

## 🔧 Configuration

All configuration is in `.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/tulip

# Security
JWT_SECRET=<auto-generated-secure-key>

# Frontend
FRONTEND_URL=http://localhost:3000
```

---

## 🌐 Connecting Your Frontend

In your React app's `authService.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

Make sure your frontend URL matches `FRONTEND_URL` in `.env` for CORS to work.

---

## 🐛 Troubleshooting

### Setup fails
```bash
npm run setup        # Verify what's missing
```

### Can't connect to MongoDB
```bash
npm test             # Test connection
```

**If using local MongoDB:**
- Make sure it's running: `brew services list` (Mac)
- Check logs: `tail -f /usr/local/var/log/mongodb/mongo.log`

**If using Atlas:**
- Check network access (whitelist 0.0.0.0/0 for development)
- Verify connection string in `.env`
- Check database user credentials

### Port already in use
Change `PORT` in `.env` to something else (e.g., 5001)

### CORS errors
- Verify `FRONTEND_URL` matches your React app
- Make sure both frontend and backend are running

### Module errors
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Sample Products

After seeding (`npm run db:seed`), you can test with these barcodes:

- `012000161551` - Coca-Cola Classic 12pk
- `028400064057` - Doritos Nacho Cheese
- `016000119949` - Cheerios Original
- `011110856364` - Tide Laundry Detergent
- `070470002255` - Charmin Toilet Paper

---

## 🚀 Production Deployment

Before deploying to production:

1. **Change JWT_SECRET** to a new secure value
2. **Use MongoDB Atlas** instead of local MongoDB
3. **Set NODE_ENV=production**
4. **Update FRONTEND_URL** to your production domain
5. **Enable HTTPS**
6. **Add rate limiting** (consider express-rate-limit)

---

## 📚 Next Steps

1. ✅ Run setup script
2. ✅ Start server: `npm run dev`
3. ✅ Seed database: `npm run db:seed`
4. ✅ Test API: `./test-api.sh`
5. ✅ Connect frontend
6. ✅ Start building!

---

## 🤝 Need Help?

- Check `SETUP_GUIDE.md` for detailed instructions
- Run `npm run setup` to verify everything
- Check the GitHub issues
- Review the error logs

---

**Built with ❤️ for easy setup and great developer experience**
