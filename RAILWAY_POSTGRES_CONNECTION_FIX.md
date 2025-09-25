# Railway PostgreSQL Connection Fix Guide

## Problem Summary
Your application was failing with `ECONNREFUSED ::1:5432` errors because it was trying to connect to localhost instead of Railway's PostgreSQL service.

## Root Cause
- Railway provides a `DATABASE_URL` environment variable containing all connection info
- Your app was using individual environment variables that defaulted to `localhost:5432`
- This caused connection attempts to `::1:5432` (IPv6 localhost) instead of Railway's database

## Solution Implemented

### 1. Updated Database Configuration (`backend/database/postgres.js`)
- Added support for Railway's `DATABASE_URL` environment variable
- Implemented fallback to individual variables for local development
- Added connection retry logic with exponential backoff
- Enhanced error logging for better debugging

### 2. Updated Environment Configuration (`backend/env.production.railway`)
- Clarified that Railway automatically provides `DATABASE_URL`
- Updated comments to reflect proper usage

## How Railway Database Connection Works

1. **Railway automatically provides `DATABASE_URL`** when you add a PostgreSQL service
2. **Format**: `postgresql://username:password@host:port/database?sslmode=require`
3. **Your app now detects this** and uses it instead of individual variables

## Deployment Steps

### Step 1: Verify Railway PostgreSQL Service
1. Go to your Railway project dashboard
2. Ensure PostgreSQL service is running (should show green status)
3. Check that it's connected to your application service

### Step 2: Check Environment Variables
1. In Railway dashboard, go to your application service
2. Click on "Variables" tab
3. Verify `DATABASE_URL` is present (Railway adds this automatically)
4. Ensure `NODE_ENV=production` is set

### Step 3: Redeploy Application
1. Push your updated code to trigger a new deployment
2. Or manually trigger a redeploy in Railway dashboard
3. Monitor the logs for successful database connection

## Expected Log Output (Success)
```
✅ PostgreSQL connection established successfully
📊 Database: boom_booking
🌐 Environment: production
🚀 Using Railway DATABASE_URL
✅ Multi-tenant database schema created successfully
✅ Default tenant and data created successfully
🚀 Server running on port 5001
```

## Troubleshooting

### If Still Getting Connection Errors

1. **Check Railway PostgreSQL Status**
   - Ensure PostgreSQL service is running
   - Verify it's not in a failed state

2. **Verify Environment Variables**
   ```bash
   # In Railway dashboard, check these variables exist:
   DATABASE_URL=postgresql://...
   NODE_ENV=production
   ```

3. **Check Railway Service Connection**
   - Ensure your app service is connected to PostgreSQL service
   - In Railway dashboard, both services should be linked

4. **Manual Database URL Check**
   - In Railway PostgreSQL service, go to "Connect" tab
   - Copy the connection string
   - Verify it matches your `DATABASE_URL` environment variable

### Common Issues

1. **PostgreSQL Service Not Running**
   - Restart the PostgreSQL service in Railway
   - Check for any error messages in PostgreSQL logs

2. **Wrong Environment Variables**
   - Ensure `NODE_ENV=production` is set
   - Verify `DATABASE_URL` is present and correct

3. **Network Issues**
   - Railway services should be in the same project
   - Check that services are properly linked

## Testing Connection Locally

To test the fix locally with Railway database:

1. **Get Railway Database URL**
   ```bash
   # In Railway PostgreSQL service, copy the connection string
   ```

2. **Set Environment Variable**
   ```bash
   export DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   ```

3. **Run Application**
   ```bash
   cd backend
   npm start
   ```

## Prevention for Future Deployments

1. **Always use `DATABASE_URL`** when available (Railway, Heroku, etc.)
2. **Test database connection** before deploying
3. **Monitor deployment logs** for connection success
4. **Use connection retry logic** for production resilience

## Additional Railway Configuration

### Railway.json Updates
Your `railway.json` is already properly configured:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm ci --only=production"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

### Health Check Endpoint
Ensure your `/api/health` endpoint works for Railway's health checks.

## Success Indicators

✅ **PostgreSQL service**: Running and healthy  
✅ **Application service**: Connected to PostgreSQL  
✅ **Environment variables**: `DATABASE_URL` present  
✅ **Application logs**: Show successful database connection  
✅ **Health check**: Returns 200 OK  

## Next Steps

1. **Redeploy your application** with the updated code
2. **Monitor the logs** for successful connection
3. **Test the application** to ensure it's working properly
4. **Set up monitoring** to prevent future connection issues

---

**Note**: This fix ensures your application properly connects to Railway's PostgreSQL service using the `DATABASE_URL` environment variable that Railway automatically provides.
