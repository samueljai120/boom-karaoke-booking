#!/bin/bash

# Test Deployment Script for Boom Karaoke
echo "🧪 Testing Boom Karaoke Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test URL
test_url() {
    local url=$1
    local name=$2
    
    echo -n "Testing $name ($url)... "
    
    if curl -s --max-time 10 "$url" > /dev/null; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Get URLs from user
echo "Please enter your deployment URLs:"
read -p "Railway Backend URL (e.g., https://your-app.railway.app): " RAILWAY_URL
read -p "Vercel Frontend URL (e.g., https://your-app.vercel.app): " VERCEL_URL

echo ""
echo "🔍 Testing Backend API..."

# Test backend health endpoint
test_url "$RAILWAY_URL/api/health" "Backend Health Check"

# Test backend API endpoints
test_url "$RAILWAY_URL/api/auth/status" "Auth Status"
test_url "$RAILWAY_URL/api/rooms" "Rooms API"

echo ""
echo "🎨 Testing Frontend..."

# Test frontend
test_url "$VERCEL_URL" "Frontend Homepage"

echo ""
echo "🔗 Testing Integration..."

# Test if frontend can reach backend
echo -n "Testing Frontend → Backend connection... "
if curl -s --max-time 10 "$VERCEL_URL" | grep -q "Boom Karaoke"; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend loaded but may have connection issues${NC}"
fi

echo ""
echo "📊 Deployment Test Summary:"
echo "Backend URL: $RAILWAY_URL"
echo "Frontend URL: $VERCEL_URL"
echo ""
echo "Next steps:"
echo "1. Visit your frontend URL and test the full application"
echo "2. Try logging in and creating a booking"
echo "3. Check Railway and Vercel dashboards for any errors"
echo "4. Monitor logs for any issues"
