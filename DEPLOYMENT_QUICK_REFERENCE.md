# ⚡ Deployment Quick Reference

## 🚀 Railway Backend (5 Steps)

### 1. Create Account & Project
- Go to: https://railway.app
- Sign up with GitHub
- Click "New Project" → "Deploy from GitHub repo"
- Select: `Advanced-Calendar`

### 2. Configure Service
- **Root Directory:** `Boom-Booking-Isolate/backend`
- Click "Deploy"

### 3. Add Database
- Click "New Service" → "Database" → "PostgreSQL"
- Wait for creation (30-60 seconds)

### 4. Set Environment Variables
Go to backend service → Variables tab, add:
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secure-jwt-secret-change-this-now
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=*
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

### 5. Get Railway URL
- Copy URL from service dashboard
- Example: `https://your-app-name.railway.app`

---

## 🎨 Vercel Frontend (4 Steps)

### 1. Create Account & Project
- Go to: https://vercel.com
- Sign up with GitHub
- Click "New Project" → "Import Git Repository"
- Select: `Advanced-Calendar`

### 2. Configure Project
- **Project Name:** `boom-booking-frontend`
- **Root Directory:** `Boom-Booking-Isolate`
- **Framework:** Vite (auto-detected)

### 3. Set Environment Variables
Add these variables:
```
VITE_API_BASE_URL=https://your-railway-backend.railway.app/api
VITE_WS_URL=https://your-railway-backend.railway.app
VITE_APP_NAME=Boom Karaoke Booking
VITE_APP_VERSION=1.0.0
```

### 4. Deploy
- Click "Deploy"
- Wait for build (2-3 minutes)
- Copy Vercel URL

---

## 🔄 Update CORS

1. Go back to Railway dashboard
2. Backend service → Variables tab
3. Update `CORS_ORIGIN` to your Vercel URL:
   ```
   https://boom-booking-frontend.vercel.app
   ```

---

## 🧪 Quick Tests

### Backend Health Check
```
https://your-railway-backend.railway.app/api/health
```
Expected: JSON response with health status

### Frontend Test
```
https://boom-booking-frontend.vercel.app
```
Expected: Application loads without errors

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Build Failed | Check logs, verify dependencies |
| Database Error | Wait for PostgreSQL to initialize |
| CORS Error | Update CORS_ORIGIN with exact Vercel URL |
| Environment Variables | Ensure VITE_ prefix for frontend |

---

## 📞 Support

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Check logs** in respective dashboards
- **Test health endpoints** for debugging

---

**Total Deployment Time: ~10-15 minutes** ⏱️
