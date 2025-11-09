# Tulip Backend - Automated Setup

## 🚀 Quick Start (Automated)

### For Mac/Linux:
```bash
chmod +x setup.sh
./setup.sh
```

### For Windows:
```bash
setup.bat
```

That's it! The script will:
- ✅ Install all dependencies
- ✅ Generate secure JWT secret
- ✅ Create .env file with your settings
- ✅ Help you set up MongoDB
- ✅ Create helper scripts for development

---

## 📋 What the Setup Script Does

1. **Checks prerequisites** - Verifies Node.js and npm are installed
2. **Installs dependencies** - Runs `npm install`
3. **Generates JWT secret** - Creates a secure random key
4. **Sets up MongoDB** - Guides you through local or cloud setup
5. **Creates .env file** - All configuration in one place
6. **Creates helper scripts** - Quick commands for development

---

## 🎮 After Setup

### Start the server:
```bash
./start-dev.sh     # Mac/Linux
start-dev.bat      # Windows
```

Or use npm:
```bash
npm run dev
```

### Test the API:
```bash
./test-api.sh      # Mac/Linux
test-api.bat       # Windows
```

---

## 🔧 Manual Setup (if needed)

If you prefer to set things up manually:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tulip
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start MongoDB** (if using local):
   - Mac: `brew services start mongodb-community`
   - Windows: Start MongoDB service from Services
   - Linux: `sudo systemctl start mongod`

4. **Run the server:**
   ```bash
   npm run dev
   ```

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- **Local MongoDB**: Make sure MongoDB is running
  - Mac: `brew services list`
  - Windows: Check Services panel
  - Linux: `sudo systemctl status mongod`
- **Atlas**: Check your connection string and network access

### "Port 5000 already in use"
- Change `PORT=5001` in `.env`
- Update frontend API URL to match

### "Module not found"
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

---

## 📚 API Endpoints

Once running, your API will be available at `http://localhost:5000/api`

**Authentication:**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google Sign-In
- `POST /api/auth/apple` - Apple Sign-In
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/upgrade` - Upgrade subscription

**Scans:**
- `POST /api/scans` - Record a scan
- `GET /api/scans/history` - Get scan history

**Products:**
- `GET /api/products/:barcode` - Get product info

**Health:**
- `GET /api/health` - Check API status

---

## 🌐 Connect Frontend

In your React app's `authService.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

---

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | Database connection | `mongodb://localhost:27017/tulip` |
| `JWT_SECRET` | Secret for JWT tokens | Auto-generated |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

---

## 🎯 Development Workflow

1. **Start backend:**
   ```bash
   npm run dev
   ```

2. **Start frontend** (in separate terminal):
   ```bash
   cd ../tulip-frontend
   npm start
   ```

3. **Make changes** - Server auto-restarts with nodemon

4. **Test API** - Use the test script or tools like Postman

---

Need help? Check the main repository or open an issue!
