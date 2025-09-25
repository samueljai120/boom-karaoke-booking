@echo off
echo 🚀 Setting Railway Environment Variables...
echo.

railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set JWT_SECRET=your-super-secure-jwt-secret-change-this-now-$(Get-Random)
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

echo.
echo ✅ Environment variables set successfully!
echo 🚀 Ready to deploy...
