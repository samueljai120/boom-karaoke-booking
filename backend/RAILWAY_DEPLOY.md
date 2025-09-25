# 🚀 One-Click Railway Deployment

## Quick Deploy Button

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/samueljai120/Advanced-Calendar/tree/main/Boom-Booking-Isolate/backend)

## Manual Deployment Steps

### 1. Go to Railway Dashboard
- Visit: https://railway.app
- Sign in with GitHub
- Click "New Project" → "Deploy from GitHub repo"

### 2. Select Repository
- Repository: `samueljai120/Advanced-Calendar`
- Root Directory: `Boom-Booking-Isolate/backend`

### 3. Configure Service
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check**: `/api/health`

### 4. Add PostgreSQL Database
- Click "New Service" → "Database" → "PostgreSQL"
- Railway will automatically provide `DATABASE_URL`

### 5. Set Environment Variables
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

### 6. Deploy
- Click "Deploy"
- Wait for deployment to complete
- Note your Railway URL (e.g., `https://your-app-name.railway.app`)

### 7. Configure Frontend
After getting your Railway URL, run:
```bash
cd /path/to/Boom-Booking-Isolate
./configure-frontend.sh https://your-app-name.railway.app
```

## ✅ Success Indicators

Your deployment is successful when you see:
- ✅ PostgreSQL connection established successfully
- ✅ Multi-tenant database schema created successfully
- ✅ Default tenant and data created successfully
- ✅ Production server running on port 5001

## 🔍 Troubleshooting

### Common Issues:
1. **PostgreSQL Connection Error**: Ensure PostgreSQL service is running
2. **Build Failures**: Check Node.js version compatibility
3. **Environment Variables**: Verify all required variables are set
4. **CORS Errors**: Ensure CORS_ORIGIN includes your Vercel domain

### Check Logs:
- Go to Railway dashboard
- Click on your service
- View deployment logs for any errors

## 📞 Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify environment variables
3. Test database connection
4. Check CORS configuration
