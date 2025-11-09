# 🎯 QUICK START - DO THIS!

Hi Nicko! I've automated everything for you. Here's what to do:

## Step 1: Add Files to Your Repo

1. Download all the files I've created
2. Add them to your `tulip-backend` folder
3. Commit and push to GitHub:

```bash
cd tulip-backend
git add .
git commit -m "Add automated setup scripts"
git push
```

## Step 2: Run the Setup (On Your Computer)

**If you're on Mac/Linux:**
```bash
cd tulip-backend
chmod +x setup.sh
./setup.sh
```

**If you're on Windows:**
```bash
cd tulip-backend
setup.bat
```

The script will ask you a few questions:
- **MongoDB choice**: Choose option 1 (local) for now, it's easier
- **Frontend URL**: Just press Enter to use default (http://localhost:3000)

That's it! The script does everything else automatically.

## Step 3: Start Your Backend

```bash
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected Successfully
```

## Step 4: Test It Works

Open a new terminal:
```bash
./test-api.sh      # Mac/Linux
test-api.bat       # Windows
```

## What Gets Automated?

✅ Installs all dependencies (npm install)
✅ Creates .env file with secure settings
✅ Generates a random JWT secret
✅ Sets up MongoDB (guides you through it)
✅ Creates helper scripts for development
✅ Tests everything works

## Files I Created for You

**Setup Scripts:**
- `setup.sh` - Mac/Linux automated setup
- `setup.bat` - Windows automated setup
- `SETUP_GUIDE.md` - Detailed instructions
- `README.md` - Complete documentation

**Helper Scripts:**
- `test-connection.js` - Test MongoDB connection
- `setup-check.js` - Verify everything is configured
- `start-dev.sh` / `start-dev.bat` - Quick start commands
- `test-api.sh` / `test-api.bat` - API testing

**Database Tools:**
- `scripts/seed-products.js` - Add sample products
- `scripts/reset-db.js` - Reset database

**Updated:**
- `package.json` - Added useful npm scripts

## New NPM Commands Available

```bash
npm run dev          # Start with auto-reload
npm test             # Test MongoDB connection
npm run setup        # Check if setup is complete
npm run db:seed      # Add sample products
npm run db:reset     # Reset database (careful!)
```

## If You Get Stuck

1. Run: `npm run setup` to see what's missing
2. Run: `npm test` to test MongoDB connection
3. Check the README.md for troubleshooting

## MongoDB - Simplest Approach

**For development, use local MongoDB:**

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Install it
3. MongoDB should start automatically

That's it! Once MongoDB is installed, the setup script will connect to it automatically.

## What Happens After Setup?

1. You'll have a `.env` file (never commit this!)
2. Backend will be ready to run
3. Just start it with `npm run dev`
4. Connect your frontend by making sure authService.js uses:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

---

**TL;DR:** Run `setup.sh` (or `setup.bat`), install MongoDB, then `npm run dev`. Done! 🚀
