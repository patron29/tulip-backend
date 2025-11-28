// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Scan limits by tier
const SCAN_LIMITS = {
  free: 5,
  basic: 100,
  premium: Infinity
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: '30d' }
  );
};

// Helper to format user response
const formatUserResponse = (user) => {
  const scansRemaining = user.tier === 'premium' 
    ? 'unlimited' 
    : Math.max(0, SCAN_LIMITS[user.tier] - user.scansThisMonth);
    
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    tier: user.tier,
    scansRemaining,
    scansThisMonth: user.scansThisMonth
  };
};

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      name,
      tier: 'free'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: formatUserResponse(user)
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during signup' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password using matchPassword method
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Reset scans if new month
    await user.resetMonthlyScans();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: formatUserResponse(user)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// @route   POST /api/auth/google
// @desc    Google Sign-In
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name } = req.body;

    if (!googleId || !email || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required Google authentication data' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ 
      $or: [{ googleId }, { email: email.toLowerCase() }] 
    });

    if (user) {
      // Update googleId if user exists but didn't have it
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        email: email.toLowerCase(),
        name,
        googleId,
        tier: 'free'
      });
      await user.save();
    }

    await user.resetMonthlyScans();

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: formatUserResponse(user)
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during Google authentication' 
    });
  }
});

// @route   POST /api/auth/apple
// @desc    Apple Sign-In
// @access  Public
router.post('/apple', async (req, res) => {
  try {
    const { appleId, email, name } = req.body;

    if (!appleId || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required Apple authentication data' 
      });
    }

    let user = await User.findOne({ 
      $or: [{ appleId }, { email: email.toLowerCase() }] 
    });

    if (user) {
      if (!user.appleId) {
        user.appleId = appleId;
        await user.save();
      }
    } else {
      user = new User({
        email: email.toLowerCase(),
        name: name || 'Apple User',
        appleId,
        tier: 'free'
      });
      await user.save();
    }

    await user.resetMonthlyScans();

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: formatUserResponse(user)
      }
    });
  } catch (error) {
    console.error('Apple auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during Apple authentication' 
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: formatUserResponse(req.user)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/auth/upgrade
// @desc    Upgrade user tier
// @access  Private
router.put('/upgrade', auth, async (req, res) => {
  try {
    const { tier } = req.body;

    if (!['basic', 'premium'].includes(tier)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid tier. Must be "basic" or "premium"' 
      });
    }

    req.user.tier = tier;
    req.user.subscriptionStartDate = new Date();
    
    // Set subscription end date to 1 month from now
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    req.user.subscriptionEndDate = endDate;
    
    await req.user.save();

    res.json({
      success: true,
      data: {
        user: formatUserResponse(req.user)
      }
    });
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during upgrade' 
    });
  }
});

// @route   PUT /api/auth/downgrade
// @desc    Downgrade user tier to free
// @access  Private
router.put('/downgrade', auth, async (req, res) => {
  try {
    req.user.tier = 'free';
    req.user.subscriptionStartDate = null;
    req.user.subscriptionEndDate = null;
    
    await req.user.save();

    res.json({
      success: true,
      data: {
        user: formatUserResponse(req.user)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error during downgrade' 
    });
  }
});

module.exports = router;