#!/bin/bash

# 🚀 Local Development Setup Script
# This script sets up the local development environment for Vercel + Neon

echo "🚀 Setting up local development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20.x first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20.x or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Vercel CLI"
        exit 1
    fi
else
    echo "✅ Vercel CLI $(vercel --version) detected"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "🔧 Creating .env.local file..."
    cat > .env.local << 'EOF'
# Local Development Environment Variables
# This file is for local development with Vercel CLI and Neon database

# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_gPcJ0YO9QZzN@ep-patient-surf-ad9p9gn0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-change-this-now-local-dev
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000

# App Configuration
VITE_APP_NAME=Boom Karaoke Booking
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_MODE=true
NODE_ENV=development
EOF
    echo "✅ .env.local file created"
else
    echo "✅ .env.local file already exists"
fi

# Test database connection
echo "🗄️ Testing database connection..."
curl -s http://localhost:3000/api/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database connection test passed"
else
    echo "⚠️  Database connection test failed (server not running yet)"
fi

echo ""
echo "🎉 Local development setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start development server: vercel dev"
echo "2. Open browser: http://localhost:3000"
echo "3. Test login: demo@example.com / demo123"
echo ""
echo "📚 For detailed instructions, see: LOCAL_DEVELOPMENT_SETUP.md"
echo ""
echo "🚀 Ready to start development!"
