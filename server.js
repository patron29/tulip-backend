// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware - these help process requests
app.use(cors()); // Allows your React app to talk to this server
app.use(express.json()); // Lets us read JSON data

// Connect to MongoDB (we'll set this up next)
mongoose.connect('mongodb://localhost:27017/tulip')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Test route - just to make sure it's working
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Auth routes (we'll create these next)
app.use('/api/auth', require('./routes/auth'));

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// In server.js, add this line with your other routes:
app.use('/api/products', require('./routes/products'));