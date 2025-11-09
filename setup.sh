#!/bin/bash

# Tulip Backend - Automated Setup Script
# This script automates the entire backend setup process

set -e  # Exit on error

echo "🌷 Welcome to Tulip Backend Setup!"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
print_success "Node.js $(node -v) found"

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi
print_success "npm $(npm -v) found"

echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
print_success "Dependencies installed"
echo ""

# Generate random JWT secret
echo "🔐 Generating secure JWT secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
print_success "JWT secret generated"
echo ""

# Create .env file
echo "⚙️  Creating .env file..."
if [ -f .env ]; then
    print_info ".env file already exists. Creating backup..."
    cp .env .env.backup
    print_success "Backup created as .env.backup"
fi

# Ask user for MongoDB setup preference
echo ""
echo "How do you want to set up MongoDB?"
echo "1) Local MongoDB (you'll install it separately)"
echo "2) MongoDB Atlas (cloud - I'll guide you)"
echo ""
read -p "Choose option (1 or 2): " mongo_choice

if [ "$mongo_choice" = "2" ]; then
    echo ""
    print_info "MongoDB Atlas Setup:"
    echo "1. Go to https://www.mongodb.com/atlas"
    echo "2. Sign up for free"
    echo "3. Create a new cluster (free tier)"
    echo "4. Create a database user with password"
    echo "5. Whitelist your IP (or use 0.0.0.0/0 for development)"
    echo "6. Get your connection string (looks like mongodb+srv://...)"
    echo ""
    read -p "Enter your MongoDB Atlas connection string: " MONGODB_URI
else
    MONGODB_URI="mongodb://localhost:27017/tulip"
    print_info "Using local MongoDB. Make sure MongoDB is running on your machine!"
    
    # Try to detect if MongoDB is installed
    if command -v mongod &> /dev/null; then
        print_success "MongoDB found on system"
    elif command -v brew &> /dev/null; then
        echo ""
        read -p "MongoDB not found. Install it now via Homebrew? (y/n): " install_mongo
        if [ "$install_mongo" = "y" ]; then
            echo "Installing MongoDB..."
            brew tap mongodb/brew
            brew install mongodb-community
            brew services start mongodb-community
            print_success "MongoDB installed and started"
        fi
    else
        print_info "Please install MongoDB manually: https://www.mongodb.com/try/download/community"
    fi
fi

# Get frontend URL
echo ""
read -p "Enter your frontend URL (press Enter for http://localhost:3000): " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}

# Create .env file
cat > .env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=$MONGODB_URI

# Security
JWT_SECRET=$JWT_SECRET

# Frontend
FRONTEND_URL=$FRONTEND_URL
EOF

print_success ".env file created"
echo ""

# Create a quick start script
cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🌷 Starting Tulip Backend..."
npm run dev
EOF
chmod +x start-dev.sh

cat > test-api.sh << 'EOF'
#!/bin/bash
echo "🧪 Testing Tulip API..."
echo ""
echo "1. Health Check:"
curl -s http://localhost:5000/api/health | json_pp || curl -s http://localhost:5000/api/health
echo ""
echo ""
echo "2. Testing Signup:"
curl -s -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}' | json_pp || \
curl -s -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
echo ""
EOF
chmod +x test-api.sh

print_success "Helper scripts created (start-dev.sh, test-api.sh)"
echo ""

# Display summary
echo "=================================="
echo "🎉 Setup Complete!"
echo "=================================="
echo ""
echo "Your configuration:"
echo "  • MongoDB: ${MONGODB_URI%%@*}@***"
echo "  • Frontend: $FRONTEND_URL"
echo "  • Port: 5000"
echo ""
echo "Quick commands:"
echo "  • Start server:    ./start-dev.sh  (or npm run dev)"
echo "  • Test API:        ./test-api.sh"
echo "  • View logs:       npm run dev"
echo ""
echo "Next steps:"
echo "  1. Start the backend: ./start-dev.sh"
echo "  2. In another terminal, test it: ./test-api.sh"
echo "  3. Update your frontend's API_BASE_URL to: http://localhost:5000/api"
echo ""
print_success "Happy coding! 🌷"
