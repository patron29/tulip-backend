// models/Scan.js
const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  barcode: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  scannedAt: {
    type: Date,
    default: Date.now
  },
  prices: [{
    retailer: String,
    price: Number,
    inStock: Boolean
  }]
}, {
  timestamps: true
});

// Index for faster queries
scanSchema.index({ userId: 1, scannedAt: -1 });

module.exports = mongoose.model('Scan', scanSchema);