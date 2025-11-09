// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'General'
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: null
  },
  ingredients: {
    type: String,
    default: ''
  },
  certifications: [{
    type: String
  }],
  nutritionFacts: {
    calories: Number,
    fat: Number,
    protein: Number,
    carbs: Number,
    sugar: Number,
    sodium: Number
  },
  averageRating: {
    type: Number,
    default: 0
  },
  scanCount: {
    type: Number,
    default: 0
  },
  prices: [{
    retailer: String,
    price: Number,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster searches
productSchema.index({ name: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);