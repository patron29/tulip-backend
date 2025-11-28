// routes/scans.js
const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/scans
// @desc    Record a new scan
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { barcode, productName, prices } = req.body;

    // Get user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Reset monthly scans if needed
    await user.resetMonthlyScans();

    // Check scan limit
    if (!user.canScan()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Scan limit reached. Please upgrade your plan.',
        scansRemaining: 0
      });
    }

    // Create scan record
    const scan = new Scan({
      userId: user._id,
      barcode,
      productName,
      prices
    });

    await scan.save();

    // Increment user's scan count
    await user.incrementScans();

    res.status(201).json({
      success: true,
      data: {
        scan,
        scansRemaining: user.getScansRemaining()
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
    const scans = await Scan.find({ userId: req.userId })
      .sort({ scannedAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: {
        scans,
        count: scans.length
      }
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching scan history' 
    });
  }
});

// @route   GET /api/scans/:id
// @desc    Get single scan by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const scan = await Scan.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!scan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Scan not found' 
      });
    }

    res.json({
      success: true,
      data: { scan }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   DELETE /api/scans/:id
// @desc    Delete a scan
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const scan = await Scan.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!scan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Scan not found' 
      });
    }

    res.json({
      success: true,
      message: 'Scan deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;