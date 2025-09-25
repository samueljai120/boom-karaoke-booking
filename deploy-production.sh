#!/bin/bash

# 🚀 Production Deployment Script for Boom Karaoke Booking System
# This script deploys both backend (Railway) and frontend (Vercel)

set -e

echo "🎯 Boom Karaoke Production Deployment Script"
echo "=============================================="

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Deploy backend to Railway
deploy_backend() {
    print_status "Deploying backend to Railway..."
    
    cd backend
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Login to Railway
    print_status "Logging into Railway..."
    railway login
    
    # Initialize Railway project if not already done
    if [ ! -f "railway.json" ]; then
        print_status "Initializing Railway project..."
        railway init
    fi
    
    # Set environment variables
    print_status "Setting environment variables..."
    railway variables set NODE_ENV=production
    railway variables set PORT=5000
    railway variables set JWT_SECRET=$(openssl rand -base64 32)
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
    print_status "Deploying to Railway..."
    railway up
    
    # Get the Railway URL
    RAILWAY_URL=$(railway domain)
    print_success "Backend deployed successfully!"
    print_status "Railway URL: $RAILWAY_URL"
    
    cd ..
    echo "$RAILWAY_URL" > railway_url.txt
}

# Deploy frontend to Vercel
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Login to Vercel
    print_status "Logging into Vercel..."
    vercel login
    
    # Read Railway URL
    if [ -f "railway_url.txt" ]; then
        RAILWAY_URL=$(cat railway_url.txt)
        print_status "Using Railway URL: $RAILWAY_URL"
    else
        print_warning "Railway URL not found. Please enter your Railway backend URL:"
        read -p "Railway URL: " RAILWAY_URL
    fi
    
    # Set environment variables for Vercel
    print_status "Setting Vercel environment variables..."
    vercel env add VITE_API_BASE_URL production <<< "$RAILWAY_URL/api"
    vercel env add VITE_WS_URL production <<< "$RAILWAY_URL"
    vercel env add VITE_APP_NAME production <<< "Boom Karaoke Booking"
    vercel env add VITE_APP_VERSION production <<< "1.0.0"
    
    # Deploy to Vercel
    print_status "Deploying to Vercel..."
    vercel --prod
    
    # Get the Vercel URL
    VERCEL_URL=$(vercel ls | grep -o 'https://[^[:space:]]*' | head -1)
    print_success "Frontend deployed successfully!"
    print_status "Vercel URL: $VERCEL_URL"
    
    echo "$VERCEL_URL" > vercel_url.txt
}

# Update CORS settings
update_cors() {
    print_status "Updating CORS settings..."
    
    if [ -f "vercel_url.txt" ]; then
        VERCEL_URL=$(cat vercel_url.txt)
        cd backend
        railway variables set CORS_ORIGIN="$VERCEL_URL"
        cd ..
        print_success "CORS updated with Vercel URL: $VERCEL_URL"
    else
        print_warning "Vercel URL not found. Please update CORS manually in Railway dashboard."
    fi
}

# Main deployment function
main() {
    echo "Starting production deployment..."
    echo ""
    
    check_dependencies
    
    # Ask user which services to deploy
    echo "Which services would you like to deploy?"
    echo "1) Backend only (Railway)"
    echo "2) Frontend only (Vercel)"
    echo "3) Both backend and frontend"
    echo "4) Update CORS settings only"
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            deploy_backend
            ;;
        2)
            deploy_frontend
            ;;
        3)
            deploy_backend
            deploy_frontend
            update_cors
            ;;
        4)
            update_cors
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Deployment completed successfully!"
    echo ""
    echo "📋 Deployment Summary:"
    if [ -f "railway_url.txt" ]; then
        echo "🔧 Backend (Railway): $(cat railway_url.txt)"
    fi
    if [ -f "vercel_url.txt" ]; then
        echo "🎨 Frontend (Vercel): $(cat vercel_url.txt)"
    fi
    echo ""
    echo "🔍 Next Steps:"
    echo "1. Test your deployed application"
    echo "2. Set up custom domains if needed"
    echo "3. Configure monitoring and alerts"
    echo "4. Set up SSL certificates"
    echo ""
    print_success "Happy deploying! 🚀"
}

# Run main function
main "$@"
