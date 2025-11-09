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

module.exports = mongoose.model('Scan', scanSchema);