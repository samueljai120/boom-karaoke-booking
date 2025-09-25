#!/bin/bash

# Railway Deployment Fix Script
# This script ensures the backend server starts properly on Railway

echo "🚀 Starting Railway Backend Deployment Fix..."

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm ci --only=production

# Check if server-simple-railway.js exists
if [ ! -f "server-simple-railway.js" ]; then
    echo "❌ server-simple-railway.js not found!"
    echo "🔧 Falling back to regular server.js..."
    exec node server.js
else
    echo "✅ Starting simplified Railway server..."
    exec node server-simple-railway.js
fi
