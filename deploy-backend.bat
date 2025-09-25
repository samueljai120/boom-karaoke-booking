@echo off
echo 🚀 Deploying Boom Booking Backend to Railway
echo =============================================

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI is not installed. Installing...
    npm install -g @railway/cli
)

REM Navigate to backend directory
cd backend

REM Check if we're logged in to Railway
railway whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please log in to Railway first:
    railway login
)

echo 📦 Deploying backend to Railway...
railway up

echo ✅ Backend deployment initiated!
echo 🔗 Check your Railway dashboard for the deployment URL
echo 📝 Update the API_BASE_URL in your frontend with the new backend URL

pause
