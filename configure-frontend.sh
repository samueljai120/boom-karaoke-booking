#!/bin/bash

# Configure Frontend with Railway Backend URL
echo "🔧 Configuring Frontend with Railway Backend URL"
echo "=============================================="

if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Railway backend URL"
    echo "Usage: ./configure-frontend.sh https://your-app-name.railway.app"
    exit 1
fi

RAILWAY_URL="$1"
echo "🚀 Railway Backend URL: $RAILWAY_URL"

# Set environment variables in Vercel
echo "📝 Setting environment variables in Vercel..."

# Set API Base URL
echo "Setting VITE_API_BASE_URL..."
vercel env add VITE_API_BASE_URL <<< "$RAILWAY_URL/api"

# Set WebSocket URL
echo "Setting VITE_WS_URL..."
vercel env add VITE_WS_URL <<< "$RAILWAY_URL"

# Set App Name
echo "Setting VITE_APP_NAME..."
vercel env add VITE_APP_NAME <<< "Boom Karaoke Booking"

# Set App Version
echo "Setting VITE_APP_VERSION..."
vercel env add VITE_APP_VERSION <<< "1.0.0"

echo ""
echo "🔄 Redeploying frontend with new environment variables..."
vercel --prod --yes

echo ""
echo "✅ Frontend configuration complete!"
echo "🌐 Frontend URL: https://boom-booking-frontend-5el8sm1iv-samueljai120s-projects.vercel.app"
echo "🔗 Backend URL: $RAILWAY_URL"
echo ""
echo "🧪 Test your deployment:"
echo "1. Visit the frontend URL"
echo "2. Try logging in"
echo "3. Test booking functionality"
echo "4. Check Railway and Vercel dashboards for any errors"
