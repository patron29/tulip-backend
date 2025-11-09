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
