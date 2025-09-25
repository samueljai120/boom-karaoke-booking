# 🚀 Railway CLI Deployment Guide

## Issue: Non-Interactive Mode Detection

The Railway CLI is detecting a non-interactive environment, which prevents browser authentication. Here are several solutions:

## Solution 1: Manual Browser Authentication

### Step 1: Get Railway Token
1. Go to https://railway.app
2. Sign in with your GitHub account
3. Go to your account settings
4. Generate a new API token
5. Copy the token

### Step 2: Set Railway Token
```bash
export RAILWAY_TOKEN=your_token_here
```

### Step 3: Deploy
```bash
railway up
```

## Solution 2: Use Railway Web Interface

### Step 1: Go to Railway Dashboard
- Visit: https://railway.app
- Sign in with GitHub

### Step 2: Create New Project
- Click "New Project" → "Deploy from GitHub repo"
- Select: `samueljai120/Advanced-Calendar`
- Root Directory: `Boom-Booking-Isolate/backend`

### Step 3: Configure Service
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check: `/api/health`

### Step 4: Add PostgreSQL
- Click "New Service" → "Database" → "PostgreSQL"

### Step 5: Set Environment Variables
```env
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secure-jwt-secret-for-production-change-this-now
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=https://boom-booking-frontend-5el8sm1iv-samueljai120s-projects.vercel.app
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
ENABLE_METRICS=true
DEFAULT_TIMEZONE=America/New_York
DEFAULT_CURRENCY=USD
BOOKING_ADVANCE_DAYS=30
BOOKING_MIN_DURATION=60
BOOKING_MAX_DURATION=480
```

## Solution 3: Try Different Terminal

### Option A: Use Terminal App
1. Open Terminal.app (not VS Code terminal)
2. Navigate to the backend directory
3. Run: `railway login`
4. Follow browser authentication

### Option B: Use iTerm2
1. Install iTerm2 if not already installed
2. Open iTerm2
3. Navigate to the backend directory
4. Run: `railway login`

## Solution 4: Railway Template Deploy

### One-Click Deploy
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/samueljai120/Advanced-Calendar/tree/main/Boom-Booking-Isolate/backend)

## Solution 5: Manual Project Setup

### Step 1: Create Project Manually
1. Go to https://railway.app
2. Create new project
3. Connect to GitHub repository
4. Select the backend directory

### Step 2: Configure Environment
1. Add PostgreSQL database
2. Set all environment variables
3. Deploy

## Troubleshooting

### Common Issues:
1. **Non-interactive mode**: Use web interface or different terminal
2. **Authentication failed**: Check GitHub permissions
3. **Build failures**: Verify Node.js version
4. **Database connection**: Ensure PostgreSQL is running

### Check Railway Status:
```bash
railway status
```

### View Logs:
```bash
railway logs
```

## Next Steps After Deployment

1. **Get Railway URL**: Note your backend URL
2. **Configure Frontend**: Run `./configure-frontend.sh YOUR_RAILWAY_URL`
3. **Test Deployment**: Visit both URLs and test functionality
4. **Monitor**: Check Railway and Vercel dashboards

## Recommended Approach

Given the CLI issues, I recommend using the **Railway Web Interface** (Solution 2) as it's the most reliable method.
