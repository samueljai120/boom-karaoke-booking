#!/bin/bash

# Boom Booking Backend Deployment Script
echo "🚀 Deploying Boom Booking Backend to Railway"
echo "============================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Installing..."
    npm install -g @railway/cli
fi

# Navigate to backend directory
cd backend

# Check if we're logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway first:"
    railway login
fi

echo "📦 Deploying backend to Railway..."
railway up

echo "✅ Backend deployment initiated!"
echo "🔗 Check your Railway dashboard for the deployment URL"
echo "📝 Update the API_BASE_URL in your frontend with the new backend URL"
