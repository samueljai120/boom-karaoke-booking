#!/bin/bash

# Vercel Deployment Script for Boom Karaoke Frontend
echo "🎨 Deploying Boom Karaoke Frontend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (interactive)
echo "🔐 Please login to Vercel..."
vercel login

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

# Set environment variables
echo "🔧 Setting environment variables..."
echo "Please set these environment variables in your Vercel dashboard:"
echo ""
echo "VITE_API_BASE_URL=https://your-railway-backend.railway.app/api"
echo "VITE_WS_URL=https://your-railway-backend.railway.app"
echo "VITE_APP_NAME=Boom Karaoke Booking"
echo "VITE_APP_VERSION=1.0.0"
echo ""

# Optionally set via CLI (requires manual input)
read -p "Do you want to set environment variables now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Setting VITE_API_BASE_URL..."
    vercel env add VITE_API_BASE_URL
    echo "Setting VITE_WS_URL..."
    vercel env add VITE_WS_URL
    echo "Setting VITE_APP_NAME..."
    vercel env add VITE_APP_NAME
    echo "Setting VITE_APP_VERSION..."
    vercel env add VITE_APP_VERSION
fi

echo "✅ Deployment complete!"
echo "🌐 Your frontend will be available at: https://your-app.vercel.app"
echo "📊 Monitor your deployment at: https://vercel.com/dashboard"
