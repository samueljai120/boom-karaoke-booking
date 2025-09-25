@echo off
REM 🚀 Production Deployment Script for Boom Karaoke Booking System
REM This script deploys both backend (Railway) and frontend (Vercel)

echo 🎯 Boom Karaoke Production Deployment Script
echo ==============================================

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [SUCCESS] Dependencies check passed

echo.
echo Which services would you like to deploy?
echo 1) Backend only (Railway)
echo 2) Frontend only (Vercel)
echo 3) Both backend and frontend
echo 4) Update CORS settings only
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto deploy_backend
if "%choice%"=="2" goto deploy_frontend
if "%choice%"=="3" goto deploy_both
if "%choice%"=="4" goto update_cors
goto invalid_choice

:deploy_backend
echo [INFO] Deploying backend to Railway...
cd backend

REM Check if Railway CLI is installed
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Installing Railway CLI...
    npm install -g @railway/cli
)

echo [INFO] Logging into Railway...
railway login

echo [INFO] Setting environment variables...
railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set JWT_SECRET=your-super-secure-jwt-secret-for-production-change-this-now
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

echo [INFO] Deploying to Railway...
railway up

echo [SUCCESS] Backend deployed successfully!
cd ..
goto end

:deploy_frontend
echo [INFO] Deploying frontend to Vercel...

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Installing Vercel CLI...
    npm install -g vercel
)

echo [INFO] Logging into Vercel...
vercel login

echo [INFO] Setting Vercel environment variables...
set /p railway_url="Enter your Railway backend URL: "
vercel env add VITE_API_BASE_URL production
echo %railway_url%/api
vercel env add VITE_WS_URL production
echo %railway_url%
vercel env add VITE_APP_NAME production
echo Boom Karaoke Booking
vercel env add VITE_APP_VERSION production
echo 1.0.0

echo [INFO] Deploying to Vercel...
vercel --prod

echo [SUCCESS] Frontend deployed successfully!
goto end

:deploy_both
call :deploy_backend
call :deploy_frontend
goto update_cors

:update_cors
echo [INFO] Updating CORS settings...
set /p vercel_url="Enter your Vercel frontend URL: "
cd backend
railway variables set CORS_ORIGIN=%vercel_url%
cd ..
echo [SUCCESS] CORS updated with Vercel URL: %vercel_url%
goto end

:invalid_choice
echo [ERROR] Invalid choice. Please run the script again.
pause
exit /b 1

:end
echo.
echo [SUCCESS] Deployment completed successfully!
echo.
echo 📋 Deployment Summary:
echo 🔧 Backend (Railway): Check Railway dashboard for URL
echo 🎨 Frontend (Vercel): Check Vercel dashboard for URL
echo.
echo 🔍 Next Steps:
echo 1. Test your deployed application
echo 2. Set up custom domains if needed
echo 3. Configure monitoring and alerts
echo 4. Set up SSL certificates
echo.
echo [SUCCESS] Happy deploying! 🚀
pause
