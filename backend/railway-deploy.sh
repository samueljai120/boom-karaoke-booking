#!/bin/bash

# Railway Deployment Script for Boom Karaoke Backend
echo "🚀 Deploying Boom Karaoke Backend to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (interactive)
echo "🔐 Please login to Railway..."
railway login

# Initialize Railway project if not already done
echo "📁 Initializing Railway project..."
railway init

# Set environment variables
echo "🔧 Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=5001
railway variables set JWT_SECRET=your-super-secure-jwt-secret-for-production-change-this-now
railway variables set JWT_EXPIRES_IN=7d
railway variables set JWT_REFRESH_EXPIRES_IN=30d
railway variables set CORS_ORIGIN=*
railway variables set BCRYPT_ROUNDS=12
railway variables set RATE_LIMIT_WINDOW_MS=900000
railway variables set RATE_LIMIT_MAX_REQUESTS=100
railway variables set LOG_LEVEL=info
railway variables set ENABLE_METRICS=true
railway variables set DEFAULT_TIMEZONE=America/New_York
railway variables set DEFAULT_CURRENCY=USD
railway variables set BOOKING_ADVANCE_DAYS=30
railway variables set BOOKING_MIN_DURATION=60
railway variables set BOOKING_MAX_DURATION=480

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your backend will be available at: https://your-app.railway.app"
echo "📊 Monitor your deployment at: https://railway.app/dashboard"
