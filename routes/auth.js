const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: '30d' }
  );
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

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Create new user
    const user = new User({
      email,
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
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          tier: user.tier,
          scansRemaining: 5 - user.scansThisMonth
        }
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
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

    const scanLimits = {
      free: 5,
      basic: 100,
      premium: Infinity
    };

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          tier: user.tier,
          scansRemaining: user.tier === 'premium' ? 
            'unlimited' : 
            scanLimits[user.tier] - user.scansThisMonth
        }
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
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update googleId if user exists but didn't have it
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        email,
        name,
        googleId,
        tier: 'free'
      });
      await user.save();
    }

    await user.resetMonthlyScans();

    const token = generateToken(user._id);

    const scanLimits = {
      free: 5,
      basic: 100,
      premium: Infinity
    };

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          tier: user.tier,
          scansRemaining: user.tier === 'premium' ? 
            'unlimited' : 
            scanLimits[user.tier] - user.scansThisMonth
        }
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

    let user = await User.findOne({ $or: [{ appleId }, { email }] });

    if (user) {
      if (!user.appleId) {
        user.appleId = appleId;
        await user.save();
      }
    } else {
      user = new User({
        email,
        name: name || 'Apple User',
        appleId,
        tier: 'free'
      });
      await user.save();
    }

    await user.resetMonthlyScans();

    const token = generateToken(user._id);

    const scanLimits = {
      free: 5,
      basic: 100,
      premium: Infinity
    };

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          tier: user.tier,
          scansRemaining: user.tier === 'premium' ? 
            'unlimited' : 
            scanLimits[user.tier] - user.scansThisMonth
        }
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
    const scanLimits = {
      free: 5,
      basic: 100,
      premium: Infinity
    };

    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          tier: req.user.tier,
          scansRemaining: req.user.tier === 'premium' ? 
            'unlimited' : 
            scanLimits[req.user.tier] - req.user.scansThisMonth
        }
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
        message: 'Invalid tier' 
      });
    }

    req.user.tier = tier;
    req.user.subscriptionStartDate = new Date();
    
    // Set subscription end date to 1 month from now
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    req.user.subscriptionEndDate = endDate;
    
    await req.user.save();

    const scanLimits = {
      free: 5,
      basic: 100,
      premium: Infinity
    };

    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          tier: req.user.tier,
          scansRemaining: req.user.tier === 'premium' ? 
            'unlimited' : 
            scanLimits[req.user.tier] - req.user.scansThisMonth
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;