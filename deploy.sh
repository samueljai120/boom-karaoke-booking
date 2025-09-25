#!/bin/bash

# Boom Booking App Deployment Script
# This script deploys the app to production

set -e

echo "🚀 Starting Boom Booking App Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Build production image
echo "📦 Building production image..."
docker build -f Dockerfile.production -t boom-booking-app:latest .

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.production.yml down || true

# Start production containers
echo "🚀 Starting production containers..."
docker-compose -f docker-compose.production.yml up -d

# Wait for health check
echo "⏳ Waiting for application to be healthy..."
sleep 30

# Check health
if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
    echo "🌐 Application is running at: http://localhost:5001"
    echo "🔌 API is available at: http://localhost:5001/api"
else
    echo "❌ Deployment failed. Application is not healthy."
    echo "📋 Checking logs..."
    docker-compose -f docker-compose.production.yml logs app
    exit 1
fi

echo "🎉 Boom Booking App is now live!"
