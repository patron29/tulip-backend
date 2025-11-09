const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');
const auth = require('../middleware/auth');

// @route   POST /api/scans
// @desc    Record a new scan
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { barcode, productName, prices } = req.body;

    // Check scan limit
    if (!req.user.canScan()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Scan limit reached. Please upgrade your plan.' 
      });
    }

    // Create scan record
    const scan = new Scan({
      userId: req.user._id,
      barcode,
      productName,
      prices
    });

    await scan.save();

    // Increment user's scan count
    await req.user.incrementScans();

    const scanLimits = {
      free: 5,
      basic: 100,
      premium: Infinity
    };

    res.json({
      success: true,
      data: {
        scan,
        scansRemaining: req.user.tier === 'premium' ? 
          'unlimited' : 
          scanLimits[req.user.tier] - req.user.scansThisMonth
      }
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during scan' 
    });
  }
});

// @route   GET /api/scans/history
// @desc    Get user's scan history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const scans = await Scan.find({ userId: req.user._id })
      .sort({ scannedAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: scans
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;