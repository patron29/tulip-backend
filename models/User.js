// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      // Password not required for social login users
      return !this.googleId && !this.appleId;
    }
  },
  name: {
    type: String,
    required: true
  },
  tier: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free'
  },
  scansThisMonth: {
    type: Number,
    default: 0
  },
  lastScanReset: {
    type: Date,
    default: Date.now
  },
  // Social login fields
  googleId: {
    type: String,
    sparse: true
  },
  appleId: {
    type: String,
    sparse: true
  },
  // Subscription fields
  subscriptionStartDate: {
    type: Date
  },
  subscriptionEndDate: {
    type: Date
  },
  // Saved products
  savedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Scan limits by tier
const SCAN_LIMITS = {
  free: 5,
  basic: 100,
  premium: Infinity
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password (matchPassword)
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Alias for matchPassword (comparePassword) - used in some routes
userSchema.methods.comparePassword = async function(enteredPassword) {
  return this.matchPassword(enteredPassword);
};

// Check if user can scan (has remaining scans)
userSchema.methods.canScan = function() {
  // Premium users have unlimited scans
  if (this.tier === 'premium') return true;
  
  // Check if we need to reset monthly scans
  const now = new Date();
  const lastReset = new Date(this.lastScanReset);
  
  if (now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    // New month, reset will happen in resetMonthlyScans
    return true;
  }
  
  const limit = SCAN_LIMITS[this.tier] || SCAN_LIMITS.free;
  return this.scansThisMonth < limit;
};

// Get remaining scans
userSchema.methods.getScansRemaining = function() {
  if (this.tier === 'premium') return 'unlimited';
  
  const limit = SCAN_LIMITS[this.tier] || SCAN_LIMITS.free;
  return Math.max(0, limit - this.scansThisMonth);
};

// Increment scan count
userSchema.methods.incrementScans = async function() {
  // Reset if new month
  await this.resetMonthlyScans();
  
  this.scansThisMonth += 1;
  await this.save();
};

// Reset monthly scans if new month
userSchema.methods.resetMonthlyScans = async function() {
  const now = new Date();
  const lastReset = new Date(this.lastScanReset);
  
  if (now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    this.scansThisMonth = 0;
    this.lastScanReset = now;
    await this.save();
  }
};

// Don't return password in JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);