#!/bin/bash

# Master Deployment Script for Boom Karaoke
echo "🚀 Boom Karaoke - Complete Deployment Script"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the Boom-Booking-Isolate directory"
    exit 1
fi

print_status "Starting deployment process..."

# Step 1: Deploy Backend to Railway
echo ""
echo "🚀 Step 1: Deploying Backend to Railway"
echo "======================================"

print_status "Checking Railway CLI..."
if ! command -v railway &> /dev/null; then
    print_warning "Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

print_status "Deploying backend..."
cd backend
if [ -f "railway-deploy.sh" ]; then
    chmod +x railway-deploy.sh
    print_status "Running Railway deployment script..."
    echo "Note: You'll need to login to Railway interactively"
    ./railway-deploy.sh
else
    print_warning "Railway deployment script not found. Please deploy manually:"
    echo "1. Go to https://railway.app"
    echo "2. Create new project from GitHub"
    echo "3. Select backend directory: Boom-Booking-Isolate/backend"
    echo "4. Set environment variables as shown in DEPLOYMENT_INSTRUCTIONS.md"
fi

# Get Railway URL
echo ""
read -p "Enter your Railway backend URL (e.g., https://your-app.railway.app): " RAILWAY_URL

# Step 2: Deploy Frontend to Vercel
echo ""
echo "🎨 Step 2: Deploying Frontend to Vercel"
echo "======================================"

cd ..

print_status "Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

print_status "Deploying frontend..."
if [ -f "vercel-deploy.sh" ]; then
    chmod +x vercel-deploy.sh
    print_status "Running Vercel deployment script..."
    echo "Note: You'll need to login to Vercel interactively"
    ./vercel-deploy.sh
else
    print_warning "Vercel deployment script not found. Please deploy manually:"
    echo "1. Go to https://vercel.com"
    echo "2. Create new project from GitHub"
    echo "3. Select root directory: Boom-Booking-Isolate"
    echo "4. Set environment variables as shown in DEPLOYMENT_INSTRUCTIONS.md"
fi

# Get Vercel URL
echo ""
read -p "Enter your Vercel frontend URL (e.g., https://your-app.vercel.app): " VERCEL_URL

# Step 3: Update CORS Configuration
echo ""
echo "🔧 Step 3: Updating CORS Configuration"
echo "====================================="

print_status "Updating Railway CORS_ORIGIN to allow Vercel frontend..."
if command -v railway &> /dev/null; then
    cd backend
    railway variables set CORS_ORIGIN="$VERCEL_URL"
    print_status "Redeploying Railway with updated CORS..."
    railway up
    cd ..
else
    print_warning "Please update CORS_ORIGIN in Railway dashboard to: $VERCEL_URL"
fi

# Step 4: Test Deployment
echo ""
echo "🧪 Step 4: Testing Deployment"
echo "============================"

print_status "Running deployment tests..."
if [ -f "test-deployment.sh" ]; then
    chmod +x test-deployment.sh
    # Set URLs for testing
    export RAILWAY_URL="$RAILWAY_URL"
    export VERCEL_URL="$VERCEL_URL"
    ./test-deployment.sh
else
    print_warning "Test script not found. Please test manually:"
    echo "1. Visit $VERCEL_URL"
    echo "2. Test login and booking functionality"
    echo "3. Check Railway and Vercel dashboards for errors"
fi

# Final Summary
echo ""
echo "🎉 Deployment Complete!"
echo "======================"
print_success "Backend URL: $RAILWAY_URL"
print_success "Frontend URL: $VERCEL_URL"
echo ""
print_status "Next steps:"
echo "1. Visit your frontend URL and test the full application"
echo "2. Monitor Railway and Vercel dashboards for any issues"
echo "3. Set up custom domains if needed"
echo "4. Configure monitoring and alerts"
echo ""
print_status "For troubleshooting, see DEPLOYMENT_INSTRUCTIONS.md"
