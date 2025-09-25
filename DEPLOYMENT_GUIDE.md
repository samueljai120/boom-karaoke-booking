# 🚀 Production Deployment Guide

This guide will help you deploy the Boom Karaoke Booking System to Railway (backend) and Vercel (frontend).

## 📋 Prerequisites

- Node.js 18+ installed
- npm installed
- GitHub account
- Railway account (free tier available)
- Vercel account (free tier available)

## 🎯 Quick Deployment

### Option 1: Automated Script (Recommended)

**Windows:**
```bash
cd Boom-Booking-Isolate
deploy-production.bat
```

**Linux/Mac:**
```bash
cd Boom-Booking-Isolate
chmod +x deploy-production.sh
./deploy-production.sh
```

### Option 2: Manual Deployment

## 🔧 Backend Deployment (Railway)

### 1. Prepare Backend

```bash
cd Boom-Booking-Isolate/backend
npm install
```

### 2. Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize Project:**
   ```bash
   railway init
   ```

4. **Add PostgreSQL Database:**
   - Go to Railway dashboard
   - Click "New Service" → "Database" → "PostgreSQL"
   - Railway will automatically provide `DATABASE_URL`

5. **Set Environment Variables:**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=5000
   railway variables set JWT_SECRET=your-super-secure-jwt-secret-change-this
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
   ```

6. **Deploy:**
   ```bash
   railway up
   ```

7. **Get Railway URL:**
   ```bash
   railway domain
   ```

## 🎨 Frontend Deployment (Vercel)

### 1. Prepare Frontend

```bash
cd Boom-Booking-Isolate
npm install
```

### 2. Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Set Environment Variables:**
   ```bash
   vercel env add VITE_API_BASE_URL production
   # Enter: https://your-railway-backend.railway.app/api
   
   vercel env add VITE_WS_URL production
   # Enter: https://your-railway-backend.railway.app
   
   vercel env add VITE_APP_NAME production
   # Enter: Boom Karaoke Booking
   
   vercel env add VITE_APP_VERSION production
   # Enter: 1.0.0
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

5. **Get Vercel URL:**
   ```bash
   vercel ls
   ```

## 🔄 Update CORS Settings

After deploying both services, update the CORS settings:

```bash
cd Boom-Booking-Isolate/backend
railway variables set CORS_ORIGIN=https://your-vercel-app.vercel.app
```

## 📊 Configuration Files

### Railway Configuration (`railway.json`)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
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

### Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "name": "boom-booking-frontend",
  "buildCommand": "npm ci && npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://your-railway-backend.railway.app/api",
    "VITE_WS_URL": "https://your-railway-backend.railway.app",
    "VITE_APP_NAME": "Boom Karaoke Booking",
    "VITE_APP_VERSION": "1.0.0"
  },
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ],
  "trailingSlash": false,
  "cleanUrls": true,
  "regions": ["iad1"]
}
```

## 🔍 Health Checks

### Backend Health Check
- **Endpoint:** `/api/health`
- **Expected Response:** `200 OK` with health status
- **Railway Configuration:** Automatically configured in `railway.json`

### Frontend Health Check
- **Endpoint:** Root URL
- **Expected Response:** Application loads successfully
- **Vercel Configuration:** Automatic health checks

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Database Connection Issues:**
   - Ensure PostgreSQL service is running in Railway
   - Verify `DATABASE_URL` is set correctly
   - Check database initialization scripts

3. **CORS Errors:**
   - Update `CORS_ORIGIN` with correct Vercel URL
   - Ensure both services are deployed
   - Check environment variables

4. **Environment Variable Issues:**
   - Verify all required variables are set
   - Check variable names and values
   - Ensure no typos in variable names

### Debug Commands

```bash
# Check Railway logs
railway logs

# Check Vercel logs
vercel logs

# Test backend health
curl https://your-railway-backend.railway.app/api/health

# Test frontend
curl https://your-vercel-app.vercel.app
```

## 📈 Monitoring

### Railway Monitoring
- **Dashboard:** https://railway.app/dashboard
- **Metrics:** CPU, Memory, Network usage
- **Logs:** Real-time application logs
- **Alerts:** Configure alerts for errors

### Vercel Monitoring
- **Dashboard:** https://vercel.com/dashboard
- **Analytics:** Page views, performance metrics
- **Functions:** Serverless function monitoring
- **Alerts:** Configure alerts for deployments

## 🔐 Security Considerations

1. **Environment Variables:**
   - Use strong, unique JWT secrets
   - Never commit sensitive data to Git
   - Rotate secrets regularly

2. **CORS Configuration:**
   - Use specific origins, not wildcards in production
   - Update CORS when changing domains

3. **Database Security:**
   - Use SSL connections
   - Implement proper access controls
   - Regular backups

4. **API Security:**
   - Rate limiting enabled
   - Input validation
   - XSS protection headers

## 🎉 Success Indicators

Your deployment is successful when:

- ✅ Backend responds to health checks
- ✅ Frontend loads without errors
- ✅ Database connection established
- ✅ CORS configured correctly
- ✅ Environment variables set
- ✅ SSL certificates active
- ✅ Monitoring configured

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review deployment logs
3. Verify environment variables
4. Test individual components
5. Check service status pages

## 🔄 Updates and Maintenance

### Updating Backend
```bash
cd Boom-Booking-Isolate/backend
git pull origin main
railway up
```

### Updating Frontend
```bash
cd Boom-Booking-Isolate
git pull origin main
vercel --prod
```

### Database Migrations
```bash
cd Boom-Booking-Isolate/backend
railway run npm run migrate:up
```

---

**Happy Deploying! 🚀**
