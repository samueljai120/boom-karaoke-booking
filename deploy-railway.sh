#!/bin/bash

# Boom Booking - Railway Deployment Script
echo "🚀 Deploying Boom Booking Backend to Railway"
echo "============================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway whoami || railway login

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

# Check deployment status
echo "🔍 Checking deployment status..."
railway status

echo "✅ Deployment complete!"
echo "🌐 Your backend should be available at: https://your-app.railway.app"
echo "🏥 Health check: https://your-app.railway.app/api/health"
